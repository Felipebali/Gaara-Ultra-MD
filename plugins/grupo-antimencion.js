// plugins/antimencion.js

// Comando para activar/desactivar antimención
let commandHandler = async (m, { conn, usedPrefix }) => {
    if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {};
    const chatSettings = global.db.data.chats[m.chat];

    chatSettings.antimencion = !chatSettings.antimencion;

    await conn.sendMessage(m.chat, { 
        text: chatSettings.antimencion 
            ? `✅ Antimención activada` 
            : `⚠️ Antimención desactivada`
    }, { quoted: m });
};

commandHandler.command = ['antimencion'];
commandHandler.group = true;

export default commandHandler;
