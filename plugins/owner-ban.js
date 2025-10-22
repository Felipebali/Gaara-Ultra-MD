// plugins/banuser.js
const handler = async (m, { conn, command }) => {
  const emoji = '🚫';
  const done = '✅';
  const db = global.db.data.users || (global.db.data.users = {});

  // Requiere respuesta a un mensaje
  if (['banuser', 'unbanuser', 'checkban'].includes(command)) {
    if (!m.quoted || !m.quoted.sender)
      return await conn.reply(m.chat, `${emoji} Responde a un mensaje del usuario.`, m);
  }

  const userJid = m.quoted?.sender;
  const who = userJid || '';
  const senderName = await conn.getName(m.sender);
  if (userJid && !db[userJid]) db[userJid] = {};

  // BANUSER
  if (command === 'banuser') {
    db[userJid].banned = true;
    db[userJid].banReason = 'No especificado';
    db[userJid].bannedBy = m.sender;

    await conn.sendMessage(m.chat, {
      text: `${done} *@${who.split("@")[0]}* fue baneado globalmente y será expulsado.`,
      mentions: [userJid]
    });

    // Expulsar de todos los grupos
    const groups = Object.entries(await conn.groupFetchAllParticipating());
    for (const [jid, group] of groups) {
      const isMember = group.participants.some(p => p.id === userJid);
      if (isMember) {
        try {
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
    if (!db[userJid].banned)
      return await conn.sendMessage(m.chat, {
        text: `${emoji} *@${who.split("@")[0]}* no está baneado.`,
        mentions: [userJid]
      });

    db[userJid].banned = false;
    db[userJid].banReason = '';
    db[userJid].bannedBy = null;

    await conn.sendMessage(m.chat, {
      text: `${done} *@${who.split("@")[0]}* ha sido desbaneado.`,
      mentions: [userJid]
    });
  }

  // CHECKBAN
  else if (command === 'checkban') {
    if (db[userJid].banned) {
      const bannedByName = await conn.getName(db[userJid].bannedBy);
      await conn.sendMessage(m.chat, {
        text: `${emoji} *@${who.split("@")[0]}* está baneado.\nBaneado por: ${bannedByName}`,
        mentions: [userJid]
      });
    } else {
      await conn.sendMessage(m.chat, {
        text: `${done} *@${who.split("@")[0]}* no está baneado.`,
        mentions: [userJid]
      });
    }
  }

  // BANLIST
  else if (command === 'banlist') {
    const bannedEntries = Object.entries(db).filter(([jid, data]) => data.banned);
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
      text: `🚫 *Lista de baneados:*\n\n${bannedUsersText.join('\n\n')}`
    });
  }

  if (global.db.write) await global.db.write();
};

// 🧨 Auto-expulsar si un baneado habla
handler.before = async function (m, { conn }) {
  if (!m.isGroup || !m.sender) return;

  const db = global.db.data.users || {};
  const user = db[m.sender];

  if (user?.banned) {
    console.log(`[DETECT] ${m.sender} está baneado y habló en ${m.chat}`);

    try {
      await conn.sendMessage(m.chat, {
        text: `🚫 *@${m.sender.split('@')[0]}* está baneado y será eliminado.`,
        mentions: [m.sender]
      });

      await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
      console.log(`[AUTO-KICK] Eliminado baneado ${m.sender} del grupo ${m.chat}`);
    } catch (e) {
      console.log('⚠️ Error autoexpulsando baneado:', e.message);
    }
  }
};

// 🚷 Auto-expulsar si lo agregan a un grupo
handler.participantsUpdate = async function (event) {
  const conn = this;
  const { id, participants, action } = event;
  const db = global.db.data.users || {};

  if (action === 'add') {
    for (const user of participants) {
      const data = db[user];
      if (data?.banned) {
        console.log(`[JOIN-DETECT] ${user} baneado fue agregado en ${id}`);
        try {
          await conn.sendMessage(id, {
            text: `🚫 *@${user.split('@')[0]}* está baneado y fue eliminado automáticamente.`,
            mentions: [user]
          });
          await conn.groupParticipantsUpdate(id, [user], 'remove');
        } catch (e) {
          console.log(`⚠️ No se pudo expulsar a ${user}: ${e.message}`);
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
