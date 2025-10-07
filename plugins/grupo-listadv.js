// plugins/warnlist.js
let handler = async (m, { conn }) => {
    if (!m.isGroup) return conn.reply(m.chat, '❌ Solo en grupos.', m);

    const chatId = m.chat;
    const warns = global.db.data.chats[chatId]?.warns || {};

    if (Object.keys(warns).length === 0) {
        return conn.reply(chatId, 'ℹ️ No hay advertencias.', m);
    }

    let text = '⚠️ *Advertencias actuales:*\n';
    for (let jid in warns) {
        text += `• ${conn.getName(jid)}: ${warns[jid]}/5\n`;
    }

    await conn.sendMessage(chatId, { text, mentions: Object.keys(warns) }, { quoted: m });
};

handler.help = ['warnlist'];
handler.tags = ['admin'];
handler.command = ['warnlist','advertencias','listadv'];
handler.group = true;
handler.admin = true;
handler.register = true;

export default handler;
