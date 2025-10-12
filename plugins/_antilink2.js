// plugins/_antilink2.js
const blockedLinks = /(instagram\.com|tiktok\.com|youtube\.com|youtu\.be)/i; // Links a bloquear

export async function before(m, { conn, isAdmin, isBotAdmin }) {
    if (!m?.text) return true;
    if (m.isBaileys && m.fromMe) return true;
    if (!m.isGroup) return true;
    if (!isBotAdmin) return true; // Bot necesita permisos de admin para borrar

    const chat = global.db?.data?.chats?.[m.chat];
    if (!chat?.antiLink2) return true; // Activado desde .antilink2

    const who = m.sender;
    const name = await conn.getName(who);

    if (!blockedLinks.test(m.text)) return true; // Si no es link bloqueado, no hace nada

    try {
        // Borra el mensaje
        if (m.key?.id) await conn.sendMessage(m.chat, { delete: m.key });

        // Aviso al usuario
        await conn.sendMessage(m.chat, {
            text: `⚠️ @${who.split("@")[0]}, tu link de Instagram, TikTok o YouTube fue eliminado.`,
            mentions: [who]
        });
    } catch (e) {
        console.error('Error en Anti-Link2:', e);
    }

    return true;
};

// Comando para activar/desactivar Anti-Link2
let handler = async (m, { conn, isAdmin }) => {
    if (!m.isGroup) return;
    if (!isAdmin) return conn.sendMessage(m.chat, { text: "❌ Solo admins pueden usar este comando." });

    if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {};
    const chat = global.db.data.chats[m.chat];

    chat.antiLink2 = !chat.antiLink2;
    await conn.sendMessage(m.chat, { 
        text: `✅ Anti-Link2 ahora está *${chat.antiLink2 ? "activado" : "desactivado"}*.`
    });
};

handler.command = ['antilink2'];
handler.group = true;
export { handler as default };
