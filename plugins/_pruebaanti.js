// plugins/toggle-antilinks.js
let toggleAntilinks = async (m, { conn, isAdmin, isOwner }) => {
    if (!m.isGroup) return conn.sendMessage(m.chat, { text: '⚠️ Este comando solo funciona en grupos' });
    if (!isAdmin && !isOwner) return conn.sendMessage(m.chat, { text: '⚠️ Solo los administradores pueden cambiar esta configuración' });

    if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {};
    const chat = global.db.data.chats[m.chat];

    const cmd = m.text.trim().slice(1).toLowerCase(); // obtiene el comando sin prefijo

    switch(cmd) {
        case 'antilink':
            chat.antiLink = !chat.antiLink;
            await conn.sendMessage(m.chat, {
                text: `🔗 AntiLink ahora está ${chat.antiLink ? '✅ ACTIVADO' : '❌ DESACTIVADO'}`
            });
            break;

        case 'antilink2':
            chat.antiLink2 = !chat.antiLink2;
            await conn.sendMessage(m.chat, {
                text: `🔗 AntiLink2 ahora está ${chat.antiLink2 ? '✅ ACTIVADO' : '❌ DESACTIVADO'}`
            });
            break;

        default:
            return conn.sendMessage(m.chat, {
                text: '⚠️ Comando desconocido. Usa .antilink o .antilink2'
            });
    }

    global.db.data.chats[m.chat] = chat;
};

toggleAntilinks.help = ['antilink','antilink2'];
toggleAntilinks.tags = ['group'];
toggleAntilinks.command = /^(antilink|antilink2)$/i;
toggleAntilinks.group = true;

export default toggleAntilinks;
