// plugin avisosToggle.js
const handler = async (m, { conn, isAdmin, isGroup }) => {
    if (!isGroup) return;
    if (!isAdmin) return await conn.sendMessage(m.chat, { text: '❌ Solo admins pueden usar este comando.' });

    global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {};
    const chatSettings = global.db.data.chats[m.chat];

    chatSettings.avisos = !chatSettings.avisos;
    const estado = chatSettings.avisos ? '✅ Activados' : '❌ Desactivados';
    await conn.sendMessage(m.chat, { text: `📢 Avisos ${estado}.` });

    global.db.data.chats[m.chat] = chatSettings;
};

handler.help = ['avisos'];
handler.tags = ['group'];
handler.command = ['avisos'];
export default handler;
