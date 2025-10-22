// plugins/banuser.js
const handler = async (m, { conn, command, text }) => {
  const emoji = '🚫';
  const done = '✅';
  const db = global.db.data.users || (global.db.data.users = {});

  // Determinar usuario a banear
  const userJid =
    m.quoted?.sender ||
    m.mentionedJid?.[0] ||
    (text ? text.replace(/\D/g, '') + '@s.whatsapp.net' : null);

  if (!userJid && command !== 'banlist')
    return await conn.reply(
      m.chat,
      `${emoji} Debes responder, mencionar o escribir el número del usuario.`,
      m
    );

  const who = userJid;
  if (userJid && !db[userJid]) db[userJid] = {};

  // BANUSER
  if (command === 'banuser') {
    db[userJid].banned = true;
    db[userJid].banReason = 'No especificado';
    db[userJid].bannedBy = m.sender;

    await conn.sendMessage(m.chat, {
      text: `${done} *@${who.split('@')[0]}* fue baneado globalmente y será expulsado.`,
      mentions: [userJid],
    });

    // Expulsar de todos los grupos
    const groups = Object.entries(await conn.groupFetchAllParticipating());
    for (const [jid, group] of groups) {
      const isMember = group.participants.some((p) => p.id === userJid);
      if (isMember) {
        try {
          await conn.sendMessage(jid, {
            text: `🚫 *@${who.split('@')[0]}* estaba en la lista negra y fue eliminado automáticamente.`,
            mentions: [userJid],
          });
          await conn.groupParticipantsUpdate(jid, [userJid], 'remove');
          console.log(`[AUTO-KICK] Expulsado ${userJid} de ${group.subject}`);
        } catch (e) {
          console.log(`⚠️ No se pudo expulsar de ${group.subject}: ${e.message}`);
        }
      }
    }
  }

  // UNBANUSER
  else if (command === 'unbanuser') {
    if (!db[userJid]?.banned)
      return await conn.sendMessage(m.chat, {
        text: `${emoji} *@${who.split('@')[0]}* no está baneado.`,
        mentions: [userJid],
      });

    db[userJid].banned = false;
    db[userJid].banReason = '';
    db[userJid].bannedBy = null;

    await conn.sendMessage(m.chat, {
      text: `${done} *@${who.split('@')[0]}* ha sido desbaneado.`,
      mentions: [userJid],
    });
  }

  // CHECKBAN
  else if (command === 'checkban') {
    if (db[userJid]?.banned) {
      const bannedByName = await conn.getName(db[userJid].bannedBy);
      await conn.sendMessage(m.chat, {
        text: `${emoji} *@${who.split('@')[0]}* está baneado.\nBaneado por: ${bannedByName}`,
        mentions: [userJid],
      });
    } else {
      await conn.sendMessage(m.chat, {
        text: `${done} *@${who.split('@')[0]}* no está baneado.`,
        mentions: [userJid],
      });
    }
  }

  // BANLIST
  else if (command === 'banlist') {
    const bannedEntries = Object.entries(db).filter(([jid, data]) => data?.banned);
    if (bannedEntries.length === 0)
      return await conn.sendMessage(m.chat, { text: `${done} No hay usuarios baneados.` });

    const bannedUsersText = await Promise.all(
      bannedEntries.map(async ([jid, data]) => {
        const userName = await conn.getName(jid);
        const bannedByName = await conn.getName(data.bannedBy);
        return `• ${userName} (${jid.split('@')[0]})\n  Baneado por: ${bannedByName}`;
      })
    );

    await conn.sendMessage(m.chat, {
      text: `🚫 *Lista de baneados:*\n\n${bannedUsersText.join('\n\n')}`,
    });
  }

  if (global.db.write) await global.db.write();
};

// 🧨 Auto-expulsar si un baneado habla
handler.before = async function (m, { conn }) {
  if (!m.isGroup || !m.sender) return;
  const db = global.db.data.users || {};
  const userId = m.sender.split('@')[0] + '@s.whatsapp.net';
  const user = db[userId];
  if (user?.banned) {
    try {
      await conn.sendMessage(m.chat, {
        text: `🚫 *@${userId.split('@')[0]}* está en la lista negra y será eliminado.`,
        mentions: [userId],
      });
      await conn.groupParticipantsUpdate(m.chat, [userId], 'remove');
      console.log(`[AUTO-KICK] Eliminado baneado ${userId} del grupo ${m.chat}`);
    } catch (e) {
      console.log('⚠️ Error autoexpulsando baneado:', e.message);
    }
  }
};

// 🚷 Auto-expulsar si un baneado es agregado a un grupo
handler.participantsUpdate = async function (event) {
  const conn = this;
  const { id, participants, action } = event;
  const db = global.db.data.users || {};
  if (action === 'add') {
    for (const user of participants) {
      const userId = user.split('@')[0] + '@s.whatsapp.net';
      const data = db[userId];
      if (data?.banned) {
        try {
          await conn.sendMessage(id, {
            text: `🚫 *@${userId.split('@')[0]}* está en la lista negra y fue eliminado automáticamente.`,
            mentions: [userId],
          });
          await conn.groupParticipantsUpdate(id, [userId], 'remove');
          console.log(`[AUTO-KICK JOIN] ${userId} eliminado del grupo ${id}`);
        } catch (e) {
          console.log(`⚠️ No se pudo expulsar a ${userId}: ${e.message}`);
        }
      }
    }
  }
};

handler.help = ['banuser', 'unbanuser', 'checkban', 'banlist'];
handler.command = ['banuser', 'unbanuser', 'checkban', 'banlist'];
handler.tags = ['owner'];
handler.rowner = true;

export default handler;
