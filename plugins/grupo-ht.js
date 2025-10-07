let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!m.isGroup) 
    return conn.reply(m.chat, '⚠️ Este comando solo funciona en grupos.', m);

  if (!args[0])
    return conn.reply(m.chat, `⚠️ Usa: ${usedPrefix}${command} <mensaje>`, m);

  // Obtener todos los participantes del grupo
  const groupMetadata = await conn.groupMetadata(m.chat);
  const mentions = groupMetadata.participants.map(p => p.id);

  // Mensaje con estilo FelixCat-Bot
  let mensaje = `
😸 *¡Maullidos para todos!* 🐾
💬 ${args.join(' ')}
🎀 Enviado por: @${m.sender.split('@')[0]}
`;

  // Enviar mensaje con hidetag
  await conn.sendMessage(m.chat, {
    text: mensaje.trim(),
    mentions
  }, { quoted: m });
};

handler.command = ['ht'];
handler.help = ['ht <mensaje>'];
handler.tags = ['group'];
handler.group = true;
handler.admin = true; // Solo admins pueden usarlo
export default handler;
