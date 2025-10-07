// plugins/warn.js
let handler = async (m, { conn, text }) => {
    if (!m.isGroup) return conn.reply(m.chat, '❌ Este comando solo funciona en grupos.', m);
    if (!m.mentionedJid || m.mentionedJid.length === 0) return conn.reply(m.chat, '❌ Menciona al usuario con *@user*', m);

    const chatId = m.chat;
    if (!global.db.data.chats[chatId]) global.db.data.chats[chatId] = {};
    if (!global.db.data.chats[chatId].warns) global.db.data.chats[chatId].warns = {};

    const warnedUser = m.mentionedJid[0];
    const reason = text ? text : 'Sin motivo';

    // Inicializar advertencias
    if (!global.db.data.chats[chatId].warns[warnedUser]) {
        global.db.data.chats[chatId].warns[warnedUser] = 0;
    }

    // Aumentar advertencia
    global.db.data.chats[chatId].warns[warnedUser] += 1;
    const warns = global.db.data.chats[chatId].warns[warnedUser];

    if (warns >= 5) {
        // Eliminar usuario y resetear advertencias
        try {
            await conn.groupParticipantsUpdate(chatId, [warnedUser], 'remove');
            global.db.data.chats[chatId].warns[warnedUser] = 0;
            return conn.reply(chatId, `❌ El usuario @${warnedUser.split('@')[0]} ha sido eliminado por llegar a 5 advertencias.`, m, { mentions: [warnedUser] });
        } catch (e) {
            return conn.reply(chatId, `⚠️ No se pudo eliminar al usuario @${warnedUser.split('@')[0]}.`, m, { mentions: [warnedUser] });
        }
    } else {
        return conn.reply(chatId, `⚠️ Usuario @${warnedUser.split('@')[0]} advertido.\nMotivo: ${reason}\nAdvertencias: ${warns}/5`, m, { mentions: [warnedUser] });
    }
};

handler.help = ['warn @user [motivo]'];
handler.tags = ['admin'];
handler.command = ['warn'];
handler.group = true;
handler.admin = true;
handler.register = true;

export default handler;
