// plugins/antilinkmention_event.js

// Evento que elimina menciones si antimención está activado
let eventHandler = async (m, { conn, isGroup }) => {
    if (!isGroup) return;
    if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {};
    const chatSettings = global.db.data.chats[m.chat];

    if (!chatSettings.antimencion) return;

    try {
        if (m.mentionedJid && m.mentionedJid.length > 0) {
            await conn.sendMessage(m.chat, {
                text: `❌ @${m.sender.split('@')[0]}, no se permiten menciones en este grupo.`,
                mentions: [m.sender]
            }, { quoted: m });

            await conn.deleteMessage(m.chat, { id: m.id, remoteJid: m.chat });
        }
    } catch (e) {
        console.error(e);
    }
};

eventHandler.event = 'messages.upsert';
export default eventHandler;
