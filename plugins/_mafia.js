// plugins/_casino_chetar.js
let handler = async (m, { conn, args = [], usedPrefix = '.', command = '' }) => {

  const owners = ['59898719147','59896026646'] // Dueños del casino
  const who = m.sender
  const short = who.split('@')[0]

  // ---------- BASE DE DATOS ----------
  if (!global.db) global.db = { data: {} }
  if (!global.db.data.casinoMafia) global.db.data.casinoMafia = { active: true }
  if (!global.db.data.users) global.db.data.users = {}

  // Inicializar usuario si no existe
  if (!global.db.data.users[who]) global.db.data.users[who] = {
    coins: owners.includes(short) ? 500 : 100,
    bank: 0,
    lastDaily: 0,
    lastRob: 0,
    history: [],
    inventory: [],
  }

  const user = global.db.data.users[who]
  const casino = global.db.data.casinoMafia

  // ---------- FIX ANTI NaN ----------
  if (isNaN(user.coins)) user.coins = owners.includes(short) ? 500 : 100
  if (isNaN(user.bank)) user.bank = 0
  if (!Array.isArray(user.history)) user.history = []
  if (typeof user.lastRob !== 'number') user.lastRob = 0

  // ---------- CONFIGURACIÓN ----------
  const CURRENCY = 'Fichas'
  const DAILY_REWARD = 50
  const DAILY_COOLDOWN = 24 * 60 * 60 * 1000
  const TAX_RATE = 0.05
  const TRANSFER_TAX = 0.02
  const ROB_COOLDOWN = 60 * 60 * 1000 // 1 hora
  const ROB_SUCCESS_RATE_NORMAL = 0.45
  const ROB_SUCCESS_RATE_OWNER = 0.85

  // ---------- ICONOS ----------
  const CAS = '🎰', SKULL = '💀', BANK = '🏦', ALERT = '🚨', MONEY = '💸'

  // ---------- FUNCIONES ----------
  const safeSend = async (chat, text, mentions = []) => {
    try { await conn.sendMessage(chat, { text, mentions }) }
    catch { try { await conn.sendMessage(chat, { text }) } catch (e) { console.error(e) } }
  }

  const pushHistory = (jid, msg) => {
    if (!global.db || !global.db.data || !global.db.data.users) return
    const u = global.db.data.users[jid]
    if (!u) return
    if (!Array.isArray(u.history)) u.history = []
    u.history.unshift(msg)
    if (u.history.length > 50) u.history.pop()
  }

  const ensureUser = (jid) => {
    if (!global.db.data.users[jid]) {
      global.db.data.users[jid] = { coins: 100, bank: 0, lastDaily: 0, lastRob: 0, history: [], inventory: [] }
    }
    return global.db.data.users[jid]
  }

  const format = n => `${n.toLocaleString()} ${CURRENCY}`
  const randomSymbol = arr => arr[Math.floor(Math.random() * arr.length)]

  // ---------- TOGGLE CASINO ----------
  if (command === 'mafioso') {
    if (!owners.includes(short)) return safeSend(m.chat, `${SKULL} @${short} — Solo dueños pueden hacerlo.`, [m.sender])
    casino.active = !casino.active
    return safeSend(m.chat, casino.active ? `${ALERT} El casino abrió 🍷🔫` : `${SKULL} El casino cerró.`, [m.sender])
  }

  // ---------- MENÚ ----------
  if (command === 'menucasino') {
    if (!casino.active) return safeSend(m.chat, `${SKULL} El casino está cerrado.`, [m.sender])
    return safeSend(m.chat,
`${CAS} *CASINO MAFIOSO – Don Feli*  
👤 Jugador: @${short}  
💰 Saldo: ${format(user.coins)}  
🏦 Banco: ${format(user.bank)}

🎲 *Juegos*
• .apuesta <cantidad o %>
• .ruleta <cantidad>
• .slots
• .robar @usuario [cantidad]

💰 *Economía*
• .saldo
• .daily
• .depositar <cantidad>
• .sacar <cantidad>
• .transferir @usuario <cantidad>
• .history

🔒 *Owners*
• .mafioso — abrir/cerrar casino`, [m.sender])
  }

  // ---------- BLOQUEO SI ESTÁ CERRADO ----------
  const restricted = ['saldo','daily','depositar','sacar','apuesta','ruleta','slots','history','transferir','robar','rob']
  if (!casino.active && restricted.includes(command))
    return safeSend(m.chat, `${SKULL} @${short} — El casino está cerrado.`, [m.sender])

  // ---------- SALDO ----------
  if (command === 'saldo')
    return safeSend(m.chat, `${CAS} @${short} — Tienes ${format(user.coins)} y ${format(user.bank)} en el banco.`, [m.sender])

  // ---------- DAILY ----------
  if (command === 'daily') {
    const now = Date.now()
    if (now - user.lastDaily < DAILY_COOLDOWN) {
      const h = Math.ceil((DAILY_COOLDOWN - (now - user.lastDaily)) / 3600000)
      return safeSend(m.chat, `${SKULL} @${short} — Esperá ${h}h para el próximo daily.`, [m.sender])
    }
    user.coins += DAILY_REWARD
    user.lastDaily = now
    pushHistory(who, `Daily +${DAILY_REWARD}`)
    return safeSend(m.chat, `${CAS} @${short} — Reclamas ${format(DAILY_REWARD)}.`, [m.sender])
  }

  // ---------- DEPOSITAR ----------
  if (command === 'depositar') {
    if (!args[0]) return safeSend(m.chat, `Uso: ${usedPrefix}depositar <cantidad>`, [m.sender])
    const amount = parseInt(args[0])
    if (isNaN(amount) || amount <= 0) return safeSend(m.chat, `Cantidad inválida.`, [m.sender])
    if (user.coins < amount) return safeSend(m.chat, `No tienes tantas fichas.`, [m.sender])
    user.coins -= amount
    user.bank += amount
    pushHistory(who, `Depositó ${format(amount)}`)
    return safeSend(m.chat, `${BANK} Depositaste ${format(amount)}.`, [m.sender])
  }

  // ---------- SACAR ----------
  if (command === 'sacar') {
    if (!args[0]) return safeSend(m.chat, `Uso: ${usedPrefix}sacar <cantidad>`, [m.sender])
    const amount = parseInt(args[0])
    if (isNaN(amount) || amount <= 0) return safeSend(m.chat, `Cantidad inválida.`, [m.sender])
    if (user.bank < amount) return safeSend(m.chat, `No tienes tanto en el banco.`, [m.sender])
    user.bank -= amount
    user.coins += amount
    pushHistory(who, `Retiró ${format(amount)}`)
    return safeSend(m.chat, `${BANK} Retiraste ${format(amount)}.`, [m.sender])
  }

  // ---------- TRANSFERIR ----------
  if (command === 'transferir') {
    if (!args[0] || !args[1]) return safeSend(m.chat, `Uso: ${usedPrefix}transferir @usuario <cantidad>`, [m.sender])

    let target = m.mentionedJid && m.mentionedJid.length > 0 ? m.mentionedJid[0] : null
    if (!target) {
      const num = args[0].replace(/[^0-9]/g, '')
      if (num) target = num + '@s.whatsapp.net'
    }
    if (!target) return safeSend(m.chat, `Debes mencionar o escribir el número del jugador.`, [m.sender])

    const amount = parseInt(args[1])
    if (isNaN(amount) || amount <= 0) return safeSend(m.chat, `Cantidad inválida.`, [m.sender])
    if (user.coins < amount) return safeSend(m.chat, `No tienes suficientes fichas.`, [m.sender])

    const receptor = ensureUser(target)
    const tax = Math.floor(amount * TRANSFER_TAX)
    const final = amount - tax

    user.coins -= amount
    receptor.coins += final

    pushHistory(who, `Envió ${format(amount)} a ${target.split('@')[0]} (-${format(tax)} comisión)`)
    pushHistory(target, `Recibió ${format(final)} de ${short}`)

    return safeSend(m.chat, `${MONEY} *Transferencia completada*\n\n📤 De: @${short}\n📥 A: @${target.split('@')[0]}\n💸 Monto: ${format(amount)}\n💰 Comisión: ${format(tax)} (2%)\n🏦 Recibido: ${format(final)}`, [m.sender, target])
  }

  // ---------- APUESTA ----------
  if (command === 'apuesta') {
    if (!args[0]) return safeSend(m.chat, `Uso: ${usedPrefix}apuesta <cantidad o %>`, [m.sender])

    let amount = 0
    const arg = args[0].trim()

    // Aceptar porcentajes
    if (arg.endsWith('%')) {
      const perc = parseFloat(arg.replace('%',''))
      if (isNaN(perc) || perc <= 0 || perc > 100)
        return safeSend(m.chat, `Porcentaje inválido (1–100%)`, [m.sender])
      amount = Math.floor(user.coins * (perc / 100))
    } else {
      amount = parseInt(arg)
    }

    if (isNaN(amount) || amount <= 0) return safeSend(m.chat, `Cantidad inválida.`, [m.sender])
    if (user.coins < amount) return safeSend(m.chat, `No tienes fichas suficientes.`, [m.sender])

    const win = Math.random() < (owners.includes(short) ? 0.85 : 0.5)
    if (win) {
      const gain = amount - Math.floor(amount * TAX_RATE)
      user.coins += gain
      pushHistory(who, `Apuesta ganada +${gain}`)
      return safeSend(m.chat, `${CAS} @${short} ganó ${format(gain)} 💸`, [m.sender])
    } else {
      user.coins -= amount
      pushHistory(who, `Apuesta perdida -${amount}`)
      return safeSend(m.chat, `${SKULL} @${short} perdió ${format(amount)}.`, [m.sender])
    }
  }

  // ---------- RULETA ----------
  if (command === 'ruleta') {
    if (!args[0]) return safeSend(m.chat, `Uso: ${usedPrefix}ruleta <cantidad>`, [m.sender])
    const amount = parseInt(args[0])
    if (isNaN(amount) || amount <= 0) return safeSend(m.chat, `Cantidad inválida.`, [m.sender])
    if (user.coins < amount) return safeSend(m.chat, `No tienes fichas suficientes.`, [m.sender])

    const win = Math.random() < (owners.includes(short) ? 0.85 : 0.5)
    if (win) {
      user.coins += amount
      pushHistory(who, `Ruleta ganada +${amount}`)
      return safeSend(m.chat, `🎯 Ruleta ganada +${format(amount)}.`, [m.sender])
    } else {
      user.coins -= amount
      pushHistory(who, `Ruleta perdida -${amount}`)
      return safeSend(m.chat, `❌ Ruleta perdida -${format(amount)}.`, [m.sender])
    }
  }

  // ---------- SLOTS ----------
  if (command === 'slots') {
    const symbols = ['🍒','🍋','🍊','🍉','💎','7️⃣']
    const win = Math.random() < (owners.includes(short) ? 0.8 : 0.4)
    if (win) {
      user.coins += 120
      pushHistory(who, `Slots ganada +120`)
      return safeSend(m.chat, `🎰 ${randomSymbol(symbols)} ${randomSymbol(symbols)} ${randomSymbol(symbols)}\nGanaste +120!`, [m.sender])
    } else {
      user.coins -= 30
      pushHistory(who, `Slots perdida -30`)
      return safeSend(m.chat, `🎰 ${randomSymbol(symbols)} ${randomSymbol(symbols)} ${randomSymbol(symbols)}\nNada esta vez...`, [m.sender])
    }
  }

  // ---------- ROBAR ----------
  if (command === 'robar' || command === 'rob') {
    // Solo en grupos (recomendado)
    if (!m.isGroup) return safeSend(m.chat, `❗ Este comando funciona mejor en grupos.`, [m.sender])

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
    if (targetJid === who) return safeSend(m.chat, `No puedes robarte a ti mismo.`, [m.sender])

    // evitar robar owners
    const targetShort = targetJid.split('@')[0].replace(/\D/g,'')
    if (owners.includes(targetShort)) return safeSend(m.chat, `No puedes robar a un owner.`, [m.sender])

    // evitar robar al bot
    if (conn.user && targetJid === conn.user.jid) return safeSend(m.chat, `No intentes robar al bot.`, [m.sender])

    // inicializar target en DB si hace falta
    const targetUser = ensureUser(targetJid)

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
      // fallo -> multa porcentual (5% - 15% del balance del ladrón) y compensación al objetivo
      const thiefBalance = Math.max(0, user.coins)
      const penaltyPct = Math.random() * (0.15 - 0.05) + 0.05
      const penalty = Math.min(thiefBalance, Math.ceil(thiefBalance * penaltyPct))
      user.coins = Math.max(0, user.coins - penalty)
      const compensation = Math.ceil(penalty * 0.30)
      targetUser.coins += compensation

      pushHistory(who, `Falló intento de robo -multas ${penalty}`)
      pushHistory(targetJid, `Protegido: recibió +${compensation} tras intento de robo`)

      return safeSend(m.chat, `❌ Fallaste en el intento.\nPagás una multa de ${format(penalty)}.\n@${targetShort} recibe ${format(compensation)} como compensación.`, [m.sender, targetJid])
    }
  }

  // ---------- HISTORY ----------
  if (command === 'history') {
    if (!user.history.length) return safeSend(m.chat, `Sin historial aún.`, [m.sender])
    return safeSend(m.chat, `${CAS} Historial de @${short}\n\n${user.history.join('\n')}`, [m.sender])
  }
}

// ---------- EXPORT ----------
handler.help = ['mafioso','menucasino','saldo','daily','depositar','sacar','transferir','apuesta','ruleta','slots','robar','history']
handler.tags = ['casino']
handler.command = /^(mafioso|menucasino|saldo|daily|depositar|sacar|transferir|apuesta|ruleta|slots|robar|rob|history)$/i

export default handler
