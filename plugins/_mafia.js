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
• .transferir <cantidad>

🔒 Owners
• .mafioso (abrir/cerrar casino)
`, [m.sender])
  }

  // ---------- BLOQUEO SI ESTÁ CERRADO ----------
  if (!menuState.active && ['saldo','daily','apuesta','ruleta','slots','history','depositar','sacar','robar'].includes(command.toLowerCase()))
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

  // ---------- ROBAR ----------
  if (command.toLowerCase() === 'robar' || command.toLowerCase() === 'rob') {
    // Solo en grupos (recomendado) — si querés habilitar en PM, quitá la siguiente línea
    if (!m.isGroup) return safeSend(m.chat, `❗ Este comando funciona solo en grupos.`, [m.sender])

    // determinar objetivo
    let targetJid = null
    if (m.mentionedJid && m.mentionedJid.length) targetJid = m.mentionedJid[0]
    else if (m.quoted && m.quoted.sender) targetJid = m.quoted.sender
    else if (args[0] && args[0].match(/\d/)) {
      const num = args[0].replace(/[^0-9]/g,'')
      if (num) targetJid = num + '@s.whatsapp.net'
    }

    if (!targetJid) return safeSend(m.chat, `Uso: ${usedPrefix}robar @usuario [cantidad]`, [m.sender])

    // evitar robar a uno mismo
    if (targetJid === who) return safeSend(m.chat, `No puedes robarte a vos mismo.`, [m.sender])

    // evitar robar owners
    const targetShort = targetJid.split('@')[0].replace(/\D/g,'')
    if (owners.includes(targetShort)) return safeSend(m.chat, `No puedes robar a un owner.`, [m.sender])

    // evitar robar al bot
    if (conn.user && targetJid === conn.user.jid) return safeSend(m.chat, `No intentes robar al bot.`, [m.sender])

    // inicializar target en DB si hace falta
    if (!global.db.data.users[targetJid]) {
      global.db.data.users[targetJid] = {
        coins: owners.includes(targetShort) ? 500 : 100,
        bank: 0,
        lastDaily: 0,
        lastRob: 0,
        history: [],
        inventory: [],
      }
    }
    const targetUser = global.db.data.users[targetJid]
    if (isNaN(targetUser.coins)) targetUser.coins = owners.includes(targetShort) ? 500 : 100
    if (!Array.isArray(targetUser.history)) targetUser.history = []

    // cooldown del ladrón
    const now = Date.now()
    if (now - user.lastRob < ROB_COOLDOWN) {
      const remain = ROB_COOLDOWN - (now - user.lastRob)
      const mins = Math.ceil(remain / 60000)
      return safeSend(m.chat, `⏳ Tenés que esperar ${mins} minutos para robar otra vez.`, [m.sender])
    }

    // cantidad solicitada o por defecto
    let amountRequested = 0
    if (args && args.length > 1 && args[1]) {
      const n = parseInt(args[1].replace(/[^0-9]/g,''), 10)
      if (!isNaN(n) && n > 0) amountRequested = n
    }

    // si no pidió cantidad, robar entre 10% y 50% del objetivo (o al menos 1)
    const minPercent = 0.10
    const maxPercent = 0.50
    const pct = Math.random() * (maxPercent - minPercent) + minPercent
    let possible = Math.max(1, Math.floor(targetUser.coins * pct))

    if (amountRequested > 0) possible = Math.min(possible, amountRequested, targetUser.coins)

    if (targetUser.coins <= 0 || possible <= 0) {
      user.lastRob = now
      pushHistory(who, `Intento robar sin botín a @${targetShort}`)
      return safeSend(m.chat, `⚠️ @${targetShort} no tiene fichas para robar.`, { mentions: [targetJid] })
    }

    // decidir éxito
    const successRate = owners.includes(short) ? ROB_SUCCESS_RATE_OWNER : ROB_SUCCESS_RATE_NORMAL
    const roll = Math.random()

    user.lastRob = now // registra intento (tanto éxito como fallo)

    if (roll < successRate) {
      // éxito
      const stolen = Math.max(1, Math.floor(possible))
      targetUser.coins = Math.max(0, targetUser.coins - stolen)
      user.coins += stolen
      pushHistory(who, `Robó +${stolen} a @${targetShort}`)
      pushHistory(targetJid, `Le robaron -${stolen} por @${short}`)
      return safeSend(m.chat, `💰 Robo exitoso!\n@${short} robó ${format(stolen)} a @${targetShort}`, [who, targetJid])
    } else {
      // fallo -> multa porcentual (5% - 15% del balance del ladrón) y una pequeña compensación al objetivo (opcional)
      const thiefBalance = Math.max(0, user.coins)
      const penaltyPct = Math.random() * (0.15 - 0.05) + 0.05
      const penalty = Math.min(thiefBalance, Math.ceil(thiefBalance * penaltyPct))
      user.coins = Math.max(0, user.coins - penalty)
      // opcional: dar pequeña recompensa al objetivo (por ejemplo 30% de la multa)
      const compensation = Math.ceil(penalty * 0.30)
      targetUser.coins += compensation

      pushHistory(who, `Falló intento de robo -multas ${penalty}`)
      pushHistory(targetJid, `Protegido: recibió +${compensation} tras intento de robo`)

      return safeSend(m.chat, `❌ Fallaste en el intento.\nPagás una multa de ${format(penalty)}.\n@${targetShort} recibe ${format(compensation)} como compensación.`, [m.sender, targetJid])
    }
  }

  // ---------- HISTORY ----------
  if (command.toLowerCase() === 'history') {
    if (!Array.isArray(user.history) || !user.history.length)
      return safeSend(m.chat, `Sin historial aún`, [m.sender])
    return safeSend(m.chat, `${CAS} Historial de @${short}\n` + user.history.join('\n'), [m.sender])
  }
}

handler.help = ['mafioso','menucasino','saldo','daily','depositar','sacar','apuesta','ruleta','slots','history','robar']
handler.tags = ['casino']
handler.command = /^mafioso|menucasino|saldo|daily|depositar|sacar|apuesta|ruleta|slots|history|robar|rob$/i
export default handler
