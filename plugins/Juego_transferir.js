// plugins/_casino_transferir.js
let handler = async (m, { conn, args, usedPrefix, command }) => {
  const CURRENCY = 'Fichas'
  const TAX = 0.02 // 2% de comisión
  const sender = m.sender
  const shortSender = sender.split('@')[0]

  // --- Base de datos ---
  if (!global.db) global.db = { data: {} }
  if (!global.db.data.users) global.db.data.users = {}
  const users = global.db.data.users

  // --- Buscar destinatario ---
  let who
  if (m.isGroup) {
    if (m.mentionedJid?.length) who = m.mentionedJid[0]
    else if (m.quoted?.sender) who = m.quoted.sender
  }
  if (!who && args[0] && args[0].match(/[0-9]/))
    who = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net'

  if (!who || who === sender)
    return m.reply(`💬 Uso: ${usedPrefix}${command} @usuario cantidad\nEjemplo: ${usedPrefix}${command} @benja 1000`, null, { mentions: [m.sender] })

  const amount = parseInt(args[1] || args[0])
  if (isNaN(amount) || amount <= 0)
    return m.reply(`❌ Cantidad inválida.`)

  // --- Crear cuentas si no existen ---
  if (!users[sender]) users[sender] = { coins: 100, bank: 0, lastDaily: 0, history: [], inventory: [] }
  if (!users[who]) users[who] = { coins: 100, bank: 0, lastDaily: 0, history: [], inventory: [] }

  const userFrom = users[sender]
  const userTo = users[who]

  // --- Validar saldo ---
  if (userFrom.coins < amount)
    return m.reply(`❌ @${shortSender} — No tienes suficiente saldo (${userFrom.coins} ${CURRENCY}).`, null, { mentions: [sender] })

  // --- Calcular comisión ---
  const fee = Math.floor(amount * TAX)
  const net = amount - fee

  // --- Transferir ---
  userFrom.coins -= amount
  userTo.coins += net

  // --- Historial ---
  const date = new Date().toLocaleDateString()
  const msgFrom = `📤 Transferiste ${net} ${CURRENCY} a ${who.split('@')[0]} (Comisión ${fee}) — ${date}`
  const msgTo = `📥 Recibiste ${net} ${CURRENCY} de ${shortSender} — ${date}`

  if (!Array.isArray(userFrom.history)) userFrom.history = []
  if (!Array.isArray(userTo.history)) userTo.history = []
  userFrom.history.unshift(msgFrom)
  userTo.history.unshift(msgTo)
  if (userFrom.history.length > 50) userFrom.history.pop()
  if (userTo.history.length > 50) userTo.history.pop()

  // --- Enviar mensaje ---
  const text = `✅ *Transferencia exitosa*\n\n` +
    `📤 De: @${shortSender}\n` +
    `📥 A: @${who.split('@')[0]}\n` +
    `💸 Monto: ${amount.toLocaleString()} ${CURRENCY}\n` +
    `💰 Comisión: ${fee} ${CURRENCY}\n` +
    `🏦 Recibe: ${net} ${CURRENCY}\n\n` +
    `📊 Nuevo saldo: ${userFrom.coins.toLocaleString()} ${CURRENCY}`

  await conn.sendMessage(m.chat, { text, mentions: [sender, who] })
}

handler.help = ['transferir *@usuario cantidad*']
handler.tags = ['casino']
handler.command = /^transferir$/i

export default handler
