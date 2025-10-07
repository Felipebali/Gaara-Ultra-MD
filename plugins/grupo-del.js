// plugins/del.js
let handler = async (m, { conn }) => {
    try {
        // Verifica si se está respondiendo a un mensaje
        if (!m.quoted) return conn.reply(m.chat, '⚠️ Responde al mensaje que quieres borrar usando `.del`', m);

        const messageId = m.quoted.id; // ID del mensaje a eliminar
        const chatId = m.chat;

        // Intentar eliminar el mensaje
        await conn.sendMessage(chatId, { delete: messageId });
    } catch (e) {
        console.error(e);
        await conn.reply(m.chat, '✖️ No se pudo borrar el mensaje. Asegúrate de que el bot tenga permisos.', m);
    }
};

handler.help = ['del'];
handler.tags = ['admin'];
handler.command = ['del', 'delete'];
handler.group = true;  // solo funciona en grupos
handler.admin = true;  // solo admins pueden usarlo
handler.botAdmin = true; // el bot debe ser admin

export default handler;
