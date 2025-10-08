// plugins/del.js
let handler = async (m, { conn }) => {
    try {
        if (!m.quoted) 
            return conn.reply(m.chat, '⚠️ Responde al mensaje que quieres borrar usando `.del`', m);

        const quotedKey = m.quoted.key; // clave completa del mensaje citado
        if (!quotedKey) return conn.reply(m.chat, '✖️ No se pudo identificar el mensaje a eliminar.', m);

        // Borrar mensaje usando la clave completa
        await conn.sendMessage(m.chat, { delete: quotedKey });

        await conn.reply(m.chat, '✅ Mensaje eliminado correctamente.', m);
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
