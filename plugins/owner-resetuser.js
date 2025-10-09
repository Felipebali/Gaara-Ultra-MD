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
        return conn.sendMessage(m.chat, { text: `${emoji} Formato de usuario no reconocido.` });
    }

    const userJid = user.toLowerCase();

    // Verificar que el usuario exista en la base de datos
    if (!global.db.data.users[userJid]) {
        return conn.sendMessage(m.chat, { text: `${emoji} El usuario no se encuentra en la base de datos.` });
    }

    // Eliminar todos los datos del usuario
    delete global.db.data.users[userJid];

    // Eliminar advertencias del usuario en todos los grupos
    for (let chatId in global.db.data.chats) {
        if (global.db.data.chats[chatId].warns && global.db.data.chats[chatId].warns[userJid]) {
            delete global.db.data.chats[chatId].warns[userJid];
        }
    }

    // Guardar cambios en la base de datos
    if (global.db.write) await global.db.write();

    // Mensaje de éxito genérico
    conn.sendMessage(m.chat, { text: `${done} Éxito. Los datos del usuario fueron eliminados de la base de datos.` });
};

handler.tags = ['owner'];
handler.command = ['r','deletedatauser','resetuser','borrardatos'];
handler.owner = true; // SOLO owner

export default handler;
