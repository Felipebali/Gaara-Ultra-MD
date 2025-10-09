// plugins/juegos-maldad.js

let handler = async (m, { conn }) => {
  try {
    if (!m.isGroup) return; // Solo grupos

    const chat = global.db.data.chats[m.chat];
    if (!chat.juegos) return; // Verificar si los juegos están activados

    const text = m.text?.toLowerCase();
    if (!text) return;

    // Lista de palabras clave y sus mensajes
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

    const groupMetadata = await conn.groupMetadata(m.chat);
    const participants = groupMetadata.participants.map(u => u.id);

    // Quitar al bot y al que escribió el mensaje
    const users = participants.filter(u => u !== m.sender && u !== conn.user.jid);
    if (users.length === 0) return;

    // Elegir un usuario al azar diferente al que escribió
    const randomUser = users[Math.floor(Math.random() * users.length)];

    // Elegir un mensaje al azar de la palabra clave
    let mensaje = palabrasClave[palabra][Math.floor(Math.random() * palabrasClave[palabra].length)];

    // Reemplazar placeholders con usuarios
    mensaje = mensaje.replace('@user1', `@${m.sender.split('@')[0]}`)
                     .replace('@user2', `@${randomUser.split('@')[0]}`);

    // Enviar mensaje mencionando a ambos
    await conn.sendMessage(m.chat, {
      text: mensaje,
      mentions: [m.sender, randomUser]
    });

  } catch (e) {
    console.log('Error en plugin de reacciones:', e);
  }
};

handler.help = ['zorra', 'zorro', 'guapo', 'tonto'];
handler.tags = ['fun', 'juegos'];
handler.command = ['zorra', 'zorro', 'guapo', 'tonto'];

export default handler;
