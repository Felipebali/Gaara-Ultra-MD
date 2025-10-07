// plugins/antitagall.js
let handler = async (m, { conn, usedPrefix }) => {
    const chatId = m.chat;
    const groupMetadata = await conn.groupMetadata(chatId).catch(() => null);
    if (!groupMetadata) return m.reply('❌ Este comando solo funciona en grupos.');

    const participants = groupMetadata.participants || [];
    const sender = m.sender;

    // Verifica si es admin correctamente
    const participant = participants.find(p => p.id === sender);
    const isAdmin = participant && (participant.admin === 'admin' || participant.admin === 'superadmin');
    if (!isAdmin) return m.reply('❌ Solo admins pueden usar este comando.');

    // Asegurarse de que exista la configuración del chat
    if (!global.db.data.chats[chatId]) global.db.data.chats[chatId] = {};
    const chatSettings = global.db.data.chats[chatId];

    // Activar/desactivar anti-tagall
    if (m.text?.startsWith(`${usedPrefix}antitagall`)) {
        chatSettings.antitagall = !chatSettings.antitagall;
        return m.reply(chatSettings.antitagall
            ? '✅ TagAll desactivado en este grupo'
            : '🟢 TagAll activado en este grupo');
    }

    // TagAll
    if (m.text?.startsWith(`${usedPrefix}tagall`) || m.text?.startsWith(`${usedPrefix}invocar`) || m.text?.startsWith(`${usedPrefix}tag`)) {
        if (chatSettings.antitagall) {
            return conn.sendMessage(chatId, {
                text: `❌ @${sender.split('@')[0]}, el TagAll está desactivado en este grupo.`,
                mentions: [sender]
            }, { quoted: m });
        }

        const mencionados = participants.map(p => p.id).filter(Boolean);
        if (mencionados.length === 0) return;

        let listaUsuarios = mencionados.map(jid => `┃ ⚡ @${jid.split('@')[0]}`).join('\n');
        const mensaje = [
            '╭━━━〔 𝗙𝗲𝗹𝗶𝘅𝗖𝗮𝘁-𝗕𝗼𝘁 〕━━━⬣',
            '┃ 🔥 ¡Invocación completada! 🔥',
            '┃ 📌 Todos los usuarios del chat han sido invocados:',
            listaUsuarios,
            '╰━━━━━━━━━━━━━━━━━━━━⬣'
        ].join('\n');

        await conn.sendMessage(chatId, { text: mensaje, mentions: mencionados });
    }
};

handler.command = ['tagall', 'invocar', 'tag', 'antitagall'];
handler.group = true;
handler.botAdmin = true;
handler.admin = true;

export default handler;
