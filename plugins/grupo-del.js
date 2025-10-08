// plugins/del.js
let handler = async (m, { conn }) => {
    try {
        // Verifica si se está respondiendo a un mensaje
        if (!m.quoted) return conn.reply(m.chat, '⚠️ Responde al mensaje que quieres borrar usando `.del`', m);

        const messageId = m.quoted.id; // ID del mensaje a eliminar
        const chatId = m.chat;
        const participant = m.quoted.sender || m.sender; // quien envió el mensaje

        // Intentar eliminar el mensaje
        if (!conn.user.jid) return; // si el bot no está inicializado

        await conn.sendMessage(chatId, { 
            delete: { 
                remoteJid: chatId, 
                fromMe: false, 
                id: messageId, 
                participant: participant 
            } 
        });

        await conn.reply(chatId, '✅ Mensaje eliminado correctamente.', m);
    } catch (e) {
        console.error(e);
        await conn.reply(m.chat, '✖️ No se pudo borrar el mensaje. Asegúrate de que el bot tenga permisos de admin.', m);
    }
};

handler.help = ['del'];
handler.tags = ['admin'];
handler.command = ['del', 'delete'];
handler.group = true;      // solo funciona en grupos
handler.admin = true;      // solo admins pueden usarlo
handler.botAdmin = true;   // el bot debe ser admin

export default handler;
