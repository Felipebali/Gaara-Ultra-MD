const handler = async (m, { conn, text }) => {
    try {
        const emojis = '🚫'; 
        const done = '✅'; 

        const db = global.db.data.users || (global.db.data.users = {});

        if (!text) {
            return await conn.reply(m.chat, `*${emojis} Debes escribir el número o mencionar al usuario que deseas desbanear.*\nEjemplo: .unbanuser 59898719147`, m);
        }

        // Obtener número del usuario del texto
        const numberMatch = text.match(/\d+/g);
        if (!numberMatch) {
            return await conn.reply(m.chat, `*${emojis} Formato de número inválido.*`, m);
        }

        const user = numberMatch.join('') + '@s.whatsapp.net';

        // Verificar que el usuario exista en la base de datos
        if (!db[user]) {
            return await conn.reply(m.chat, `*⚠️ El usuario @${user.split('@')[0]} no está registrado en la base de datos.*`, m, { mentions: [user] });
        }

        // Desbanear usuario
        db[user].banned = false;
        db[user].banReason = '';
        db[user].bannedBy = null;

        const userName = await conn.getName(user);
        await conn.sendMessage(m.chat, { 
            text: `*${done} El usuario* *@${user.split('@')[0]}* (*${userName}*) *ha sido desbaneado.*`, 
            mentions: [user] 
        });

        // Guardar cambios en la base de datos
        if (global.db.write) await global.db.write();

    } catch (e) {
        console.error(e);
        await conn.reply(m.chat, `✖️ *Error en unbanuser:* ${e.message}`, m);
    }
};

handler.help = ['unbanuser <número>'];
handler.command = ['unbanuser'];
handler.tags = ['owner'];
handler.rowner = true; // Solo owner

export default handler;
