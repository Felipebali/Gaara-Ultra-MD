let linkRegex = /\b((https?:\/\/|www\.)?[\w-]+\.[\w-]+(?:\.[\w-]+)*(\/[\w\.\-\/?=&]*)?)\b/gi;

// Dominios permitidos
const excepciones = ['instagram.com', 'youtu.be', 'youtube.com', 'tiktok.com'];

// Links especiales
const groupLinkRegex = /chat\.whatsapp\.com\/(?:invite\/)?([0-9A-Za-z]{20,24})/i
const channelLinkRegex = /whatsapp\.com\/channel\/([0-9A-Za-z]+)/i

export async function before(m, { conn, isAdmin, isBotAdmin }) {
    if (!m || !m.text) return true;
    if (m.isBaileys && m.fromMe) return true;
    if (!m.isGroup) return false;

    const chat = global.db?.data?.chats?.[m.chat];
    if (!chat || !chat.antiLink) return true;

    const delet = m.key.participant;
    const bang = m.key.id;
    const user = `@${m.sender.split('@')[0]}`;

    // 1️⃣ Primero detectar links generales HTTP/HTTPS
    const enlaces = m.text.match(linkRegex) || [];
    const linkBloqueado = enlaces.some(link => {
        const linkLower = link.toLowerCase();
        return !excepciones.some(dom => linkLower.includes(dom));
    });

    // 2️⃣ Detectar links de grupos y canales de WhatsApp
    const isGroupLink = groupLinkRegex.test(m.text);
    const isChannelLink = channelLinkRegex.test(m.text);

    // Ignorar links de canales
    if (isChannelLink) return true;

    // 3️⃣ Si es admin
    if (isAdmin) {
        if (linkBloqueado || isGroupLink) {
            try {
                if (isBotAdmin) await conn.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: bang, participant: delet } });
                await conn.sendMessage(m.chat, { text: `⚠️ El administrador ${user} envió un enlace no permitido. Solo se eliminó el mensaje.` });
                console.log(`Mensaje de admin ${user} eliminado por Anti-Link`);
            } catch (e) { console.error(e) }
        }
        return true;
    }

    // 4️⃣ Si es usuario normal
    if (!isAdmin && (linkBloqueado || isGroupLink)) {
        try {
            if (isBotAdmin) await conn.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: bang, participant: delet } });
            await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove'); // expulsar
            await conn.sendMessage(m.chat, { text: `🚫 El usuario ${user} fue expulsado por enviar un enlace no permitido.` });
            console.log(`Usuario ${user} expulsado por Anti-Link`);
        } catch (e) { console.error(e) }
        return false;
    }

    return true;
}

// Comando para activar/desactivar Anti-Link
export async function antilinkCommand(m, { conn, isAdmin }) {
    if (!m.isGroup) return conn.sendMessage(m.chat, { text: "Este comando solo funciona en grupos." });
    if (!isAdmin) return conn.sendMessage(m.chat, { text: "Solo administradores pueden activar/desactivar Anti-Link." });

    if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = { antiLink: true };
    const chat = global.db.data.chats[m.chat];
    chat.antiLink = !chat.antiLink;

    await global.db.write();
    conn.sendMessage(m.chat, { text: `✅ Anti-Link ahora está ${chat.antiLink ? "activado" : "desactivado"} en este grupo.` });
}
