// plugins/antitagall.js
let handler = async (m, { conn, usedPrefix, isGroup, groupMetadata, isAdmin }) => {
    if (!isGroup) return m.reply('❌ Este comando solo funciona en grupos.');
    if (!isAdmin) return m.reply('❌ Solo admins pueden usar este comando.');

    if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {};
    const chatSettings = global.db.data.chats[m.chat];

    // Comando para activar/desactivar anti-TagAll
    if (m.text?.startsWith(`${usedPrefix}antitagall`)) {
        chatSettings.antitagall = !chatSettings.antitagall;
        return m.reply(chatSettings.antitagall 
            ? '✅ TagAll desactivado en este grupo' 
            : '🟢 TagAll activado en este grupo');
    }

    // Comando TagAll
    if (m.text?.startsWith(`${usedPrefix}tagall`) || m.text?.startsWith(`${usedPrefix}invocar`) || m.text?.startsWith(`${usedPrefix}tag`)) {
        if (chatSettings.antitagall) {
            return await conn.sendMessage(m.chat, {
                text: `❌ @${m.sender.split('@')[0]}, el TagAll está desactivado en este grupo.`,
                mentions: [m.sender]
            }, { quoted: m });
        }

        const participantes = groupMetadata?.participants || [];
        const mencionados = participantes.map(p => p.id).filter(Boolean);
        if (mencionados.length === 0) return;

        let listaUsuarios = mencionados.map(jid => `┃ ⚡ @${jid.split('@')[0]}`).join('\n');
        const mensaje = [
            '╭━━━〔 𝗙𝗲𝗹𝗶𝘅𝗖𝗮𝘁-𝗕𝗼𝘁 〕━━━⬣',
            '┃ 🔥 ¡Invocación completada! 🔥',
            '┃ 📌 Todos los usuarios del chat han sido invocados:',
            listaUsuarios,
            '╰━━━━━━━━━━━━━━━━━━━━⬣'
        ].join('\n');

        await conn.sendMessage(m.chat, { text: mensaje, mentions: mencionados });
    }
};

handler.command = ['tagall', 'invocar', 'tag', 'antitagall'];
handler.group = true;
handler.botAdmin = true; // El bot debe ser admin para mencionar
handler.admin = true;    // Solo admins pueden usarlo

export default handler;
