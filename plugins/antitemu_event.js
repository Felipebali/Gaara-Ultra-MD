// plugins/antitemu_event.js
let eventHandler = async (m, { conn, isGroup }) => {
    if (!isGroup) return;

    // Inicializa configuración si no existe
    if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {};
    const chat = global.db.data.chats[m.chat];

    // Si el antitemu está desactivado, no hace nada
    if (!chat.antitemu) return;

    try {
        // Detecta cualquier enlace de Temu (temu.com, share.temu.com, link.temu, etc.)
        if (m.text && /https?:\/\/(.*\.)?temu\.com/i.test(m.text)) {
            
            // Borra el mensaje sin importar quién lo envió (usuario o admin)
            await conn.deleteMessage(m.chat, { id: m.id, remoteJid: m.chat });

            // Mensaje opcional de aviso (podés comentarlo si querés que borre silencioso)
            await conn.sendMessage(m.chat, {
                text: `🚫 @${m.sender.split('@')[0]}, no se permiten enlaces de *Temu* en este grupo.`,
                mentions: [m.sender]
            });
        }
    } catch (e) {
        console.error(e);
    }
};

eventHandler.event = 'messages.upsert';
export default eventHandler;
