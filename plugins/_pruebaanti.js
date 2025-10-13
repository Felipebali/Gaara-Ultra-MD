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


// plugins/toggle-antilink2.js
let handler = async (m, { conn, isAdmin, isOwner }) => {
    if (!m.isGroup) return conn.sendMessage(m.chat, { text: '⚠️ Este comando solo funciona en grupos' })
    if (!isAdmin && !isOwner) return conn.sendMessage(m.chat, { text: '⚠️ Solo los administradores pueden cambiar esta configuración' })

    if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
    const chat = global.db.data.chats[m.chat]

    chat.antiLink2 = !chat.antiLink2
    global.db.data.chats[m.chat] = chat

    await conn.sendMessage(m.chat, {
        text: `🔗 Anti-Link2 ahora está ${chat.antiLink2 ? '✅ ACTIVADO' : '❌ DESACTIVADO'}`
    })
}

handler.help = ['antilink2']
handler.tags = ['group']
handler.command = /^antilink2$/i
handler.group = true

export default handler
