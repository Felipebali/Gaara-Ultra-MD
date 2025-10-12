// plugins/_antilink2.js
/**
 * Anti-Link2 FelixCat-Bot
 * Borra mensajes de Instagram, TikTok y YouTube con mención
 * Funciona para todos los usuarios, incluso admins
 */

const blockedLinks = /(https?:\/\/)?(www\.)?(instagram\.com|tiktok\.com|youtube\.com|youtu\.be)\/[^\s]+/i;

export async function before(m, { conn, isAdmin, isBotAdmin }) {
    if (!m?.text) return true;
    if (m.isBaileys && m.fromMe) return true;
    if (!m.isGroup) return true;

    const chat = global.db?.data?.chats?.[m.chat];
    if (!chat?.antiLink2) return true; // Activado desde .antilink2
    if (!isBotAdmin) return true;     // El bot necesita ser admin para borrar

    const who = m.sender;

    if (!blockedLinks.test(m.text)) return true; // Si no es link bloqueado, no hace nada

    try {
        // Borra el mensaje si existe
        if (m.key?.id) await conn.sendMessage(m.chat, { delete: m.key });

        // Mensaje de aviso al usuario
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
