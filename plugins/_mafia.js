/* plugins/_casino_mafia.js
   CASINO MAFIOSO — Estilo Italiano
   - Toggle: .mafioso (solo owners)
   - Menú: .menucasino
   - Juegos: apuesta, ruleta, slots
   - Economía: fichas, daily, topchips, historial
   - Moneda: Fichas
   - Menciones con ${who.split("@")[0]} sin citar mensajes
*/

let handler = async (m, { conn, args = [], usedPrefix = '.', command = '' }) => {
  const owners = ['59896026646','59898719147']
  const who = m.sender
  const short = who.split('@')[0]

  // ---------- DB ----------
  if (!global.db) global.db = { data: {} }
  if (!global.db.data.casinoMafia) global.db.data.casinoMafia = { active: true }
  if (!global.db.data.users) global.db.data.users = {}
  if (!global.db.data.users[who]) global.db.data.users[who] = {
    coins: 500,
    lastDaily: 0,
    history: [],
    inventory: [],
  }

  const user = global.db.data.users[who]
  const menuState = global.db.data.casinoMafia

  // ---------- CONFIG ----------
  const CURRENCY = 'Fichas'
  const DAILY_REWARD = 50
  const DAILY_COOLDOWN = 24 * 60 * 60 * 1000
  const TAX_RATE = 0.05

  // ---------- UNICODE ----------
  const ALERT = '\u{1F6A8}'
  const CAS = '\u{1F3B0}'
  const COIN = '\u{1F4B0}'
  const DICE = '\u{1F3B2}'
  const BOX = '\u{1F4E6}'
  const SKULL = '\u{1F480}'

  // ---------- HELPERS ----------
  const send = async (text) => {
    try { await conn.sendMessage(m.chat, { text, mentions: [who] }) }
    catch(e){ try{ await m.reply(text) } catch(err){ console.error(err) } }
  }

  const pushHistory = (s) => {
    user.history.unshift(s)
    if(user.history.length>10) user.history.pop()
  }

  const format = (n) => `${n} ${CURRENCY}`

  // ---------- OWNER TOGGLE ----------
  if(command.toLowerCase() === 'mafioso'){
    if(!owners.includes(short)) return send(`${SKULL} @${short} — Solo owners.`)
    menuState.active = !menuState.active
    return send(menuState.active ? `${ALERT} @${short} — Casinò abierto.` : `${SKULL} @${short} — Casinò cerrado.`)
  }

  // ---------- MENU ----------
  if(command.toLowerCase() === 'menucasino'){
    if(!menuState.active) return send(`${SKULL} @${short} — Casinò cerrado.`)
    const lines = [
      `${CAS} CASINO MAFIOSO — Casinò Don Feli`,
      ``,
      `Jugador: @${short} | Fichas: ${format(user.coins)}`,
      ``,
      `⫸ ${CAS} Saldo: .saldo`,
      `⫸ ${CAS} Daily: .daily (+${DAILY_REWARD})`,
      `⫸ ${CAS} Apostar: .apuesta <cantidad>`,
      `⫸ ${DICE} Ruleta: .ruleta <cantidad>`,
      `⫸ ${CAS} Slots: .slots`,
      `⫸ ${CAS} Historial: .history`,
      ``,
      `Owner: usar .mafioso para abrir/cerrar`
    ]
    return send(lines.join('\n'))
  }

  if(!menuState.active && ['saldo','daily','apuesta','ruleta','slots','history'].includes(command.toLowerCase())) 
    return send(`${SKULL} @${short} — Casinò cerrado.`)

  // ---------- SALDO ----------
  if(['saldo'].includes(command.toLowerCase())) 
    return send(`${CAS} @${short}\nFichas: ${format(user.coins)}`)

  // ---------- DAILY ----------
  if(command.toLowerCase() === 'daily'){
    const now = Date.now()
    if(now - (user.lastDaily || 0) < DAILY_COOLDOWN){
      const remaining = DAILY_COOLDOWN - (now - user.lastDaily)
      const h = Math.floor(remaining / 3600000)
      const m = Math.floor((remaining % 3600000) / 60000)
      return send(`${SKULL} @${short} — Daily reclamado. Vuelve en ${h}h ${m}m`)
    }
    user.coins += DAILY_REWARD
    user.lastDaily = now
    pushHistory(`+${DAILY_REWARD} Daily`)
    return send(`${CAS} @${short} — Cobras ${format(DAILY_REWARD)}. Fichas: ${format(user.coins)}`)
  }

  // ---------- APUESTA ----------
  if(command.toLowerCase() === 'apuesta'){
    if(!args[0]) return send(`${SKULL} @${short} — Uso: ${usedPrefix}apuesta <cantidad>`)
    const amount = parseInt(args[0].replace(/[^0-9]/g,'')) || 0
    if(!amount||amount<=0) return send(`${SKULL} @${short} — Cantidad inválida.`)

    const winChance = owners.includes(short) ? 0.85 : 0.5
    const win = Math.random() < winChance

    if(win){
      const tax = Math.floor(amount * TAX_RATE)
      const net = amount - tax
      user.coins += net
      pushHistory(`Apuesta GANADA +${net}`)
      return send(`${CAS} @${short} — GANASTE +${format(net)} (tax ${tax})\nFichas: ${format(user.coins)}`)
    } else {
      user.coins -= amount
      pushHistory(`Apuesta PERDIDA -${amount}`)
      return send(`${SKULL} @${short} — PERDISTE -${format(amount)}\nFichas: ${format(user.coins)}`)
    }
  }

  // ---------- RULETA ----------
  if(command.toLowerCase() === 'ruleta'){
    if(!args[0]) return send(`${SKULL} @${short} — Uso: ${usedPrefix}ruleta <cantidad>`)
    const amount = parseInt(args[0]) || 0
    if(!amount||amount<=0) return send(`${SKULL} @${short} — Cantidad inválida.`)

    const winChance = owners.includes(short) ? 0.85 : 0.5
    const win = Math.random() < winChance

    if(win){
      const tax = Math.floor(amount * TAX_RATE)
      const net = amount - tax
      user.coins += net
      pushHistory(`Ruleta GANADA +${net}`)
      return send(`${CAS} @${short} — GANASTE +${format(net)}\nFichas: ${format(user.coins)}`)
    } else {
      user.coins -= amount
      pushHistory(`Ruleta PERDIDA -${amount}`)
      return send(`${SKULL} @${short} — PERDISTE -${format(amount)}\nFichas: ${format(user.coins)}`)
    }
  }

  // ---------- SLOTS ----------
  if(command.toLowerCase() === 'slots'){
    const symbols = ['🍒','🍋','🍊','🍉','💎','7️⃣']
    let reel = []

    // owners tienen más chance de ganar: 85% chance de que los 3 sean iguales
    const winChance = owners.includes(short) ? 0.85 : 0.5
    let win = false, amount = 0

    if(Math.random() < winChance){
      const symbol = symbols[Math.floor(Math.random()*symbols.length)]
      reel = [symbol, symbol, symbol]
      win = true
      amount = 100
      user.coins += amount
      pushHistory(`Slots GANADOS +${amount}`)
    } else {
      reel = [symbols[Math.floor(Math.random()*symbols.length)],
              symbols[Math.floor(Math.random()*symbols.length)],
              symbols[Math.floor(Math.random()*symbols.length)]]
    }

    return send(`${CAS} @${short} — ${reel.join(' ')}\n${win?`GANASTE +${format(amount)}`:`No ganaste`} | Fichas: ${format(user.coins)}`)
  }

  // ---------- HISTORY ----------
  if(command.toLowerCase() === 'history'){
    if(!user.history||user.history.length===0) return send(`${CAS} @${short} — Sin historial.`)
    let txt=`${CAS} Historial @${short}\n`
    user.history.forEach(h=>txt+=`• ${h}\n`)
    return send(txt)
  }
}

handler.help = ['mafioso','menucasino','saldo','daily','apuesta','ruleta','slots','history']
handler.tags = ['casino']
handler.command = /^mafioso|menucasino|saldo|daily|apuesta|ruleta|slots|history$/i
export default handler
