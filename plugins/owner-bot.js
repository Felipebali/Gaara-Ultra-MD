// 🟢 FelixCat_Bot - Sistema ON/OFF global por grupo
// Solo el owner puede activar o desactivar el bot con ".bot"

import fs from 'fs'

let handler = async (m, { conn, isOwner }) => {
  if (!m.isGroup) return m.reply('❌ Este comando solo se puede usar en grupos.')
  if (!isOwner) return m.reply('⚠️ Solo los *dueños del bot* pueden usar este comando.')

  // Alternar estado del bot
  const chat = global.db.data.chats[m.chat] || {}
  chat.bot = !chat.bot
  global.db.data.chats[m.chat] = chat

  // Respuesta con emoji de estado
  await m.react(chat.bot ? '🟢' : '🔴')
  await m.reply(`🤖 El bot ha sido *${chat.bot ? 'activado' : 'desactivado'}* en este grupo.`)
}

handler.help = ['bot']
handler.tags = ['owner']
handler.command = /^bot$/i
handler.owner = true

export default handler

// 🧩 Bloque BEFORE para ignorar comandos si el bot está desactivado
export async function before(m, { isCommand }) {
  if (!m.isGroup) return true
  const chat = global.db.data.chats[m.chat]

  // Si el bot está apagado en este grupo y el mensaje es comando, ignorar
  if (chat && chat.bot === false && isCommand) {
    return !1 // no ejecuta ningún comando
  }

  return !0 // ejecuta normalmente
}
