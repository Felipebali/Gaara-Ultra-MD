// plugins/toggle-antilink.js
let handler = async (m, { conn, isAdmin, isOwner }) => {
    if (!m.isGroup) return conn.sendMessage(m.chat, { text: '⚠️ Este comando solo funciona en grupos' });
    if (!isAdmin && !isOwner) return conn.sendMessage(m.chat, { text: '⚠️ Solo los administradores pueden cambiar esta configuración' });

    let chat = global.db.data.chats[m.chat] || {};
    chat.antiLink = !chat.antiLink; // Cambia el estado
    global.db.data.chats[m.chat] = chat;

    await conn.sendMessage(m.chat, {
        text: `🔗 AntiLink ahora está ${chat.antiLink ? '✅ ACTIVADO' : '❌ DESACTIVADO'}`
    });
};

handler.help = ['antilink'];
handler.tags = ['group'];
handler.command = /^antilink$/i;
handler.group = true;

export default handler;
