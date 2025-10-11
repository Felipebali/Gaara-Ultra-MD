// plugin avisos.js
// Avisos de cambios en grupo + comando .avisos toggle solo para admins
global.groupData = global.groupData || {};

const handler = async (m, { conn, isAdmin, isGroup }) => {
    if (!isGroup) return;
    if (!isAdmin) return conn.reply(m.chat, '❌ Solo admins pueden usar este comando.', m);

    // Inicializamos la configuración del chat si no existe
    global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {};
    const chatSettings = global.db.data.chats[m.chat];

    // Toggle: activa/desactiva avisos
    chatSettings.avisos = !chatSettings.avisos;
    const estado = chatSettings.avisos ? '✅ Activados' : '❌ Desactivados';
    conn.reply(m.chat, `📢 Avisos ${estado}.`, m);

    global.db.data.chats[m.chat] = chatSettings;

    // Si está activado, revisamos cambios de nombre y descripción
    if (!chatSettings.avisos) return;

    const groupMetadata = await conn.groupMetadata(m.chat);
    if (!global.groupData[m.chat].subject) global.groupData[m.chat].subject = groupMetadata.subject;
    if (!global.groupData[m.chat].desc) global.groupData[m.chat].desc = groupMetadata.desc || '';

    const oldData = global.groupData[m.chat];
    const newSubject = groupMetadata.subject;
    const newDesc = groupMetadata.desc || '';

    if (oldData.subject !== newSubject) {
        await conn.sendMessage(m.chat, { text: `📢 El nombre del grupo ha sido cambiado.\n📝 Nuevo nombre: *${newSubject}*` });
        oldData.subject = newSubject;
    }

    if (oldData.desc !== newDesc) {
        await conn.sendMessage(m.chat, { text: `📢 La descripción del grupo ha sido cambiada.\n📝 Nueva descripción: *${newDesc}*` });
        oldData.desc = newDesc;
    }

    global.groupData[m.chat] = oldData;
};

// Prefijo y comando
handler.help = ['avisos'];
handler.tags = ['group'];
handler.command = ['avisos'];
handler.before = async (m, { isGroup }) => !!isGroup;
export default handler;
