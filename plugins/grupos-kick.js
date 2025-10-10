const handler = async (m, { conn, isAdmin, isOwner }) => {
  const emoji = '😎';

  // Solo admins o dueños del bot
  if (!isAdmin && !isOwner) return conn.reply(m.chat, `❌ Solo admins o dueños pueden usar esto.`, m);

  // Detectar usuario a expulsar
  let user = m.mentionedJid?.[0] || m.quoted?.sender;
  if (!user) return conn.reply(m.chat, `📌 Debes mencionar o citar un mensaje para expulsar.`, m);

  // Validaciones básicas
  const groupInfo = await conn.groupMetadata(m.chat);
  const ownerGroup = groupInfo.owner || m.chat.split`-`[0] + '@s.whatsapp.net';
  const ownerBot = global.owner.map(o => o[0] + '@s.whatsapp.net');

  if ([conn.user.jid, ownerGroup, ...ownerBot].includes(user)) 
    return conn.reply(m.chat, `❌ No puedo expulsar a este usuario.`, m);

  // Expulsar
  await conn.groupParticipantsUpdate(m.chat, [user], 'remove');

  // Reaccionar con emoji
  await m.react(emoji);

  // Borrar mensaje del comando para dejar el chat limpio
  try {
    await conn.deleteMessage(m.chat, m.key);
  } catch (e) {
    console.log('No se pudo borrar el mensaje del comando:', e);
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
