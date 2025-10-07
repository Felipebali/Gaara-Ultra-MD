// plugins/unwarn.js
let handler = async (m, { conn }) => {
    if (!m.isGroup) return conn.reply(m.chat, '❌ Este comando solo funciona en grupos.', m);
    if (!m.mentionedJid || m.mentionedJid.length === 0) return conn.reply(m.chat, '❌ Menciona al usuario con *@user*', m);

    const chatId = m.chat;
    const warnedUser = m.mentionedJid[0];

    if (!global.db.data.chats[chatId]?.warns?.[warnedUser] || global.db.data.chats[chatId].warns[warnedUser] <= 0) {
        return conn.reply(chatId, `ℹ️ El usuario @${warnedUser.split('@')[0]} no tiene advertencias.`, m, { mentions: [warnedUser] });
    }

    global.db.data.chats[chatId].warns[warnedUser] -= 1;
    const warns = global.db.data.chats[chatId].warns[warnedUser];

    conn.reply(chatId, `✅ Se ha eliminado una advertencia de @${warnedUser.split('@')[0]}.\nAdvertencias restantes: ${warns}/5`, m, { mentions: [warnedUser] });
};

handler.help = ['unwarn @user'];
handler.tags = ['admin'];
handler.command = ['unwarn', 'ds'];
handler.group = true;
handler.admin = true;
handler.register = true;

export default handler;
