// plugins/juegos/zorro.js
let handler = async (m, { conn }) => {
  try {
    if (!m.isGroup) return m.reply('⚠️ Este comando solo funciona en grupos');

    const chat = global.db.data.chats[m.chat];
    if (!chat.juegos) return m.reply('⚠️ Los juegos no están activados en este grupo');

    // Obtener participantes
    const groupMetadata = await conn.groupMetadata(m.chat);
    const participants = groupMetadata.participants.map(u => u.id);

    // Filtrar al que escribió el comando y al bot
    const others = participants.filter(u => u !== m.sender && u !== conn.user.jid);
    if (!others.length) return;

    // Elegir un usuario al azar
    const randomUser = others[Math.floor(Math.random() * others.length)];

    // Mensajes posibles
    const mensajes = [
      `🦊 @${m.sender.split('@')[0]} se hizo amigo de @${randomUser.split('@')[0]} 😏`,
      `😎 @${m.sender.split('@')[0]} le jugó una broma a @${randomUser.split('@')[0]} 🐾`,
      `🔥 @${m.sender.split('@')[0]} y @${randomUser.split('@')[0]} hicieron travesuras juntos`
    ];

    // Elegir mensaje al azar
    const mensaje = mensajes[Math.floor(Math.random() * mensajes.length)];

    // Enviar mensaje sin citar
    await conn.sendMessage(m.chat, { text: mensaje, mentions: [m.sender, randomUser] });

  } catch (e) {
    console.log('Error en comando zorro:', e);
  }
};

handler.help = ['zorro'];
handler.tags = ['fun', 'juegos'];
handler.command = ['zorro']; // prefijo ya lo maneja tu bot

export default handler;
