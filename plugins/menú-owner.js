// plugins/menu-owner.js
let handler = async (m, { conn }) => {
    try {
        let menuText = `
╭━━━〔 👑 MENÚ OWNER 𝗙𝗘𝗟𝗜𝗖𝗔𝗧 🐾 〕━━━⬣
┃ ❒ *Comandos exclusivos del dueño*
╰━━━━━━━━━━━━━━━━━━━━⬣

╭━━━〔 👑 JEFES / DIOSES 〕━━━⬣
┃ 🐾 .autoadmin - Activar autoadmin
┃ 🐾 .banuser <@user> - Banear usuario
┃ 🐾 .unbanuser <@user> - Desbanear usuario
┃ 🐾 .chetar - Dar poderes
┃ 🐾 .deschetar - Quitar poderes
┃ 🐾 .dsowner - Eliminar dueño
┃ 🐾 .join <link> - Unirse a grupo
┃ 🐾 .restart - Reiniciar bot
┃ 🐾 .exec <comando> - Ejecutar código
┃ 🐾 .exec2 <comando> - Ejecutar código avanzado
┃ 🐾 .setcmd - Configurar comando
┃ 🐾 .setprefix - Cambiar prefijo
┃ 🐾 .update - Actualizar bot
┃ 🐾 .resetuser <@user> - Eliminar todos los datos de un usuario
╰━━━━━━━━━━━━━━━━━━━━⬣

> 👑 Powered by FelixCat 🐾
        `;

        // Enviar mensaje SIN citar
        await conn.sendMessage(m.chat, { text: menuText });

    } catch (e) {
        console.error(e);
        await m.reply('✖️ Error al mostrar el menú de owner.');
    }
}

handler.command = ['menuow'];
handler.owner = true;

export default handler;
