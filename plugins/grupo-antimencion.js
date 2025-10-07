// plugins/antimencion.js

let handler = async (m, { conn, isGroup, usedPrefix, text }) => {
    if (!isGroup) return; // Solo funciona en grupos
    global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {};
    const chatSettings = global.db.data.chats[m.chat];

    // Comando para activar/desactivar
    if (text?.startsWith(`${usedPrefix}antimencion`)) {
        chatSettings.antimencion = !chatSettings.antimencion;
        return conn.sendMessage(m.chat, { 
            text: chatSettings.antimencion 
                ? `✅ Eliminación de menciones activada` 
                : `⚠️ Eliminación de menciones desactivada` 
        }, { quoted: m });
    }

    // Solo se ejecuta si está activado
    if (!chatSettings.antimencion) return;

    // Detecta menciones y elimina mensaje
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

handler.event = 'messages.upsert';
handler.command = ['antimencion'];
handler.group = true;

export default handler;
