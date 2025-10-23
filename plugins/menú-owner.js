// plugins/menu-owner.js
let handler = async (m, { conn }) => {
  try {
    const menuText = `
╭━━━━━━━━━━━━━━━━━━━━━━━╮
│ 👑 *MENÚ OWNER - FELIXCAT* 👑
│   Comandos exclusivos del dueño
╰━━━━━━━━━━━━━━━━━━━━━━━╯

📂 *Gestión de Administradores*
   🐾 .autoadmin — Otorga poderes de admin
   🐾 .chetar — Concede habilidades especiales
   🐾 .deschetar — Quita habilidades especiales

📂 *Usuarios / Lista Negra*
   🚫 .ln <@user> — Agregar usuario a la lista negra
   ♻️ .unln <@user> — Quitar usuario de la lista negra
   🔍 .cln <@user> — Ver estado en lista negra
   📜 .verln — Ver todos los usuarios en lista negra
   🧹 .usln — Vaciar lista negra
   🗑️ .resetuser <@user> — Borrar todos los datos del usuario

📂 *Bot / Sistema*
   🔄 .restart — Reiniciar el bot
   📦 .update — Actualizar el bot
   🧠 .exec <código> — Ejecutar comando simple
   ⚙️ .exec2 <código> — Ejecutar comando avanzado
   🧩 .setcmd — Configurar comando personalizado
   🪄 .setprefix — Cambiar prefijo del bot
   ❌ .dsowner — Eliminar dueño actual
   🔗 .join <link> — Unirse a un grupo

━━━━━━━━━━━━━━━━━━━━━━━
✨ *FelixCat - Owner Oficial* ✨
`.trim()

    await conn.sendMessage(m.chat, { text: menuText }, { quoted: m })
  } catch (e) {
    console.error(e)
    await m.reply('✖️ Error al mostrar el menú de owner.')
  }
}

handler.command = ['menuow', 'mw']
handler.owner = true

export default handler
