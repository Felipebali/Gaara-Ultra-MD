// plugin avisos.js
// Toggle de avisos solo admin + mensaje al grupo con HTML
global.groupData = global.groupData || {};

const handler = async (m, { conn, isAdmin, isGroup }) => {
    if (!isGroup) return; // Solo grupos
    if (!isAdmin) return await conn.sendMessage(m.chat, { text: '❌ Solo admins pueden usar este comando.', parse_mode: 'html' });

    // Inicializamos la configuración del chat si no existe
    global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {};
    const chatSettings = global.db.data.chats[m.chat];

    // Toggle: activa/desactiva avisos
    chatSettings.avisos = !chatSettings.avisos;

    // Mensaje al grupo indicando el estado actual usando HTML
    const estado = chatSettings.avisos ? '✅ <b>Activados</b>' : '❌ <b>Desactivados</b>';
    await conn.sendMessage(m.chat, { text: `📢 Avisos ${estado}`, parse_mode: 'html' });

    // Guardamos configuración
    global.db.data.chats[m.chat] = chatSettings;
};

// Prefijo y comando
handler.help = ['avisos'];
handler.tags = ['group'];
handler.command = ['avisos'];
export default handler;
