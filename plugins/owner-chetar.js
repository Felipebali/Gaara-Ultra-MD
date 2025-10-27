// plugins/_casino_chetar.js
let handler = async (m, { conn, text, args }) => {

  const owners = ['59898719147','59896026646'] // Dueños del casino
  const senderShort = m.sender.split('@')[0]
  if (!owners.includes(senderShort))
    return m.reply(`🚫 @${senderShort} — No tienes permiso para usar este comando.`, null, { mentions: [m.sender] })

  let who
  let cantidad = 999999 // valor por defecto si no se indica cantidad

  // --- detectar usuario ---
  if (m.isGroup) {
    if (m.mentionedJid && m.mentionedJid.length > 0) who = m.mentionedJid[0]
    else if (m.quoted && m.quoted.sender) who = m.quoted.sender
  }

  // --- detectar texto o número ---
  if (text) {
    const partes = text.trim().split(/\s+/)
    if (!who && partes[0].match(/\d+/)) who = partes[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net'
    if (partes[1] && !isNaN(partes[1])) cantidad = parseInt(partes[1])
  }

  if (!who) who = m.sender
  if (isNaN(cantidad) || cantidad <= 0) cantidad = 999999

  // --- base de datos ---
  if (!global.db) global.db = { data: {} }
  if (!global.db.data.users) global.db.data.users = {}
  if (!global.db.data.users[who]) global.db.data.users[who] = {
    coins: 100,
    bank: 0,
    lastDaily: 0,
    history: [],
    inventory: [],
  }

  const user = global.db.data.users[who]

  // --- aplicar chetada ---
  user.coins = cantidad
  user.bank = cantidad
  user.history.unshift(`💼 Don Feli te chetó (${new Date().toLocaleDateString()}) con ${cantidad} fichas.`)
  if (user.history.length > 50) user.history.pop()

  await conn.sendMessage(m.chat, {
    text: `👑 *¡Cuentas chetadas con éxito!*\n\n` +
          `🎩 Usuario: @${who.split('@')[0]}\n` +
          `💰 Fichas: ${user.coins.toLocaleString()}\n` +
          `🏦 Banco: ${user.bank.toLocaleString()}`,
    mentions: [who]
  })
}

handler.help = ['chetar *@usuario* <cantidad>']
handler.tags = ['owner']
handler.command = /^chetar$/i
handler.rowner = true

export default handler
