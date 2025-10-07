// 🟢 FelixCat_Bot - Sistema ON/OFF por grupo
// Solo los owners pueden activar o desactivar el bot con ".bot"

import fs from 'fs'

let handler = async (m, { conn, isOwner }) => {
  if (!m.isGroup) return m.reply('❌ Este comando solo se puede usar en grupos.')
  if (!isOwner) return m.reply('⚠️ Solo los *dueños del bot* pueden usar este comando.')

  // Alternar el estado del bot
  const chat = global.db.data.chats[m.chat] || {}
  chat.bot = !chat.bot
  global.db.data.chats[m.chat] = chat

  // Reacción y mensaje
  await m.react(chat.bot ? '🟢' : '🔴')
  await m.reply(`🤖 El bot ha sido *${chat.bot ? 'activado' : 'desactivado'}* en este grupo.`)
}

handler.help = ['bot']
handler.tags = ['owner']
handler.command = /^bot$/i
handler.owner = true

export default handler

// 🧩 BEFORE: Bloque que impide ejecutar comandos si el bot está apagado
export async function before(m, { isCommand }) {
  if (!m.isGroup) return true
  const chat = global.db.data.chats[m.chat]

  // Si el bot está apagado en este grupo y el mensaje es comando
  if (chat && chat.bot === false && isCommand) {
    await m.reply('🤖 El bot está *apagado* en este grupo.\nSolo un *owner* puede activarlo con *.bot* 💤')
    return !1 // Detiene la ejecución del comando
  }

  return !0 // Si está encendido, sigue todo normal
}
