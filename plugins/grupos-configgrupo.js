let handler = async (m, { conn, groupMetadata }) => {
    if (!m.isGroup) return conn.reply(m.chat, '❌ Este comando solo funciona en grupos.', m);

    try {
        // Obtenemos el estado actual del grupo
        const currentSetting = groupMetadata?.announcement; // true = cerrado, false = abierto
        const newSetting = currentSetting ? 'not_announcement' : 'announcement';

        // Cambiamos el estado
        await conn.groupSettingUpdate(m.chat, newSetting);

        if (newSetting === 'not_announcement') {
            m.reply(`👑 *El grupo ahora está abierto, todos pueden escribir.*`);
        } else {
            m.reply(`⚡️ *El grupo ahora está cerrado, solo los admins pueden escribir.*`);
        }

    } catch (e) {
        console.error(e);
        m.reply('❌ Ocurrió un error al intentar cambiar la configuración del grupo.', m);
    }
};

handler.help = ['g'];
handler.tags = ['grupo'];
handler.command = ['g'];
handler.admin = true;
handler.botAdmin = true;

export default handler;
