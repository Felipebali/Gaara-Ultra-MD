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
    history: [],
    inventory: [],
  }

  const user = global.db.data.users[who]
  const menuState = global.db.data.casinoMafia

  // ---------- FIX ANTI NaN ----------
  if (isNaN(user.coins)) user.coins = owners.includes(short) ? 500 : 100
  if (user.coins < 0) user.coins = 0
  if (isNaN(user.bank)) user.bank = 0
  if (!Array.isArray(user.history)) user.history = []

  // ---------- CONFIG ----------
  const CURRENCY = 'Fichas'
  const DAILY_REWARD = 50
  const DAILY_COOLDOWN = 24 * 60 * 60 * 1000
  const TAX_RATE = 0.05

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
• .history

🔒 Owners
• .mafioso (abrir/cerrar casino)
`, [m.sender])
  }

  // ---------- BLOQUEO SI ESTÁ CERRADO ----------
  if (!menuState.active && ['saldo','daily','apuesta','ruleta','slots','history','depositar','sacar'].includes(command.toLowerCase()))
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

  // ---------- DEPOSITAR ----------
  if (command.toLowerCase() === 'depositar') {
    if (!args[0]) return safeSend(m.chat, `Uso: ${usedPrefix}depositar <cantidad>`, [m.sender])
    const amount = parseInt(args[0])
    if (isNaN(amount) || amount <= 0) return safeSend(m.chat, `Cantidad inválida`, [m.sender])
    if (user.coins < amount) return safeSend(m.chat, `No tienes fichas suficientes`, [m.sender])
    user.coins -= amount
    user.bank += amount
    pushHistory(who, `Deposita ${format(amount)} al banco`)
    return safeSend(m.chat, `${BANK} @${short} — Depositaste ${format(amount)} en tu cuenta bancaria.`, [m.sender])
  }

  // ---------- SACAR ----------
  if (command.toLowerCase() === 'sacar') {
    if (!args[0]) return safeSend(m.chat, `Uso: ${usedPrefix}sacar <cantidad>`, [m.sender])
    const amount = parseInt(args[0])
    if (isNaN(amount) || amount <= 0) return safeSend(m.chat, `Cantidad inválida`, [m.sender])
    if (user.bank < amount) return safeSend(m.chat, `No tienes tanto en el banco.`, [m.sender])
    user.bank -= amount
    user.coins += amount
    pushHistory(who, `Saca ${format(amount)} del banco`)
    return safeSend(m.chat, `${BANK} @${short} — Retiraste ${format(amount)} del banco.`, [m.sender])
  }

  // ---------- APUESTA ----------
  if (command.toLowerCase() === 'apuesta') {
    if (!args[0]) return safeSend(m.chat, `Uso: ${usedPrefix}apuesta <cantidad>`, [m.sender])
    let amount = parseInt(args[0])
    if (isNaN(amount) || amount <= 0) return safeSend(m.chat, `Cantidad inválida`, [m.sender])
    if (user.coins < amount) return safeSend(m.chat, `No tienes fichas suficientes`, [m.sender])

    const winChance = owners.includes(short) ? 0.85 : 0.5
    const win = Math.random() < winChance

    if (win) {
      const gana = amount - Math.floor(amount * TAX_RATE)
      user.coins += gana
      pushHistory(who, `Apuesta ganada +${gana}`)
      return safeSend(m.chat, `${CAS} @${short} ganó ${format(gana)} 💸${owners.includes(short) ? `\n🔥 Respeto para el jefe.` : ''}`, [m.sender])
    } else {
      user.coins -= amount
      pushHistory(who, `Apuesta perdida -${amount}`)
      return safeSend(m.chat, `${SKULL} @${short} perdió ${format(amount)}`, [m.sender])
    }
  }

  // ---------- RULETA ----------
  if (command.toLowerCase() === 'ruleta') {
    if (!args[0]) return safeSend(m.chat, `Uso: ${usedPrefix}ruleta <cantidad>`, [m.sender])
    let amount = parseInt(args[0])
    if (isNaN(amount) || amount <= 0) return safeSend(m.chat, `Cantidad inválida`, [m.sender])
    if (user.coins < amount) return safeSend(m.chat, `No tienes fichas suficientes`, [m.sender])

    const winChance = owners.includes(short) ? 0.85 : 0.5
    if (Math.random() < winChance) {
      user.coins += amount
      pushHistory(who, `Ruleta ganada +${amount}`)
      return safeSend(m.chat, `${CAS} 🟢 Ruleta ganada +${format(amount)} ${owners.includes(short) ? `\n👑 Mano bendecida de Don Feli.` : ''}`, [m.sender])
    } else {
      user.coins -= amount
      pushHistory(who, `Ruleta perdida -${amount}`)
      return safeSend(m.chat, `${SKULL} 🔴 Ruleta perdida -${format(amount)}`, [m.sender])
    }
  }

  // ---------- SLOTS ----------
  if (command.toLowerCase() === 'slots') {
    const symbols = ['🍒','🍋','🍊','🍉','💎','7️⃣']
    const w = owners.includes(short) ? 0.85 : 0.4
    if (Math.random() < w) {
      user.coins += 120
      pushHistory(who, `Slots ganada +120`)
      return safeSend(m.chat, `🎰 ${randomSymbol(symbols)} ${randomSymbol(symbols)} ${randomSymbol(symbols)}\n@${short} ganó +120${owners.includes(short)?`\n🔥 El poder del capo no falla.`:''}`, [m.sender])
    } else {
      user.coins -= 30
      pushHistory(who, `Slots perdida -30`)
      return safeSend(m.chat, `🎰 ${randomSymbol(symbols)} ${randomSymbol(symbols)} ${randomSymbol(symbols)}\nNada esta vez...`, [m.sender])
    }
  }

  // ---------- HISTORY ----------
  if (command.toLowerCase() === 'history') {
    if (!Array.isArray(user.history) || !user.history.length)
      return safeSend(m.chat, `Sin historial aún`, [m.sender])
    return safeSend(m.chat, `${CAS} Historial de @${short}\n` + user.history.join('\n'), [m.sender])
  }
}

handler.help = ['mafioso','menucasino','saldo','daily','depositar','sacar','apuesta','ruleta','slots','history']
handler.tags = ['casino']
handler.command = /^mafioso|menucasino|saldo|daily|depositar|sacar|apuesta|ruleta|slots|history$/i
export default handler
