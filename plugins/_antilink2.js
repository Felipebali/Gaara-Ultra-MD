// plugins/antilink2.js
// AntiLink2 - Borra IG/TikTok/YouTube | Afecta admins y usuarios

const linkRegex = /(instagram\.com|tiktok\.com|youtube\.com|youtu\.be)/i;

export async function before(m, { conn }) {
    if (!m.isGroup) return true;
    if (!m.text) return true;

    let chat = global.db.data.chats[m.chat];
    if (!chat?.antilink2) return true;

    const isLink = linkRegex.test(m.text);
    if (!isLink) return true;

    let who = m.sender;
    let userTag = `@${who.split("@")[0]}`;

    try {
        // Borrar el mensaje
        await conn.sendMessage(m.chat, { delete: m.key });

        // Frases personalizadas
        if (m.isAdmin) {
            await conn.sendMessage(m.chat, {
                text: `⚠️ ${userTag} sos admin pero igual está prohibido mandar links acá.`,
                mentions: [who]
            });
        } else {
            await conn.sendMessage(m.chat, {
                text: `🚫 ${userTag} no se permite mandar links acá.`,
                mentions: [who]
            });
        }
    } catch (e) {
        console.error(e);
    }

    return true;
}

// Activar / desactivar
export async function antilink2Command(m, { conn, isAdmin }) {
    if (!m.isGroup) return m.reply("❌ Este comando solo funciona en grupos.");
    if (!isAdmin) return m.reply("❌ Solo los administradores pueden activar esto.");

    let chat = global.db.data.chats[m.chat];
    chat.antilink2 = !chat.antilink2;

    m.reply(`✅ AntiLink2 ahora está *${chat.antilink2 ? "activado" : "desactivado"}*.`);
}

export const handler = {
    command: ['antilink2'],
    group: true,
    admin: true,
    callback: antilink2Command
};
