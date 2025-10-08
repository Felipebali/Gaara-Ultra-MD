// plugins/antitemu_event.js
let eventHandler = async (m, { conn, isGroup }) => {
    if (!isGroup) return;

    // Si no existe la configuración del grupo, la crea
    if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {};
    const chat = global.db.data.chats[m.chat];

    // Si el antitemu está desactivado, no hace nada
    if (!chat.antitemu) return;

    try {
        // Detecta si el mensaje contiene un enlace de Temu
        if (m.text && /(temu\.com|share\.temu\.com)/i.test(m.text)) {
            await conn.sendMessage(m.chat, {
                text: `🚫 @${m.sender.split('@')[0]}, no se permiten enlaces de *Temu* en este grupo.`,
                mentions: [m.sender]
            });
            await conn.deleteMessage(m.chat, { id: m.id, remoteJid: m.chat });
        }
    } catch (e) {
        console.error(e);
    }
};

eventHandler.event = 'messages.upsert';
export default eventHandler;
