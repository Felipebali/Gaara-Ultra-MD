// plugins/tagall.js
let handler = async function (m, { conn, groupMetadata }) {
  if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos.');

  const participantes = groupMetadata?.participants || [];
  const mencionados = participantes.map(p => p.id).filter(Boolean);

  // Mensaje con @all
  let listaUsuarios = mencionados.map(jid => `┃ ⚡ @${jid.split('@')[0]}`).join('\n');

  const mensaje = [
    '╭━━━〔 𝗙𝗲𝗹𝗶𝘅𝗖𝗮𝘁-𝗕𝗼𝘁 〕━━━⬣',
    '┃ *🔥 ¡Invocación completada! 🔥*',
    '┃ 📌 Todos los usuarios del chat han sido invocados:',
    listaUsuarios,
    '╰━━━━━━━━━━━━━━━━━━━━⬣'
  ].join('\n');

  const imagenURL = 'https://files.catbox.moe/cnl455.jpg';

  await conn.sendMessage(
    m.chat,
    { 
      image: { url: imagenURL },
      caption: mensaje,
      mentions: mencionados
    },
    { quoted: m }
  );

  // Reacción al mensaje
  await conn.sendMessage(m.chat, { react: { text: '📢', key: m.key } });
};

handler.command = ['invocar', 'hidetag', 'tag', 'tagall'];
handler.help = ['invocar', 'tagall'];
handler.tags = ['grupos'];
handler.group = true;
handler.admin = false; // cualquiera puede usarlo
handler.botAdmin = false;

export default handler;
