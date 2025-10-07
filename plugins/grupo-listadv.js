// plugins/warnlist.js
let handler = async (m, { conn }) => {
    if (!m.isGroup) return conn.reply(m.chat, '❌ Solo en grupos.', m);

    const chatId = m.chat;

    // Asegurar que exista la estructura
    if (!global.db.data.chats[chatId]) global.db.data.chats[chatId] = {};
    if (!global.db.data.chats[chatId].warns) global.db.data.chats[chatId].warns = {};

    const warns = global.db.data.chats[chatId].warns;

    if (Object.keys(warns).length === 0) {
        return conn.reply(chatId, 'ℹ️ No hay advertencias.', m);
    }

    let text = '⚠️ *Advertencias actuales:*\n';
    const mentions = [];
    for (let jid in warns) {
        mentions.push(jid);
        const nombre = conn.getName(jid);
        text += `• ${nombre}: ${warns[jid]}/5\n`;
    }

    await conn.sendMessage(chatId, { text, mentions }, { quoted: m });
};

handler.help = ['warnlist'];
handler.tags = ['admin'];
handler.command = ['warnlist','advertencias','listadv'];
handler.group = true;
handler.admin = true;
handler.register = true;

export default handler;
