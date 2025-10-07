// 🟢 FelixCat_Bot - Sistema ON/OFF global por grupo
// Solo los owners pueden activarlo o desactivarlo con .bot

import fs from 'fs'

let handler = async (m, { conn, isOwner }) => {
  if (!m.isGroup) return m.reply('❌ Este comando solo se puede usar en grupos.')
  if (!isOwner) return m.reply('⚠️ Solo los *dueños del bot* pueden usar este comando.')

  const chat = global.db.data.chats[m.chat] || {}
  chat.bot = !chat.bot
  global.db.data.chats[m.chat] = chat

  await m.react(chat.bot ? '🟢' : '🔴')
  await m.reply(`🤖 El bot ha sido *${chat.bot ? 'activado' : 'desactivado'}* en este grupo.`)
}
handler.help = ['bot']
handler.tags = ['owner']
handler.command = /^bot$/i
handler.owner = true

export default handler

// 🧩 BEFORE para bloquear comandos si el bot está apagado
export async function before(m, { conn }) {
  if (!m.isGroup) return true
  const chat = global.db.data.chats[m.chat]

  // detectar si es comando
  const prefixRegex = /^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@#$%^&.©^]/i
  const isCommand = prefixRegex.test(m.text)

  if (chat && chat.bot === false && isCommand) {
    await conn.sendMessage(m.chat, { text: '🤖 El bot está *apagado* en este grupo.\nSolo un *owner* puede activarlo con *.bot* 💤' }, { quoted: m })
    return !1
  }

  return !0
}
