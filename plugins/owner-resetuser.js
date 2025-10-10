const handler = async (m, { conn, text }) => {
    const emoji = '⚠️';
    const done = '✅';
    let user = '';

    // Detectar usuario por número o mensaje citado
    const numberMatches = text?.match(/\d+/g);
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

    // Eliminar todas las advertencias del usuario en todos los chats
    Object.values(global.db.data.chats).forEach(chat => {
        if (chat.warns && chat.warns[userJid]) {
            delete chat.warns[userJid];
        }
    });

    // Eliminar al usuario de banlist y lista negra
    if (global.db.data.banlist) delete global.db.data.banlist[userJid];
    if (global.db.data.blacklist) delete global.db.data.blacklist[userJid];

    // Guardar cambios en la base de datos
    if (global.db.write) await global.db.write();

    // Mensaje de éxito
    conn.sendMessage(m.chat, { text: `${done} Éxito. Todos los datos, advertencias, banlist y blacklist del usuario fueron eliminados.` });
};

handler.tags = ['owner'];
handler.command = ['r','deletedatauser','resetuser','borrardatos'];
handler.owner = true;

export default handler;
