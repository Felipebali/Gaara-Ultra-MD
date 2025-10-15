/* plugins/_casino_mafia.js
   CASINO MAFIOSO — Estilo Italiano + Ranking “Sangre y Poder”
   - Toggle: .mafioso (solo owners)
   - Menú: .menucasino
   - Juegos: apuesta, ruleta, slots
   - Economía: fichas, daily, topchips, historial, ranking
   - Moneda: Fichas
   - Menciones con ${who.split("@")[0]} sin citar mensajes
*/

let handler = async (m, { conn, args = [], usedPrefix = '.', command = '' }) => {
  const owners = ['59898719147','59896026646'] // principal primero
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
  const PAGE_SIZE = 10

  // ---------- UNICODE ----------
  const ALERT = '\u{1F6A8}'
  const CAS = '\u{1F3B0}'
  const DICE = '\u{1F3B2}'
  const SKULL = '\u{1F480}'

  // ---------- HELPERS ----------
  const safeSend = async (chat, text, mentions = []) => {
    try { await conn.sendMessage(chat, { text, mentions }) }
    catch { try{ await conn.sendMessage(chat, { text }) } catch(e){ console.error(e) } }
  }

  const pushHistory = (jid,s) => {
    const u = global.db.data.users[jid]
    if(!u) return
    u.history.unshift(s)
    if(u.history.length>50) u.history.pop()
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
      `⫸ Ranking: .ranking <página>`,
      ``,
      `Owner: usar .mafioso para abrir/cerrar`
    ]
    return safeSend(m.chat, lines.join('\n'), [m.sender])
  }

  if(!menuState.active && ['saldo','daily','apuesta','ruleta','slots','history','ranking'].includes(command.toLowerCase())) 
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
    if(!amount||amount<=0) return safeSend(m.chat, `💀 @${short} — Cantidad inválida.`, [m.sender])
    if(user.coins<amount) return safeSend(m.chat, `💀 @${short} — No tienes suficientes fichas.`, [m.sender])
    const winChance = owners.includes(short) ? 0.85 : 0.5
    const win = Math.random() < winChance
    if(win){
      const tax = Math.floor(amount*TAX_RATE)
      const net = amount-tax
      user.coins += net
      pushHistory(who, `Apuesta GANADA +${net}`)
      return safeSend(m.chat, `${CAS} @${short} — GANASTE +${format(net)} (tax ${tax})\nFichas: ${format(user.coins)}`, [m.sender])
    } else {
      user.coins -= amount
      pushHistory(who, `Apuesta PERDIDA -${amount}`)
      return safeSend(m.chat, `💀 @${short} — PERDISTE -${format(amount)}\nFichas: ${format(user.coins)}`, [m.sender])
    }
  }

  // ---------- RULETA ----------
  if(command.toLowerCase() === 'ruleta'){
    if(!args[0]) return safeSend(m.chat, `💀 @${short} — Uso: ${usedPrefix}ruleta <cantidad>`, [m.sender])
    let amount = parseInt(args[0].replace(/[^0-9]/g,'')) || 0
    if(!amount||amount<=0) return safeSend(m.chat, `💀 @${short} — Cantidad inválida.`, [m.sender])
    if(user.coins<amount) return safeSend(m.chat, `💀 @${short} — No tienes suficientes fichas.`, [m.sender])
    const winChance = owners.includes(short) ? 0.85 : 0.5
    const win = Math.random() < winChance
    if(win){
      const tax = Math.floor(amount*TAX_RATE)
      const net = amount-tax
      user.coins += net
      pushHistory(who, `Ruleta GANADA +${net}`)
      return safeSend(m.chat, `${CAS} @${short} — GANASTE +${format(net)}\nFichas: ${format(user.coins)}`, [m.sender])
    } else {
      user.coins -= amount
      pushHistory(who, `Ruleta PERDIDA -${amount}`)
      return safeSend(m.chat, `💀 @${short} — PERDISTE -${format(amount)}\nFichas: ${format(user.coins)}`, [m.sender])
    }
  }

  // ---------- SLOTS ----------
  if(command.toLowerCase() === 'slots'){
    const symbols = ['🍒','🍋','🍊','🍉','💎','7️⃣']
    let reel=[],win=false,wonAmount=0
    const winChance = owners.includes(short)?0.85:0.5
    if(Math.random()<winChance){
      const symbol = symbols[Math.floor(Math.random()*symbols.length)]
      reel = [symbol,symbol,symbol]
      win=true; wonAmount=100
      user.coins += wonAmount
      pushHistory(who, `Slots GANADOS +${wonAmount}`)
    } else {
      reel = [symbols[Math.floor(Math.random()*symbols.length)],
              symbols[Math.floor(Math.random()*symbols.length)],
              symbols[Math.floor(Math.random()*symbols.length)]]
    }
    return safeSend(m.chat, `${CAS} @${short} — ${reel.join(' ')}\n${win?`GANASTE +${format(wonAmount)}`:`No ganaste`} | Fichas: ${format(user.coins)}`, [m.sender])
  }

  // ---------- HISTORY ----------
  if(command.toLowerCase() === 'history'){
    if(!user.history||user.history.length===0) return safeSend(m.chat, `${CAS} @${short} — Sin historial.`, [m.sender])
    let txt=`${CAS} Historial @${short}\n`
    user.history.forEach(h=>txt+=`• ${h}\n`)
    return safeSend(m.chat, txt, [m.sender])
  }

  // ---------- RANKING ----------
  if(command.toLowerCase() === 'ranking'){
    let page = parseInt(args[0]) || 1
    if(page<1) page=1

    let usersArray = Object.entries(global.db.data.users).map(([jid,u])=>({jid,coins:u.coins}))
    const owner1 = usersArray.find(u=>u.jid.endsWith('59898719147'))
    const owner2 = usersArray.find(u=>u.jid.endsWith('59896026646'))
    usersArray = usersArray.filter(u=>!owners.some(o=>u.jid.endsWith(o)))
    usersArray.sort((a,b)=>b.coins-a.coins)

    const ranking = []
    if(owner1) ranking.push({rank:1, jid:owner1.jid, coins:owner1.coins, title:'🥇 EL JEFE 👑'})
    if(owner2) ranking.push({rank:2, jid:owner2.jid, coins:owner2.coins, title:'🥈 EL PADRINO ⚜️'})
    usersArray.forEach((u,i)=>{
      const rank = i+3
      ranking.push({rank, jid:u.jid, coins:u.coins, title:`${rank}️⃣ Capo 🦅`})
    })

    const start = (page-1)*PAGE_SIZE
    const end = start+PAGE_SIZE
    const pageItems = ranking.slice(start,end)

    let txt = '🩸 RANKING DEL BAJO MUNDO 🔪\n━━━━━━━━━━━━━━\n'
    pageItems.forEach(u=>{
      const shortu = u.jid.split('@')[0]
      txt += `${u.title}: @${shortu} — ${u.coins}💰\n`
    })
    txt += `\nPágina ${page}`

    return safeSend(m.chat, txt, [m.sender])
  }
}

handler.help = ['mafioso','menucasino','saldo','daily','apuesta','ruleta','slots','history','ranking']
handler.tags = ['casino']
handler.command = /^mafioso|menucasino|saldo|daily|apuesta|ruleta|slots|history|ranking$/i
export default handler
