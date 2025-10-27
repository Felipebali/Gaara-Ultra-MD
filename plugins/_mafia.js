// plugins/_casino_chetar.js
let handler = async (m, { conn, args = [], usedPrefix = '.', command = '' }) => {

  const owners = ['59898719147','59896026646'] // principal primero
  const who = m.sender
  const short = who.split('@')[0]

  // ---------- DB ----------
  if (!global.db) global.db = { data: {} }
  if (!global.db.data.casinoMafia) global.db.data.casinoMafia = { active: true }
  if (!global.db.data.users) global.db.data.users = {}

  if (!global.db.data.users[who]) global.db.data.users[who] = {
    coins: owners.includes(short) ? 500 : 100,
    bank: 0,
    lastDaily: 0,
    lastRob: 0,
    history: [],
    inventory: [],
  }

  const user = global.db.data.users[who]
  const menuState = global.db.data.casinoMafia

  // ---------- FIX ANTI NaN ----------
  if (isNaN(user.coins)) user.coins = owners.includes(short) ? 500 : 100
  if (user.coins < 0) user.coins = 0
  if (isNaN(user.bank)) user.bank = 0
  if (typeof user.lastRob !== 'number') user.lastRob = 0
  if (!Array.isArray(user.history)) user.history = []

  // ---------- CONFIG ----------
  const CURRENCY = 'Fichas'
  const DAILY_REWARD = 50
  const DAILY_COOLDOWN = 24 * 60 * 60 * 1000
  const TAX_RATE = 0.05
  const ROB_COOLDOWN = 60 * 60 * 1000 // 1 hora
  const ROB_SUCCESS_RATE_NORMAL = 0.45
  const ROB_SUCCESS_RATE_OWNER = 0.85
  const TRANSFER_TAX = 0.02 // 2%

  // ---------- ICONOS ----------
  const ALERT = '🚨'
  const CAS = '🎰'
  const SKULL = '💀'
  const BANK = '🏦'

  // ---------- HELPERS ----------
  const safeSend = async (chat, text, mentions = []) => {
    try { await conn.sendMessage(chat, { text, mentions }) }
    catch { try { await conn.sendMessage(chat, { text }) } catch (e) { console.error(e) } }
  }

  const pushHistory = (jid, s) => {
    const u = global.db.data.users[jid]
    if (!u) return
    if (!Array.isArray(u.history)) u.history = []
    u.history.unshift(s)
    if (u.history.length > 50) u.history.pop()
  }

  const format = n => `${n} ${CURRENCY}`
  const randomSymbol = (arr) => arr[Math.floor(Math.random() * arr.length)]

  // ---------- TOGGLE OWNER ----------
  if (command.toLowerCase() === 'mafioso') {
    if (!owners.includes(short)) return safeSend(m.chat, `${SKULL} @${short} — Solo owners.`, [m.sender])
    menuState.active = !menuState.active
    return safeSend(m.chat, menuState.active ? `${ALERT} @${short} — El casino abrió 🍷🔫` : `${SKULL} @${short} — El casino cerró.`, [m.sender])
  }

  // ---------- MENÚ ----------
  if (command.toLowerCase() === 'menucasino') {
    if (!menuState.active) return safeSend(m.chat, `${SKULL} @${short} — Casinò cerrado.`, [m.sender])
    return safeSend(m.chat,
`${CAS} *CASINO MAFIOSO – Don Feli*  
Jugador: @${short}  
Saldo: ${format(user.coins)}  
Banco: ${format(user.bank)}

🎲 *Juegos*
• .apuesta <cantidad>
• .ruleta <cantidad>
• .slots

💰 *Economía*
• .saldo
• .daily
• .depositar <cantidad>
• .sacar <cantidad>
• .transferir @usuario <cantidad>
• .history

🔒 Owners
• .mafioso (abrir/cerrar casino)
`, [m.sender])
  }

  // ---------- BLOQUEO SI ESTÁ CERRADO ----------
  if (!menuState.active && ['saldo','daily','apuesta','ruleta','slots','history','depositar','sacar','robar','transferir'].includes(command.toLowerCase()))
    return safeSend(m.chat, `${SKULL} @${short} — El casino está cerrado.`, [m.sender])

  // ---------- SALDO ----------
  if (command.toLowerCase() === 'saldo')
    return safeSend(m.chat, `${CAS} @${short} — Tienes ${format(user.coins)} en mano y ${format(user.bank)} en el banco.`, [m.sender])

  // ---------- DAILY ----------
  if (command.toLowerCase() === 'daily') {
    const now = Date.now()
    if (now - user.lastDaily < DAILY_COOLDOWN) {
      const h = Math.floor((DAILY_COOLDOWN - (now - user.lastDaily)) / 3600000)
      return safeSend(m.chat, `${SKULL} @${short} — Ya reclamaste, vuelve en ${h}h`, [m.sender])
    }
    user.coins += DAILY_REWARD
    user.lastDaily = now
    pushHistory(who, `Daily +${DAILY_REWARD}`)
    return safeSend(m.chat, `${CAS} @${short} — Reclamas ${format(DAILY_REWARD)}`, [m.sender])
  }

  // ---------- TRANSFERIR ----------
  if (command.toLowerCase() === 'transferir') {
    let targetJid = null
    if (m.mentionedJid && m.mentionedJid.length) targetJid = m.mentionedJid[0]
    else if (m.quoted && m.quoted.sender) targetJid = m.quoted.sender
    else if (args[0] && args[0].match(/\d/)) {
      const num = args[0].replace(/[^0-9]/g,'')
      if (num) targetJid = num + '@s.whatsapp.net'
    }

    const amount = parseInt(args[1] || args[0])
    if (!targetJid || isNaN(amount) || amount <= 0)
      return safeSend(m.chat, `💬 Uso: ${usedPrefix}transferir @usuario cantidad`, [m.sender])

    if (targetJid === who) return safeSend(m.chat, `No puedes transferirte a ti mismo.`, [m.sender])
    if (!global.db.data.users[targetJid])
      global.db.data.users[targetJid] = { coins: 100, bank: 0, lastDaily: 0, lastRob: 0, history: [], inventory: [] }

    const target = global.db.data.users[targetJid]
    if (user.coins < amount) return safeSend(m.chat, `Saldo insuficiente.`, [m.sender])

    const fee = Math.floor(amount * TRANSFER_TAX)
    const net = amount - fee

    user.coins -= amount
    target.coins += net

    const date = new Date().toLocaleDateString()
    pushHistory(who, `Transferiste ${net} a @${targetJid.split('@')[0]} (Comisión ${fee}) — ${date}`)
    pushHistory(targetJid, `Recibiste ${net} de @${short} — ${date}`)

    return safeSend(m.chat, 
      `✅ *Transferencia completada*\n\n📤 De: @${short}\n📥 A: @${targetJid.split('@')[0]}\n💸 Monto: ${format(amount)}\n💰 Comisión: ${format(fee)}\n🏦 Recibe: ${format(net)}\n\nSaldo actual: ${format(user.coins)}`, 
      [m.sender, targetJid])
  }

  // ---------- (resto de tus comandos sigue igual: depositar, sacar, apuesta, ruleta, slots, robar, history...) ----------
  // ... (aquí se conserva todo tu código posterior sin cambios)
}

handler.help = ['mafioso','menucasino','saldo','daily','depositar','sacar','apuesta','ruleta','slots','history','robar','transferir']
handler.tags = ['casino']
handler.command = /^mafioso|menucasino|saldo|daily|depositar|sacar|apuesta|ruleta|slots|history|robar|rob|transferir$/i
export default handler
