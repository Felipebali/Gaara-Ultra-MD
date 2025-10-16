/* plugins/_casino_mafia.js
   CASINO MAFIOSO — Estilo Italiano
   - Toggle: .mafioso (solo owners)
   - Menú: .menucasino
   - Juegos: apuesta, ruleta, slots
   - Economía: fichas, daily, historial
   - Moneda: Fichas
   - Menciones con ${who.split("@")[0]} sin citar mensajes
   - Owners reciben mensajes especiales (estilo D - Violento Mafia)
*/

let handler = async (m, { conn, args = [], usedPrefix = '.', command = '' }) => {
  const owners = ['59898719147','59896026646'] // principal primero
  const who = m.sender // jid completo: '5989...@s.whatsapp.net'
  const short = who.split('@')[0]

  // ===== INICIALIZACIÓN SEGURA DB =====
  if (!global.db) global.db = { data: {} }
  if (!global.db.data) global.db.data = {}
  if (!global.db.data.casinoMafia) global.db.data.casinoMafia = { active: true }
  if (!global.db.data.users) global.db.data.users = {}
  // ===== HELPERS DE USUARIO =====
  const ensureUser = (jid) => {
    if(!global.db.data.users) global.db.data.users = {}
    if(!global.db.data.users[jid]){
      const num = jid.split('@')[0]
      global.db.data.users[jid] = {
        coins: owners.includes(num) ? 500 : 0, // owners arrancan con 500, otros 0 si no existían
        lastDaily: 0,
        history: [],
        inventory: [],
      }
    } else {
      // aseguro que props existan incluso si DB está corrupta
      const u = global.db.data.users[jid]
      if(typeof u.coins !== 'number') u.coins = owners.includes(jid.split('@')[0]) ? 500 : 0
      if(!u.history || !Array.isArray(u.history)) u.history = []
      if(typeof u.lastDaily !== 'number') u.lastDaily = 0
      if(!u.inventory || !Array.isArray(u.inventory)) u.inventory = []
    }
    return global.db.data.users[jid]
  }

  // inicializo el usuario que ejecuta
  const user = ensureUser(who)
  const menuState = global.db.data.casinoMafia

  // ---------- CONFIG ----------
  const CURRENCY = 'Fichas'
  const DAILY_REWARD = 50
  const DAILY_COOLDOWN = 24 * 60 * 60 * 1000
  const TAX_RATE = 0.05

  // ---------- UNICODE ----------
  const ALERT = '\u{1F6A8}'
  const CAS = '\u{1F3B0}'
  const DICE = '\u{1F3B2}'
  const SKULL = '\u{1F480}'

  // ---------- MENSAJES MAFIA (ESTILO D) ----------
  const ownerWinMessages = [
    '💀 El negocio es el negocio... y vos sos la ley en la calle.',
    '👑 Cuando el patrón apuesta, el destino obedece.',
    '🔫 Plata o plomo, pero el capo siempre gana.',
    '🩸 Sangre fría y billete caliente… tu estilo, jefe.',
    '💼 El poder no se discute, se demuestra.'
  ]
  const ownerLoseMessages = [
    '🩸 Hasta los capos sangran a veces… pero vuelven más fuertes.',
    '💀 Nadie gana siempre… pero vos no sos cualquiera.',
    '🔥 Caer está permitido. Arrodillarse jamás.',
    '🕯️ Hoy duele, mañana se ajusta la cuenta.',
    '⚖️ La calle cobra y devuelve: aprendé, patrón.'
  ]
  const randomFrom = (arr) => arr[Math.floor(Math.random()*arr.length)]

  // ---------- HELPERS ----------
  const safeSend = async (chat, text, mentions = []) => {
    try {
      await conn.sendMessage(chat, { text, mentions })
    } catch (e) {
      try { await conn.sendMessage(chat, { text }) } catch (err) { console.error(err) }
    }
  }

  const pushHistory = (jid, s) => {
    if(!jid) return
    ensureUser(jid) // se asegura estructura
    const u = global.db.data.users[jid]
    if(!u.history) u.history = []
    u.history.unshift(s)
    if(u.history.length > 50) u.history.pop()
  }

  const format = n => `${n} ${CURRENCY}`

  // ---------- OWNER TOGGLE ----------
  if(command.toLowerCase() === 'mafioso'){
    if(!owners.includes(short)) return safeSend(m.chat, `💀 @${short} — Solo owners.`, [m.sender])
    menuState.active = !menuState.active
    return safeSend(m.chat, menuState.active ? `${ALERT} @${short} — Casinò abierto.` : `💀 @${short} — Casinò cerrado.`, [m.sender])
  }

  // ---------- MENU ----------
  if(command.toLowerCase() === 'menucasino'){
    if(!menuState.active) return safeSend(m.chat, `💀 @${short} — Casinò cerrado.`, [m.sender])
    const lines = [
      `${CAS} CASINO MAFIOSO — Don Feli`,
      ``,
      `Jugador: @${short} | Fichas: ${format(user.coins)}`,
      ``,
      `⫸ Saldo: .saldo`,
      `⫸ Daily: .daily (+${DAILY_REWARD})`,
      `⫸ Apostar: .apuesta <cantidad>`,
      `⫸ Ruleta: .ruleta <cantidad>`,
      `⫸ Slots: .slots`,
      `⫸ Historial: .history`,
      ``,
      `Owner: usar .mafioso para abrir/cerrar`
    ]
    return safeSend(m.chat, lines.join('\n'), [m.sender])
  }

  if(!menuState.active && ['saldo','daily','apuesta','ruleta','slots','history'].includes(command.toLowerCase()))
    return safeSend(m.chat, `💀 @${short} — Casinò cerrado.`, [m.sender])

  // ---------- SALDO ----------
  if(command.toLowerCase() === 'saldo')
    return safeSend(m.chat, `${CAS} @${short}\nFichas: ${format(user.coins)}`, [m.sender])

  // ---------- DAILY ----------
  if(command.toLowerCase() === 'daily'){
    const now = Date.now()
    if(now - (user.lastDaily || 0) < DAILY_COOLDOWN){
      const remaining = DAILY_COOLDOWN - (now - user.lastDaily)
      const h = Math.floor(remaining / 3600000)
      const mRem = Math.floor((remaining % 3600000) / 60000)
      return safeSend(m.chat, `💀 @${short} — Daily reclamado. Vuelve en ${h}h ${mRem}m`, [m.sender])
    }
    user.coins += DAILY_REWARD
    user.lastDaily = now
    pushHistory(who, `+${DAILY_REWARD} Daily`)
    return safeSend(m.chat, `${CAS} @${short} — Cobras ${format(DAILY_REWARD)}. Fichas: ${format(user.coins)}`, [m.sender])
  }

  // ---------- APUESTA ----------
  if(command.toLowerCase() === 'apuesta'){
    if(!args[0]) return safeSend(m.chat, `💀 @${short} — Uso: ${usedPrefix}apuesta <cantidad>`, [m.sender])
    let amount = parseInt(args[0].replace(/[^0-9]/g,'')) || 0
    if(!amount || amount <= 0) return safeSend(m.chat, `💀 @${short} — Cantidad inválida.`, [m.sender])
    if(user.coins < amount) return safeSend(m.chat, `💀 @${short} — No tienes suficientes fichas.`, [m.sender])

    const winChance = owners.includes(short) ? 0.85 : 0.5
    const win = Math.random() < winChance

    if(win){
      const tax = Math.floor(amount * TAX_RATE)
      const net = amount - tax
      user.coins += net
      pushHistory(who, `Apuesta GANADA +${net}`)
      // mensaje especial para owners
      let ownerMsg = ''
      if(owners.includes(short)) ownerMsg = '\n' + randomFrom(ownerWinMessages)
      return safeSend(m.chat, `${CAS} @${short} — GANASTE +${format(net)} (tax ${tax})\nFichas: ${format(user.coins)}${ownerMsg}`, [m.sender])
    } else {
      user.coins -= amount
      pushHistory(who, `Apuesta PERDIDA -${amount}`)
      let ownerMsg = ''
      if(owners.includes(short)) ownerMsg = '\n' + randomFrom(ownerLoseMessages)
      return safeSend(m.chat, `💀 @${short} — PERDISTE -${format(amount)}\nFichas: ${format(user.coins)}${ownerMsg}`, [m.sender])
    }
  }

  // ---------- RULETA ----------
  if(command.toLowerCase() === 'ruleta'){
    if(!args[0]) return safeSend(m.chat, `💀 @${short} — Uso: ${usedPrefix}ruleta <cantidad>`, [m.sender])
    let amount = parseInt(args[0].replace(/[^0-9]/g,'')) || 0
    if(!amount || amount <= 0) return safeSend(m.chat, `💀 @${short} — Cantidad inválida.`, [m.sender])
    if(user.coins < amount) return safeSend(m.chat, `💀 @${short} — No tienes suficientes fichas.`, [m.sender])

    const winChance = owners.includes(short) ? 0.85 : 0.5
    const win = Math.random() < winChance

    if(win){
      const tax = Math.floor(amount * TAX_RATE)
      const net = amount - tax
      user.coins += net
      pushHistory(who, `Ruleta GANADA +${net}`)
      let ownerMsg = ''
      if(owners.includes(short)) ownerMsg = '\n' + randomFrom(ownerWinMessages)
      return safeSend(m.chat, `${CAS} @${short} — GANASTE +${format(net)}\nFichas: ${format(user.coins)}${ownerMsg}`, [m.sender])
    } else {
      user.coins -= amount
      pushHistory(who, `Ruleta PERDIDA -${amount}`)
      let ownerMsg = ''
      if(owners.includes(short)) ownerMsg = '\n' + randomFrom(ownerLoseMessages)
      return safeSend(m.chat, `💀 @${short} — PERDISTE -${format(amount)}\nFichas: ${format(user.coins)}${ownerMsg}`, [m.sender])
    }
  }

  // ---------- SLOTS ----------
  if(command.toLowerCase() === 'slots'){
    const symbols = ['🍒','🍋','🍊','🍉','💎','7️⃣']
    let reel = [], win = false, wonAmount = 0
    const winChance = owners.includes(short) ? 0.85 : 0.5
    if(Math.random() < winChance){
      const symbol = symbols[Math.floor(Math.random()*symbols.length)]
      reel = [symbol, symbol, symbol]
      win = true
      wonAmount = 100
      user.coins += wonAmount
      pushHistory(who, `Slots GANADOS +${wonAmount}`)
      let ownerMsg = ''
      if(owners.includes(short)) ownerMsg = '\n' + randomFrom(ownerWinMessages)
      return safeSend(m.chat, `${CAS} @${short} — ${reel.join(' ')}\nGANASTE +${format(wonAmount)} | Fichas: ${format(user.coins)}${ownerMsg}`, [m.sender])
    } else {
      reel = [
        symbols[Math.floor(Math.random()*symbols.length)],
        symbols[Math.floor(Math.random()*symbols.length)],
        symbols[Math.floor(Math.random()*symbols.length)]
      ]
      pushHistory(who, `Slots NO GANADOS`)
      let ownerMsg = ''
      if(owners.includes(short)) ownerMsg = '\n' + randomFrom(ownerLoseMessages)
      return safeSend(m.chat, `${CAS} @${short} — ${reel.join(' ')}\nNo ganaste | Fichas: ${format(user.coins)}${ownerMsg}`, [m.sender])
    }
  }

  // ---------- HISTORY ----------
  if(command.toLowerCase() === 'history'){
    ensureUser(who)
    if(!user.history || user.history.length === 0) return safeSend(m.chat, `${CAS} @${short} — Sin historial.`, [m.sender])
    let txt = `${CAS} Historial @${short}\n`
    user.history.slice(0,50).forEach(h => txt += `• ${h}\n`)
    return safeSend(m.chat, txt, [m.sender])
  }
}

handler.help = ['mafioso','menucasino','saldo','daily','apuesta','ruleta','slots','history']
handler.tags = ['casino']
handler.command = /^mafioso|menucasino|saldo|daily|apuesta|ruleta|slots|history$/i
export default handler
