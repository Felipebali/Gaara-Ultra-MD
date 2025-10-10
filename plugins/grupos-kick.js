const handler = async (m, { conn, isAdmin, isOwner }) => {
  const emoji = '🔪';

  // Solo admins o dueños del bot
  if (!isAdmin && !isOwner) return conn.reply(m.chat, '❌ Solo admins del grupo o dueños del bot pueden usar este comando.', m);

  // Detectar usuario a expulsar
  let user = m.mentionedJid?.[0] || m.quoted?.sender;
  if (!user) return conn.reply(m.chat, '📌 Debes mencionar o citar un mensaje para expulsar.', m);

  // Normalizar JIDs
  const normalize = jid => jid?.includes('@') ? jid : jid + '@s.whatsapp.net';
  user = normalize(user);
  const botJid = normalize(conn.user.jid);

  // Metadata del grupo
  const groupInfo = await conn.groupMetadata(m.chat);
  const ownerGroup = normalize(groupInfo.owner || (m.chat.split`-`[0] + '@s.whatsapp.net'));

  // Lista de protegidos (dueño del bot + tu número Feli + dueño del grupo + el bot)
  const protectedList = [
    botJid,
    ownerGroup,
    '+59898719147@s.whatsapp.net' // tu número protegido
  ];

  if (protectedList.includes(user)) {
    return conn.reply(m.chat, 'Es imposible eliminar a alguien protegido. 😎', m);
  }

  // Comprobar si el objetivo es admin del grupo
  const participant = groupInfo.participants.find(p => p.jid === user) || {};
  const targetIsAdmin = !!(participant.admin);

  // Si el objetivo es admin y quien ejecuta no es owner => denegar
  if (targetIsAdmin && !isOwner) {
    return conn.reply(m.chat, '❌ No puedes expulsar a otro administrador. Solo los dueños del bot pueden hacerlo.', m);
  }

  // Expulsar y limpiar chat
  try {
    await conn.groupParticipantsUpdate(m.chat, [user], 'remove');
    try { await m.react(emoji); } catch (e) {}
    try { await conn.deleteMessage(m.chat, m.key); } catch (e) {}
  } catch (err) {
    console.log('Error expulsando:', err);
    return conn.reply(m.chat, '❌ Ocurrió un error al intentar expulsar. Asegúrate de que el bot sea administrador y tenga permisos.', m);
  }
};

handler.help = ['k'];
handler.tags = ['grupo'];
handler.command = ['k','echar','hechar','sacar','ban'];
handler.admin = true;
handler.group = true;
handler.register = true;
handler.botAdmin = true;

export default handler;
