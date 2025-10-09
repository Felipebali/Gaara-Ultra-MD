// plugins/juegos/reacciones.js
let handler = async (m, { conn }) => {
  try {
    if (!m.isGroup) return; // Solo grupos
    const chat = global.db.data.chats[m.chat];
    if (!chat.juegos) return; // Solo si los juegos están activados

    // Obtener texto sin importar tipo de mensaje
    const type = Object.keys(m.message)[0];
    let text = '';
    if (type === 'conversation') text = m.message.conversation.toLowerCase();
    else if (type === 'extendedTextMessage') text = m.message.extendedTextMessage.text.toLowerCase();
    else return; // No es un mensaje de texto

    // Palabras clave y mensajes
    const palabrasClave = {
      '.zorra': [
        `😏 @user1 se acostó con @user2 😜`,
        `🔥 @user1 tuvo un encuentro con @user2 😎`,
        `💥 @user1 y @user2 hicieron travesuras juntos 😏`
      ],
      '.zorro': [
        `🦊 @user1 es un pillo junto a @user2 😏`,
        `😎 @user1 y @user2 planean algo travieso 🐾`
      ]
      // Podés agregar más palabras aquí
    };

    // Revisar si el mensaje contiene alguna palabra clave
    const palabra = Object.keys(palabrasClave).find(p => text.includes(p));
    if (!palabra) return;

    // Obtener participantes del grupo
    const groupMetadata = await conn.groupMetadata(m.chat);
    const participants = groupMetadata.participants.map(u => u.id);
    const others = participants.filter(u => u !== m.sender && u !== conn.user.jid);
    if (!others.length) return;

    // Usuario al azar
    const randomUser = others[Math.floor(Math.random() * others.length)];

    // Mensaje aleatorio
    let mensaje = palabrasClave[palabra][Math.floor(Math.random() * palabrasClave[palabra].length)];

    // Reemplazar placeholders
    mensaje = mensaje.replace('@user1', `@${m.sender.split('@')[0]}`)
                     .replace('@user2', `@${randomUser.split('@')[0]}`);

    // Enviar mensaje sin citar
    await conn.sendMessage(m.chat, { text: mensaje, mentions: [m.sender, randomUser] });

  } catch (e) {
    console.log('Error en plugin de reacciones:', e);
  }
};

handler.help = ['.zorra', '.zorro'];
handler.tags = ['fun', 'juegos'];
handler.command = ['.zorra', '.zorro'];

export default handler;
