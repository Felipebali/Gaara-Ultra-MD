// plugins/antitemu.js

const temuShareRegex = /(?:https:\/\/share\.temu\.com\/|https:\/\/temu\.com\/s\/)[a-zA-Z0-9]{10,}/i;

let handler = async (m, { conn }) => {
    if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos.');
    if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {};
    
    let chat = global.db.data.chats[m.chat];
    chat.antitemu = !chat.antitemu;
    
    m.reply(`✅ El *antitemu* ha sido ${chat.antitemu ? '🟢 activado' : '🔴 desactivado'}.`);
};

handler.command = ['antitemu'];
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;
