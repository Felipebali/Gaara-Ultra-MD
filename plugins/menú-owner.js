// plugins/menu-owner.js
let handler = async (m, { conn }) => {
  try {
    let menuText = `
╭━━━━━━━━━━━━━━━━━━━━╮
│ 👑 *MENÚ OWNER* 👑
│ Comandos exclusivos del dueño
╰━━━━━━━━━━━━━━━━━━━━╯

🐾 .autoadmin         - Otorga poderes de administrador
🐾 .banuser <@user>   - Banear usuario
🐾 .unbanuser <@user> - Desbanear usuario
🐾 .chetar            - Concede habilidades especiales
🐾 .deschetar         - Quita habilidades
🐾 .dsowner           - Eliminar dueño
🐾 .join <link>       - Unirse a un grupo
🐾 .restart           - Reiniciar bot
🐾 .exec <comando>    - Ejecutar código
🐾 .exec2 <comando>   - Ejecutar código avanzado
🐾 .setcmd            - Configurar comando
🐾 .setprefix         - Cambiar prefijo
🐾 .update            - Actualizar bot
🐾 .resetuser <@user> - Borrar todos los datos de un usuario

✨ ⚡ FelixCat - Owner
`;

    // Enviar mensaje con imagen de portada
    await conn.sendMessage(m.chat, {
      image: { url: 'https://files.catbox.moe/3ryutp.jpg' }, // Reemplazar con la URL de tu imagen de owner
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
