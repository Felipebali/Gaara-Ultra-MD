// plugins/menu-owner.js
let handler = async (m, { conn }) => {
  try {
    const fecha = new Date().toLocaleString('es-UY', {
      timeZone: 'America/Montevideo',
      hour12: false
    })

    const menuText = `
💼 *MENÚ OWNER - FELIXCAT_BOT*
📅 ${fecha}

*Administradores*
• .autoadmin – Dar admin
• .chetar – Activar modo pro
• .deschetar – Desactivar modo pro

*Lista Negra*
• .ln <@user> – Agregar
• .unln <@user> – Quitar
• .cln <@user> – Consultar
• .verln – Ver lista
• .usln – Vaciar lista
• .resetuser <@user> – Reiniciar usuario

*Bot*
• .restart – Reiniciar
• .update – Actualizar
• .exec / .exec2 – Ejecutar código
• .setcmd – Configurar comando
• .setprefix – Cambiar prefijo
• .dsowner – Quitar dueño
• .join <link> – Unirse a grupo

👑 FelixCat – Propietario
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
