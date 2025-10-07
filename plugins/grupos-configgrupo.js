let handler = async (m, { conn, groupMetadata }) => {
    if (!m.isGroup) return conn.reply(m.chat, '❌ Este comando solo funciona en grupos.', m);

    try {
        // Detectamos el estado actual del grupo
        const isClosed = groupMetadata?.announcement; // true = cerrado, false = abierto
        let newSetting;
        let mensaje;

        if (isClosed) {
            // Grupo cerrado → abrir
            newSetting = 'not_announcement';
            mensaje = '👑 *El grupo ahora está abierto, todos pueden escribir.*';
        } else {
            // Grupo abierto → cerrar
            newSetting = 'announcement';
            mensaje = '⚡️ *El grupo ahora está cerrado, solo los admins pueden escribir.*';
        }

        // Actualizamos la configuración
        await conn.groupSettingUpdate(m.chat, newSetting);
        await m.reply(mensaje);

    } catch (e) {
        console.error(e);
        await m.reply('❌ Ocurrió un error al cambiar la configuración del grupo.', m);
    }
};

handler.help = ['g'];
handler.tags = ['grupo'];
handler.command = ['g'];
handler.admin = true;
handler.botAdmin = true;

export default handler;
