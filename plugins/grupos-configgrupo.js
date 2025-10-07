let handler = async (m, { conn }) => {
    if (!m.isGroup) return conn.reply(m.chat, '❌ Este comando solo funciona en grupos.', m);

    try {
        // Obtenemos la metadata actual del grupo
        const groupMetadata = await conn.groupMetadata(m.chat);
        const isClosed = groupMetadata.announcement; // true = cerrado, false = abierto

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

        // Actualizamos la configuración del grupo
        await conn.groupSettingUpdate(m.chat, newSetting);
        await conn.sendMessage(m.chat, { text: mensaje });

    } catch (e) {
        console.error(e);
        await conn.reply(m.chat, '❌ Ocurrió un error al cambiar la configuración del grupo.', m);
    }
};

handler.help = ['g'];
handler.tags = ['grupo'];
handler.command = ['g'];
handler.admin = true;
handler.botAdmin = true;

export default handler;
