/* plugins/economia_mafia.js
   CASINO MAFIOSO + MAFIA SICILIANA (Todo en 1 archivo)
   - Toggle: .mafioso (solo owners)
   - Menú: .menucasino
   - Juegos: .apuesta, .ruleta, .slots
   - Economía: .saldo, .daily, .history
   - Ranking: .ranking / .topchips (paginado)
   - Prefijo: .
*/

let handler = async (m, { conn, args = [], usedPrefix = '.', command = '' }) => {
  // ---------- CONFIG / OWNERS ----------
  const owners = ['59896026646','59898719147'] // números sin @
  const who = m.sender
  const short = who.split('@')[0]

  // ---------- DB ----------
  if (!global.db) global.db = { data: {} }
  if (!global.db.data.casinoMafia) global.db.data.casinoMafia = { active: true }
  if (!global.db.data.users) global.db.data.users = {}

  // crea usuario si no existe
  if (!global.db.data.users[who]) global.db.data.users[who] = {
    coins: owners.includes(short) ? 500 : 500, // ambos arrancan con 500 según lo pedido
    lastDaily: 0,
    history: [],
    inventory: [],
    respeto: 0,    // para futura expansión mafia
    mafiaLevel: 0, // para futura expansión mafia
  }

  const user = global.db.data.users[who]
  const menuState = global.db.data.casinoMafia

  // ---------- CONSTANTES ----------
  const CURRENCY = 'Fichas'
  const DAILY_REWARD = 50
  const DAILY_COOLDOWN = 24 * 60 * 60 * 1000
  const TAX_RATE = 0.05
  const PAGE_SIZE = 10 // ranking: items por página

  // ---------- UNICODE ----------
  const ALERT = '\u{1F6A8}'
  const CAS = '\u{1F3B0}'
  const COIN = '\u{1F4B0}'
  const DICE = '\u{1F3B2}'
  const BOX = '\u{1F4E6}'
  const SKULL = '\u{1F480}'
  const MEDAL = '\u{1F396}'

  // ---------- HELPERS ----------
  const safeSend = async (chat, text, mentions = []) => {
    try {
      await conn.sendMessage(chat, { text, mentions })
    } catch (e) {
      try { await conn.sendMessage(chat, { text }) } catch (err) { console.error(err) }
    }
  }

  const pushHistory = (jid, s) => {
    const u = global.db.data.users[jid]
    if(!u) return
    u.history.unshift(s)
    if(u.history.length>50) u.history.pop()
  }

  const format = (n) => `${n} ${CURRENCY}`

  // ---------- OWNER TOGGLE ----------
  if(command.toLowerCase() === 'mafioso'){
    if(!owners.includes(short)) return safeSend(m.chat, `${SKULL} @${short} — Solo owners.`, [m.sender])
    menuState.active = !menuState.active
    return safeSend(m.chat, menuState.active ? `${ALERT} @${short} — Casinò abierto.` : `${SKULL} @${short} — Casinò cerrado.`, [m.sender])
  }

  // ---------- MENU ----------
  if(command.toLowerCase() === 'menucasino'){
    if(!menuState.active) return safeSend(m.chat, `${SKULL} @${short} — Casinò cerrado.`, [m.sender])
    const lines = [
      `${CAS} CASINO MAFIOSO — Casinò Don Feli (Mafia Siciliana)`,
      ``,
      `Jugador: @${short} | Fichas: ${format(user.coins)}`,
      ``,
      `⫸ ${CAS} Saldo: .saldo`,
      `⫸ ${CAS} Daily: .daily (+${DAILY_REWARD})`,
      `⫸ ${CAS} Apostar: .apuesta <cantidad>`,
      `⫸ ${DICE} Ruleta: .ruleta <cantidad>`,
      `⫸ ${CAS} Slots: .slots`,
      `⫸ ${CAS} Historial: .history`,
      `⫸ ${MEDAL} Ranking: .ranking <página>  (alias: .topchips)`,
      ``,
      `Owner: usar .mafioso para abrir/cerrar`
    ]
    return safeSend(m.chat, lines.join('\n'), [m.sender])
  }

  if(!menuState.active && ['saldo','daily','apuesta','ruleta','slots','history','ranking','topchips'].includes(command.toLowerCase())) 
    return safeSend(m.chat, `${SKULL} @${short} — Casinò cerrado.`, [m.sender])

  // ---------- SALDO ----------
  if(['saldo'].includes(command.toLowerCase())) 
    return safeSend(m.chat, `${CAS} @${short}\nFichas: ${format(user.coins)}`, [m.sender])

  // ---------- DAILY ----------
  if(command.toLowerCase() === 'daily'){
    const now = Date.now()
    if(now - (user.lastDaily || 0) < DAILY_COOLDOWN){
      const remaining = DAILY_COOLDOWN - (now - user.lastDaily)
      const h = Math.floor(remaining / 3600000)
      const mRem = Math.floor((remaining % 3600000) / 60000)
      return safeSend(m.chat, `${SKULL} @${short} — Daily reclamado. Vuelve en ${h}h ${mRem}m`, [m.sender])
    }
    user.coins += DAILY_REWARD
    user.lastDaily = now
    pushHistory(who, `+${DAILY_REWARD} Daily`)
    return safeSend(m.chat, `${CAS} @${short} — Cobras ${format(DAILY_REWARD)}. Fichas: ${format(user.coins)}`, [m.sender])
  }

  // ---------- APUESTA ----------
  if(command.toLowerCase() === 'apuesta'){
    if(!args[0]) return safeSend(m.chat, `${SKULL} @${short} — Uso: ${usedPrefix}apuesta <cantidad>`, [m.sender])
    const amount = parseInt(args[0].replace(/[^0-9]/g,'')) || 0
    if(!amount||amount<=0) return safeSend(m.chat, `${SKULL} @${short} — Cantidad inválida.`, [m.sender])
    if(user.coins < amount) return safeSend(m.chat, `${SKULL} @${short} — No tienes suficientes fichas.`, [m.sender])

    // chance de ganar: owners 85%, resto 50%
    const winChance = owners.includes(short) ? 0.85 : 0.5
    const win = Math.random() < winChance

    if(win){
      const tax = Math.floor(amount * TAX_RATE)
      const net = amount - tax
      user.coins += net
      pushHistory(who, `Apuesta GANADA +${net}`)
      return safeSend(m.chat, `${CAS} @${short} — GANASTE +${format(net)} (tax ${tax})\nFichas: ${format(user.coins)}`, [m.sender])
    } else {
      user.coins -= amount
      pushHistory(who, `Apuesta PERDIDA -${amount}`)
      return safeSend(m.chat, `${SKULL} @${short} — PERDISTE -${format(amount)}\nFichas: ${format(user.coins)}`, [m.sender])
    }
  }

  // ---------- RULETA ----------
  if(command.toLowerCase() === 'ruleta'){
    if(!args[0]) return safeSend(m.chat, `${SKULL} @${short} — Uso: ${usedPrefix}ruleta <cantidad>`, [m.sender])
    const amount = parseInt(args[0].replace(/[^0-9]/g,'')) || 0
    if(!amount||amount<=0) return safeSend(m.chat, `${SKULL} @${short} — Cantidad inválida.`, [m.sender])
    if(user.coins < amount) return safeSend(m.chat, `${SKULL} @${short} — No tienes suficientes fichas.`, [m.sender])

    // chance de ganar
    const winChance = owners.includes(short) ? 0.85 : 0.5
    const win = Math.random() < winChance

    if(win){
      const tax = Math.floor(amount * TAX_RATE)
      const net = amount - tax
      user.coins += net
      pushHistory(who, `Ruleta GANADA +${net}`)
      return safeSend(m.chat, `${CAS} @${short} — GANASTE +${format(net)}\nFichas: ${format(user.coins)}`, [m.sender])
    } else {
      user.coins -= amount
      pushHistory(who, `Ruleta PERDIDA -${amount}`)
      return safeSend(m.chat, `${SKULL} @${short} — PERDISTE -${format(amount)}\nFichas: ${format(user.coins)}`, [m.sender])
    }
  }

  // ---------- SLOTS ----------
  if(command.toLowerCase() === 'slots'){
    const symbols = ['🍒','🍋','🍊','🍉','💎','7️⃣']
    let reel = []
    let win = false, wonAmount = 0

    // owners tienen 85% chance de conseguir triple
    const winChance = owners.includes(short) ? 0.85 : 0.5
    if(Math.random() < winChance){
      const symbol = symbols[Math.floor(Math.random()*symbols.length)]
      reel = [symbol, symbol, symbol]
      win = true
      wonAmount = 100
      user.coins += wonAmount
      pushHistory(who, `Slots GANADOS +${wonAmount}`)
    } else {
      reel = [
        symbols[Math.floor(Math.random()*symbols.length)],
        symbols[Math.floor(Math.random()*symbols.length)],
        symbols[Math.floor(Math.random()*symbols.length)]
      ]
    }

    return safeSend(m.chat, `${CAS} @${short} — ${reel.join(' ')}\n${win?`GANASTE +${format(wonAmount)}`:`No ganaste`} | Fichas: ${format(user.coins)}`, [m.sender])
  }

  // ---------- HISTORY ----------
  if(command.toLowerCase() === 'history'){
    if(!user.history||user.history.length===0) return safeSend(m.chat, `${CAS} @${short} — Sin historial.`, [m.sender])
    let txt=`${CAS} Historial @${short}\n`
    user.history.slice(0,20).forEach(h=> txt += `• ${h}\n`)
    return safeSend(m.chat, txt, [m.sender])
  }

  // ---------- RANKING / TOPCHIPS (PAGINADO) ----------
  if(['ranking','topchips'].includes(command.toLowerCase())){
    if(!menuState.active) return safeSend(m.chat, `${SKULL} @${short} — Casinò cerrado.`, [m.sender])

    // page argumento opcional
    let page = 1
    if(args[0] && !isNaN(parseInt(args[0]))) page = Math.max(1, parseInt(args[0]))

    // obtener todos los usuarios
    const entries = Object.entries(global.db.data.users) // [jid, data]
    // separar owners y resto
    const ownerJids = owners.map(o => `${o}@s.whatsapp.net`)
    const ownersList = []
    const rest = []

    for(const [jid, data] of entries){
      if(ownerJids.includes(jid)) ownersList.push([jid, data])
      else rest.push([jid, data])
    }

    // ordenar resto por coins desc
    rest.sort((a,b)=> (b[1].coins||0) - (a[1].coins||0))

    // construir ranking: primeros puestos reservados para owners en orden definido
    const ranking = []

    // Owners primeros en orden del array owners
    for(const o of owners){
      const jid = `${o}@s.whatsapp.net`
      // si el owner no está en DB, crearle entrada
      if(!global.db.data.users[jid]) {
        global.db.data.users[jid] = { coins: 500, lastDaily:0, history:[], inventory:[], respeto:100, mafiaLevel: 4 }
      }
      const data = global.db.data.users[jid]
      ranking.push([jid, data, { specialTitle: (o === owners[0]) ? '👑 Don Supremo' : '👑 Padrino' }])
    }

    // luego el resto
    for(const [jid, data] of rest){
      ranking.push([jid, data, {}])
    }

    // ranks por fichas (para mostrar etiqueta)
    const getRankLabel = (coins, jid) => {
      // if owner, they already have specialTitle
      if(ownerJids.includes(jid)) return ownerJids[0] === jid ? '👑 Don Supremo' : '👑 Padrino'
      if(coins >= 5000) return '🦅 Capo di Tutti Capi'
      if(coins >= 2000) return '💼 Caporegime'
      if(coins >= 1000) return '🔫 Sotto Capo'
      if(coins >= 500) return '💰 Soldato'
      if(coins >= 200) return '🍷 Asociado'
      if(coins >= 0) return '🐣 Prospecto'
      return '💀 Don Nadie'
    }

    // paginar
    const total = ranking.length
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
    if(page > totalPages) page = totalPages
    const start = (page - 1) * PAGE_SIZE
    const pageItems = ranking.slice(start, start + PAGE_SIZE)

    // construir texto
    let txt = `${CAS} RANKING MAFIOSO — Mafia Siciliana\n`
    txt += `Página ${page} / ${totalPages} — Total mafiosos: ${total}\n\n`

    // medallas para top 3 visibles si correspondiera (pero owners ocupan 1 y 2)
    let pos = start + 1
    const mentionList = []
    for(const [jid, data, meta] of pageItems){
      const name = jid.split('@')[0]
      const coins = data.coins || 0
      const rankLabel = meta.specialTitle ? meta.specialTitle : getRankLabel(coins, jid)
      let placeIcon = `${pos})`
      if(pos === 1) placeIcon = '🥇'
      else if(pos === 2) placeIcon = '🥈'
      else if(pos === 3) placeIcon = '🥉'

      txt += `${placeIcon} @${name} — ${coins} ${CURRENCY} — ${rankLabel}\n`
      mentionList.push(jid)
      pos++
    }

    txt += `\nUsá: ${usedPrefix}ranking <página> para ver más.`

    return safeSend(m.chat, txt, mentionList)
  }
}

handler.help = ['mafioso','menucasino','saldo','daily','apuesta','ruleta','slots','history','ranking','topchips']
handler.tags = ['casino','mafia']
handler.command = /^mafioso|menucasino|saldo|daily|apuesta|ruleta|slots|history|ranking|topchips$/i
export default handler
