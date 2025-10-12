// plugins/_antilink2.js
/**
 * Anti-Link2 FelixCat-Bot - Borra IG, TikTok y YouTube con mención
 */

const blockedLinks = /(instagram\.com|tiktok\.com|youtube\.com|youtu\.be)/i;

export async function before(m, { conn, isAdmin, isBotAdmin }) {
    if (!m?.text) return true;
    if (m.isBaileys && m.fromMe) return true;
    if (!m.isGroup) return true;
    if (!isBotAdmin) return true;

    const chat = global.db?.data?.chats?.[m.chat];
    if (!chat?.antiLink2) return true; // Solo si está activado

    const who = m.sender;

    if (!blockedLinks.test(m.text)) return true; // No es link bloqueado

    try {
        // 🔹 BORRAR MENSAJE
        await conn.sendMessage(m.chat, { delete: m.key });

        // 🔹 MENSAJE CON MENCIÓN
        await conn.sendMessage(m.chat, {
            text: isAdmin
                ? `⚠️ @${who.split("@")[0]}, admin, nada de Instagram, TikTok ni YouTube aquí.`
                : `⚠️ @${who.split("@")[0]}, ese link quedó borrado porque molesta.`,
            mentions: [who]
        });

    } catch (e) {
        console.error('Error en Anti-Link2:', e);
    }

    return true;
}

// 🔹 Comando para activar/desactivar Anti-Link2
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
export default handler;
