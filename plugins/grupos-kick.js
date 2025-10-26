const handler = async (m, { conn, isAdmin }) => {
  const emoji = '🔪';
  const sender = m.sender.replace(/\D/g, '');

  const groupInfo = await conn.groupMetadata(m.chat);
  const ownerGroup = groupInfo.owner ? groupInfo.owner.replace(/\D/g, '') : null;
  const botJid = conn.user.jid.replace(/\D/g, '');

  const ownersBot = ['59898719147', '59896026646']; // dueños del bot

  // ---------- PERMISO ----------
  if (!isAdmin && !ownersBot.includes(sender) && sender !== ownerGroup) {
    return conn.reply(m.chat, '❌ Solo admins, el dueño del grupo o los dueños del bot pueden usar este comando.', m);
  }

  // ---------- DETECTAR USUARIO ----------
  let user = m.mentionedJid?.[0] || m.quoted?.sender;
  if (!user) return conn.reply(m.chat, '📌 Debes mencionar o citar un mensaje para expulsar.', m);

  const normalize = jid => String(jid || '').replace(/\D/g, '');
  const userNorm = normalize(user);

  const protectedList = [...ownersBot, botJid, ownerGroup].filter(Boolean);

  // ---------- INTENTO DE EXPULSAR AL DUEÑO DEL GRUPO ----------
  if (userNorm === ownerGroup && sender !== ownerGroup && !ownersBot.includes(sender)) {
    const userName = '@' + user.split('@')[0];
    return conn.sendMessage(m.chat, {
      text: `😏 Tranquilo campeón... ${userName} es el dueño del grupo.\nNi los dioses del código pueden echarlo.`,
      mentions: [user]
    });
  }

  // ---------- PROTEGIDOS ----------
  if (protectedList.includes(userNorm)) {
    return conn.reply(m.chat, '😎 Es imposible eliminar a alguien protegido.', m);
  }

  // ---------- EXPULSAR ----------
  try {
    await conn.groupParticipantsUpdate(m.chat, [user], 'remove');

    // Reacción
    try { await m.react(emoji); } catch {}

    // ---------- MENSAJE CLICKEABLE ----------
    const userName = '@' + user.split('@')[0];
    await conn.sendMessage(m.chat, {
      text: `🚫 ${userName} fue expulsado del grupo.`,
      mentions: [user]
    });

  } catch (err) {
    console.log('Error expulsando:', err);
    return conn.reply(
      m.chat,
      '❌ No se pudo expulsar al usuario. Asegúrate de que el bot sea administrador y tenga permisos.',
      m
    );
  }
};

handler.help = ['k'];
handler.tags = ['grupo'];
handler.command = ['k', 'echar', 'hechar', 'sacar', 'ban'];
handler.admin = true;
handler.group = true;
handler.register = true;
handler.botAdmin = true;

export default handler;
