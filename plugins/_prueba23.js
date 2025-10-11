// plugin avisos.js
// Toggle de avisos solo admin + mensaje al grupo, sin citar ni logs
global.groupData = global.groupData || {};

const handler = async (m, { conn, isAdmin, isGroup }) => {
    if (!isGroup) return; // solo grupos
    if (!isAdmin) return await conn.sendMessage(m.chat, { text: '❌ Solo admins pueden usar este comando.' });

    // Inicializamos la configuración del chat si no existe
    global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {};
    const chatSettings = global.db.data.chats[m.chat];

    // Toggle: activa/desactiva avisos
    chatSettings.avisos = !chatSettings.avisos;

    // Mensaje al grupo indicando el estado actual
    const estado = chatSettings.avisos ? '✅ Activados' : '❌ Desactivados';
    await conn.sendMessage(m.chat, { text: `📢 Avisos ${estado}.` });

    // Guardamos configuración
    global.db.data.chats[m.chat] = chatSettings;
};

// Prefijo y comando
handler.help = ['avisos'];
handler.tags = ['group'];
handler.command = ['avisos'];
export default handler;
