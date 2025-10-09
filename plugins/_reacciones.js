// plugins/reacciones.js

let handler = async (m, { conn, isAdmin }) => {
  if (!m.isGroup) return; // Solo en grupos
  if (!isAdmin) return conn.reply(m.chat, '⚠️ Solo administradores pueden activar/desactivar reacciones.', m);

  let chat = global.db.data.chats[m.chat];
  chat.reaction = !chat.reaction;

  conn.reply(m.chat, `⚡️ La función *reacciones* se *${chat.reaction ? 'activó' : 'desactivó'}* para este grupo`, m);
};

handler.all = async (m, { conn }) => {
  try {
    if (!m.isGroup) return; // Solo grupos
    let chat = global.db.data.chats[m.chat];
    if (!chat?.reaction) return; // Solo si está activado

    if (!m.text) return; // Solo texto

    // Palabras clave y reacciones
    const reactions = {
      'hola': '👋 ¡Hola!',
      'gracias': '🙏 De nada!',
      'feliz': '😄 ¡Me alegra!',
      'triste': '😢 Oh no...',
      'spam': '⚠️ Cuidado con el spam!'
    };

    let msgLower = m.text.toLowerCase();

    for (let word in reactions) {
      if (msgLower.includes(word)) {
        await conn.sendMessage(m.chat, { text: reactions[word] });
        break; // Solo reaccionar una vez por mensaje
      }
    }

  } catch (e) {
    console.log('Error en plugin reacciones:', e);
  }
};

handler.help = ['reacciones'];
handler.tags = ['group', 'fun'];
handler.command = ['reacciones'];

export default handler; 
