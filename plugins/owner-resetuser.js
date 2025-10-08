const handler = async (m, { conn, text }) => {
    const emoji = '⚠️';
    const done = '✅';
    const numberPattern = /\d+/g;
    let user = '';

    // Detectar usuario por número o mensaje citado
    const numberMatches = text?.match(numberPattern);
    if (numberMatches) {
        const number = numberMatches.join('');
        user = number + '@s.whatsapp.net';
    } else if (m.quoted && m.quoted.sender) {
        user = m.quoted.sender;
    } else {
        return conn.sendMessage(m.chat, `${emoji} Formato de usuario no reconocido. Responda a un mensaje, etiquete a un usuario o escriba su número de usuario.`);
    }

    const userNumber = user.split('@')[0];

    // Verificar que el usuario exista en la base de datos
    if (!global.db.data.users[user]) {
        return conn.sendMessage(m.chat, `${emoji} El usuario @${userNumber} no se encuentra en mi base de datos.`, { mentions: [user] });
    }

    // Eliminar todos los datos del usuario
    delete global.db.data.users[user];

    // Mensaje de éxito
    conn.sendMessage(m.chat, `${done} Éxito. Todos los datos del usuario @${userNumber} fueron eliminados de mi base de datos.`, { mentions: [user] });
};

handler.tags = ['owner'];
handler.command = ['restablecerdatos','deletedatauser','resetuser','borrardatos'];
handler.owner = true; // SOLO owner

export default handler;
