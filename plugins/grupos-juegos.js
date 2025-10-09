// plugins/juegos.js
let handler = async (m, { conn }) => {
try {
const chat = global.db.data.chats[m.chat] || {};
chat.games = !chat.games; // cambia el estado
global.db.data.chats[m.chat] = chat;

const estado = chat.games ? '🟢 Activados' : '🔴 Desactivados';  
    await conn.sendMessage(m.chat, { text: `🎮 Mini-juegos ${estado} en este chat.` });  
} catch (e) {  
    console.error(e);  
    await m.reply('✖️ Error al cambiar el estado de los juegos.');  
}

};

handler.command = ['juegos'];
handler.group = true;
handler.admin = true;

export default handler;
