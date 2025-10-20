// plugins/menu-owner.js
let handler = async (m, { conn }) => {
  try {
    let menuText = `╭━━━━━━━━━━━━━━━━━━━━╮
│ 👑 *MENÚ OWNER* 👑
│ Comandos exclusivos del dueño
╰━━━━━━━━━━━━━━━━━━━━╯
📌 *Gestión de Admins*
🐾 .autoadmin - Otorga poderes de administrador
🐾 .chetar - Concede habilidades especiales
🐾 .deschetar - Quita habilidades
📌 *Usuarios*
🐾 .banuser <@user> - Banear usuario
🐾 .unbanuser <@user> - Desbanear usuario
🐾 .resetuser <@user> - Borrar todos los datos de un usuario
📌 *Bot*
🐾 .restart - Reiniciar bot
🐾 .update - Actualizar bot
🐾 .exec <comando> - Ejecutar código
🐾 .exec2 <comando> - Ejecutar código avanzado
🐾 .setcmd - Configurar comando
🐾 .setprefix - Cambiar prefijo
🐾 .dsowner - Eliminar dueño
🐾 .join <link> - Unirse a un grupo
✨ ⚡ FelixCat - Owner`;

    await conn.sendMessage(m.chat, {
      image: { url: '' }, // URL de imagen del Owner
      caption: menuText
    }, { quoted: m });

  } catch (e) {
    console.error(e);
    await m.reply('✖️ Error al mostrar el menú de owner.');
  }
}

handler.command = ['menuow','mw'];
handler.owner = true;

export default handler;
