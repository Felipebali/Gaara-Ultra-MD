// plugins/banuser.js
function normalizeJid(jid) {
  if (!jid) return null;
  return jid.replace(/@s\.whatsapp\.net$/, '@c.us');
}

const handler = async (m, { conn, command, text }) => {
  const emoji = '🚫';
  const done = '✅';
  const db = global.db.data.users || (global.db.data.users = {});

  // Determinar usuario a banear/desbanear/consultar
  const userJid = normalizeJid(
    m.quoted?.sender || m.mentionedJid?.[0] || (text && command !== 'banlist' ? text.split(' ')[0].replace(/\D/g,'')+'@s.whatsapp.net' : null)
  );
  if (!userJid && command !== 'banlist')
    return await conn.reply(m.chat, `${emoji} Debes responder, mencionar o escribir el número del usuario.`, m);

  if (userJid && !db[userJid]) db[userJid] = {};

  // BANUSER
  if (command === 'banuser') {
    db[userJid].banned = true;
    db[userJid].banReason = 'No especificado';
    db[userJid].bannedBy = m.sender;

    await conn.sendMessage(m.chat, {
      text: `${done} *@${userJid.split("@")[0]}* fue baneado globalmente y será expulsado.`,
      mentions: [userJid]
    });

    // Expulsar de todos los grupos donde esté
    const groups = Object.entries(await conn.groupFetchAllParticipating());
    for (const [jid, group] of groups) {
      const member = group.participants.find(p => normalizeJid(p.id) === userJid);
      if (member) {
        try {
          await conn.sendMessage(jid, {
            text: `🚫 *@${userJid.split("@")[0]}* estaba en la lista negra y fue eliminado automáticamente.`,
            mentions: [userJid]
          });
          await conn.groupParticipantsUpdate(jid, [member.id], 'remove');
          console.log(`[AUTO-KICK] Expulsado ${userJid} de ${group.subject}`);
        } catch (e) {
          console.log(`⚠️ No se pudo expulsar de ${group.subject}: ${e.message}`);
        }
      }
    }
  }

  // UNBANUSER
  else if (command === 'unbanuser') {
    if (!db[userJid]?.banned) return await conn.sendMessage(m.chat, { text: `${emoji} *@${userJid.split("@")[0]}* no está baneado.`, mentions: [userJid] });
    db[userJid].banned = false;
    db[userJid].banReason = '';
    db[userJid].bannedBy = null;

    await conn.sendMessage(m.chat, { text: `${done} *@${userJid.split("@")[0]}* ha sido desbaneado.`, mentions: [userJid] });
  }

  // CHECKBAN
  else if (command === 'checkban') {
    if (db[userJid]?.banned) {
      const bannedByName = await conn.getName(db[userJid].bannedBy);
      await conn.sendMessage(m.chat, { text: `${emoji} *@${userJid.split("@")[0]}* está baneado.\nBaneado por: ${bannedByName}`, mentions: [userJid] });
    } else {
      await conn.sendMessage(m.chat, { text: `${done} *@${userJid.split("@")[0]}* no está baneado.`, mentions: [userJid] });
    }
  }

  // BANLIST con menciones reales
  else if (command === 'banlist') {
    const bannedEntries = Object.entries(db).filter(([jid, data]) => data?.banned);
    if (bannedEntries.length === 0)
      return await conn.sendMessage(m.chat, { text: `${done} No hay usuarios baneados.` });

    let textList = '🚫 *Lista de baneados:*\n\n';
    let mentions = [];

    for (const [jid, data] of bannedEntries) {
      const userName = await conn.getName(jid) || jid.split('@')[0];
      const bannedByName = await conn.getName(data.bannedBy) || jid.split('@')[0];
      textList += `• ${userName} (${jid.split('@')[0]})\n  Baneado por: ${bannedByName}\n\n`;
      mentions.push(jid);
    }

    await conn.sendMessage(m.chat, { text: textList.trim(), mentions });
  }

  if (global.db.write) await global.db.write();
};

// 🧨 Auto-expulsar si un baneado habla
handler.before = async function (m, { conn }) {
  if (!m.isGroup || !m.sender) return;
  const db = global.db.data.users || {};
  const sender = normalizeJid(m.sender);
  if (db[sender]?.banned) {
    try {
      await conn.sendMessage(m.chat, { text: `🚫 *@${sender.split('@')[0]}* está en la lista negra y será eliminado.`, mentions: [sender] });
      await conn.groupParticipantsUpdate(m.chat, [sender], 'remove');
      console.log(`[AUTO-KICK] Eliminado baneado ${sender} del grupo ${m.chat}`);
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
  if (action === 'add' || action === 'invite') {
    for (const user of participants) {
      const normalizedUser = normalizeJid(user);
      if (!db[normalizedUser]) db[normalizedUser] = {};
      if (db[normalizedUser].banned) {
        try {
          await conn.sendMessage(id, { text: `🚫 *@${normalizedUser.split('@')[0]}* está en la lista negra y fue eliminado automáticamente.`, mentions: [normalizedUser] });
          await conn.groupParticipantsUpdate(id, [normalizedUser], 'remove');
          console.log(`[AUTO-KICK JOIN] ${normalizedUser} eliminado del grupo ${id}`);
        } catch (e) {
          console.log(`⚠️ No se pudo expulsar a ${normalizedUser}: ${e.message}`);
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
