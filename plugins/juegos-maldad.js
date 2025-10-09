// plugins/juegos/reacciones.js

let handler = async (m, { conn }) => {
  try {
    if (!m.isGroup) return; // Solo grupos

    const chat = global.db.data.chats[m.chat];
    if (!chat.juegos) return; // Solo si los juegos están activados

    // Extraer texto del mensaje, soportando varios tipos
    let text = '';
    if (m.message?.conversation) text = m.message.conversation.toLowerCase();
    else if (m.message?.extendedTextMessage?.text) text = m.message.extendedTextMessage.text.toLowerCase();
    else return;

    // Palabras clave y sus mensajes
    const palabrasClave = {
      '.zorra': [
        `😏 @user1 se acostó con @user2 😜`,
        `🔥 @user1 tuvo un encuentro con @user2 😎`,
        `💥 @user1 y @user2 hicieron travesuras juntos 😏`
      ],
      '.zorro': [
        `🦊 @user1 es un pillo junto a @user2 😏`,
        `😎 @user1 y @user2 planean algo travieso 🐾`
      ],
      '.guapo': [
        `😍 @user1 tiene un ${Math.floor(Math.random() * 101)}% de nivel guapo según @user2 😎`
      ],
      '.tonto': [
        `🤪 @user1 fue engañado por @user2 😅`,
        `😂 @user1 y @user2 hicieron el ridículo juntos`
      ]
    };

    // Revisar si el mensaje contiene alguna palabra clave
    const palabra = Object.keys(palabrasClave).find(p => text.includes(p));
    if (!palabra) return;

    // Obtener participantes del grupo
    const groupMetadata = await conn.groupMetadata(m.chat);
    const participants = groupMetadata.participants.map(u => u.id);

    // Filtrar al que escribió el mensaje y al bot
    const others = participants.filter(u => u !== m.sender && u !== conn.user.jid);
    if (others.length === 0) return;

    // Usuario al azar
    const randomUser = others[Math.floor(Math.random() * others.length)];

    // Escoger mensaje al azar
    let mensaje = palabrasClave[palabra][Math.floor(Math.random() * palabrasClave[palabra].length)];

    // Reemplazar placeholders con menciones
    mensaje = mensaje.replace('@user1', `@${m.sender.split('@')[0]}`)
                     .replace('@user2', `@${randomUser.split('@')[0]}`);

    // Enviar mensaje sin citar
    await conn.sendMessage(m.chat, { text: mensaje, mentions: [m.sender, randomUser] });

  } catch (e) {
    console.log('Error en plugin de reacciones:', e);
  }
};

handler.help = ['.zorra', '.zorro', '.guapo', '.tonto'];
handler.tags = ['fun', 'juegos'];
handler.command = ['.zorra', '.zorro', '.guapo', '.tonto'];

export default handler;
