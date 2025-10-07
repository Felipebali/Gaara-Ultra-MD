// plugins/antimencion.js

let handler = async (m, { conn, isGroup, usedPrefix }) => {
    // Solo en grupos
    if (!isGroup) return;

    // Asegurarse de que exista la configuración del chat
    if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {};
    const chatSettings = global.db.data.chats[m.chat];

    // Si el mensaje es el comando .antimencion → alterna estado
    if (m.text?.startsWith(`${usedPrefix}antimencion`)) {
        chatSettings.antimencion = !chatSettings.antimencion;
        return await conn.sendMessage(m.chat, {
            text: chatSettings.antimencion
                ? `✅ Antimención activada`
                : `⚠️ Antimención desactivada`
        }, { quoted: m });
    }

    // Si antimención está desactivado → no hacer nada
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

// Este handler sirve como comando y evento
handler.command = ['antimencion']; // Comando para alternar
handler.group = true;
handler.event = 'messages.upsert'; // Escucha todos los mensajes

export default handler;
