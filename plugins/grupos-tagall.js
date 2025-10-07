// plugins/tagall.js
let handler = async function (m, { conn, groupMetadata }) {
  if (!m.isGroup) return;

  // Verificar si está activado el tagall
  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {};
  const chatSettings = global.db.data.chats[m.chat];

  if (chatSettings.antitagall) {
    // Si antiTagAll está activado, bloqueamos
    return await conn.sendMessage(m.chat, {
      text: `❌ @${m.sender.split('@')[0]}, el TagAll está desactivado en este grupo.`,
      mentions: [m.sender]
    }, { quoted: m });
  }

  const participantes = groupMetadata?.participants || [];
  const mencionados = participantes.map(p => p.id).filter(Boolean);

  // Mensaje con @all
  let listaUsuarios = mencionados.map(jid => `┃ ⚡ @${jid.split('@')[0]}`).join('\n');

  const mensaje = [
    '╭━━━〔 𝗙𝗲𝗹𝗶𝘅𝗖𝗮𝘁-𝗕𝗼𝘁 〕━━━⬣',
    '┃ 🔥 ¡Invocación completada! 🔥',
    '┃ 📌 Todos los usuarios del chat han sido invocados:',
    listaUsuarios,
    '╰━━━━━━━━━━━━━━━━━━━━⬣'
  ].join('\n');

  await conn.sendMessage(
    m.chat,
    {
      text: mensaje,
      mentions: mencionados
    }
  );
};

handler.command = ['invocar', 'tag', 'tagall'];
handler.help = ['invocar', 'tagall'];
handler.tags = ['grupos'];
handler.group = true;
handler.admin = false; // cualquiera puede usarlo
handler.botAdmin = false;

export default handler;
