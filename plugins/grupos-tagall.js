// ✦ Minimalista por Felix-Cat 😼

let handler = async function (m, { conn, groupMetadata, args, isAdmin, isOwner }) {
  if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos.');

  if (!(isAdmin || isOwner)) {
    global.dfail?.('admin', m, conn);
    throw false;
  }

  const participantes = groupMetadata?.participants || [];
  const mencionados = participantes.map(p => p.id).filter(Boolean);

  const mensajeOpcional = args.length ? args.join(' ') : '✨ Sin mensaje adicional.';

  const mensaje = `🔥 @${m.sender.split('@')[0]} ha invocado a todos 🔥
📝 Mensaje: ${mensajeOpcional}

📌 Usuarios mencionados:
${mencionados.map(jid => `⚡ @${jid.split('@')[0]}`).join('\n')}`;

  await conn.sendMessage(m.chat, {
    text: mensaje,
    mentions: mencionados.concat(m.sender)
  });
};

handler.command = ['invocar', 'todos', 'llamar', 'tagall'];
handler.help = ['invocar *<mensaje>*'];
handler.tags = ['grupos'];
handler.group = true;
handler.admin = true; // Solo admins pueden usarlo

export default handler;
