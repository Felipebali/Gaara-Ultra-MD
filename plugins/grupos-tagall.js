// ✦ ᴄᴏᴅɪɢᴏ ᴄʀᴇᴀᴅᴏ ᴘᴏʀ Felix-Cat 😼

let handler = async function (m, { conn, groupMetadata, args, isAdmin, isOwner }) {
  if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos.');

  // Solo admins o owners pueden usarlo
  if (!(isAdmin || isOwner)) {
    global.dfail?.('admin', m, conn);
    throw false;
  }

  const participantes = groupMetadata?.participants || [];
  const mencionados = participantes.map(p => p.id).filter(Boolean);

  const mensajeOpcional = args.length ? args.join(' ') : '✨ *Sin mensaje adicional.*';

  let listaUsuarios = mencionados.map(jid => `┃ ⚡ @${jid.split('@')[0]}`).join('\n');

  const mensaje = [
    '╭━━━〔 𝗙𝗲𝗹𝗶𝘅𝗖𝗮𝘁-𝗕𝗼𝘁 〕━━━⬣',
    `┃ 🔥 ¡Invocación completada por @${m.sender.split('@')[0]}! 🔥`,
    `┃ 📝 Mensaje: ${mensajeOpcional}`,
    '┃ 📌 Si te mencioné es para que hables 🫎:',
    listaUsuarios,
    '╰━━━━━━━━━━━━━━━━━━━━⬣'
  ].join('\n');

  await conn.sendMessage(m.chat, {
    text: mensaje,
    mentions: mencionados.concat(m.sender)
  });
};

handler.command = ['invocar', 'todos', 'llamar'];
handler.help = ['invocar *<mensaje>*'];
handler.tags = ['grupos'];
handler.group = true;
handler.admin = true; // Solo admins pueden usarlo

export default handler;
