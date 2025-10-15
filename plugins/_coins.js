/* plugins/_coins_casino.js
   CASINO LV — Casino Estilo Vegas
   - Toggle: .casino (solo owners)
   - Menú: .menucasino
   - Juegos: apuesta, flip, ruleta, dados, slots
   - Economía: fichas, daily (aplica interés a deuda), topchips, history
   - Inventario y mercado: inventario, mercado, comprar, vender
   - Nuevos: .perfilcasino, .jackpot (caja misteriosa)
   - Impuesto 2% a ganancias -> Fondo Casino (global.db.data.casinoFund)
   - Moneda: Fichas
   - Menciones con ${who.split("@")[0]} y sin citar mensajes
*/

let handler = async (m, { conn, args = [], usedPrefix = '.', command = '' }) => {
  const owners = ['59896026646','59898719147']
  const who = m.sender
  const short = who.split('@')[0]

  // ---------- DB ----------
  if (!global.db) global.db = { data: {} }
  if (!global.db.data.menuCasino) global.db.data.menuCasino = { active: true }
  if (!global.db.data.users) global.db.data.users = {}
  if (!global.db.data.market) global.db.data.market = [
    { name: "Ficha Dorada", price: 200, desc: "Aumenta ganancias en ruleta" },
    { name: "Botiquín", price: 150, desc: "Quita deuda (1 uso)" },
    { name: "Amuleto", price: 450, desc: "Reduce pérdidas en apuesta" },
    { name: "Carta Suerte", price: 120, desc: "+20% en slots" },
    { name: "Mochila", price: 300, desc: "+10 slots inventario" },
    { name: "Jackpot", price: 800, desc: "Objeto raro de casino" }
  ]
  if (global.db.data.casinoFund === undefined) global.db.data.casinoFund = 0

  if (!global.db.data.users[who]) global.db.data.users[who] = {
    coins: 500,
    lastDaily: 0,
    history: [],
    inventory: [],
    respect: 0
  }

  const user = global.db.data.users[who]
  const menuState = global.db.data.menuCasino
  const market = global.db.data.market

  // ---------- CONFIG ----------
  const CURRENCY = 'Fichas'
  const DAILY_REWARD = 50
  const DAILY_COOLDOWN = 24 * 60 * 60 * 1000
  const WIN_PROB = 0.60
  const DEBT_LIMIT = -100
  const DEBT_INTEREST_RATE = 0.05
  const TAX_RATE = 0.02
  const GLOBAL_ANNOUNCE_THRESHOLD = 2000

  // ---------- UNICODE ----------
  const B = '\u{2022}'
  const ALERT = '\u{1F6A8}'
  const CAS = '\u{1F3B0}'
  const COIN = '\u{1F4B0}'
  const DICE = '\u{1F3B2}'
  const SKULL = '\u{1F480}'
  const BOX = '\u{1F4E6}'

  // ---------- HELPERS ----------
  const send = async (text) => {
    try { await conn.sendMessage(m.chat, { text, mentions: [who] }) }
    catch(e){ try{ await m.reply(text) } catch(err){ console.error(err) } }
  }

  const pushHistory = (s) => {
    user.history.unshift(s)
    if(user.history.length>20) user.history.pop()
  }

  const findMarketItem = (name) => market.find(i=>i.name.toLowerCase()===name.toLowerCase())

  const format = (n) => `${n} ${CURRENCY}`

  const getRank = (coins) => {
    if(coins<0) return 'Perdedor'
    if(coins<500) return 'Jugador'
    if(coins<2000) return 'Crupier'
    if(coins<5000) return 'VIP'
    return 'Magnate'
  }

  const announceGlobal = async(txt) => {
    try{ await conn.sendMessage(m.chat,{ text:`${ALERT} ${txt}` }) }
    catch(e){ console.error(e) }
  }

  // ---------- OWNER: toggle ----------
  if(command.toLowerCase()==='casino'){
    if(!owners.includes(short)) return m.reply(`${SKULL} @${short} — Solo owners.`)
    menuState.active = !menuState.active
    const msg = menuState.active
      ? `${ALERT} @${short} — CASINO ABIERTO. Que empiece el juego.`
      : `${SKULL} @${short} — CASINO CERRADO. Nadie entra ni sale.`
    return send(msg)
  }

  // ---------- MENU ----------
  if(command.toLowerCase()==='menucasino'){
    if(!menuState.active) return send(`${SKULL} @${short} — El casino está cerrado. Owner: .casino`)
    const rank = getRank(user.coins)
    const lines=[
      `${CAS} CASINO LV — Vegas Mode`,
      ``,
      `${B} Jugador: @${short} | Rango: ${rank} | Fichas: ${format(user.coins)}`,
      ``,
      `⫸ ${B} Estado: .saldo    ⫸ ${B} Daily: .daily (+${DAILY_REWARD})`,
      `⫸ ${B} Apostar: .apuesta <cantidad>  ⫸ ${B} Flip: .flip`,
      `⫸ ${B} Dados: .dados <cantidad>      ⫸ ${B} Ruleta: .ruleta <cantidad>`,
      `⫸ ${B} Slots: .slots`,
      ``,
      `⫸ ${B} Inventario: .inventario      ⫸ ${B} Mercado: .mercado`,
      `⫸ ${B} Comprar: .comprar <nombre>    ⫸ ${B} Vender: .vender <nombre>`,
      ``,
      `⫸ ${B} Perfil Casino: .perfilcasino  ⫸ ${B} Jackpot: .jackpot`,
      `⫸ ${B} Top: .topchips               ⫸ ${B} History: .history`,
      ``,
      `Owner: usar .casino para activar/desactivar`
    ]
    return send(lines.join('\n'))
  }

  const mainCmds = ['saldo','coins','balance','daily','apuesta','bet','flip','topchips','top','history','dados','ruleta','slots','inventario','mercado','comprar','vender','perfilcasino','jackpot']
  if(!menuState.active && mainCmds.includes(command.toLowerCase())) return send(`${SKULL} @${short} — Casino apagado.`)

  // ---------- SALDO ----------
  if(['saldo','coins','balance'].includes(command.toLowerCase())){
    const rank = getRank(user.coins)
    return send(`${CAS} @${short}\nFichas: ${format(user.coins)}\nRango: ${rank}`)
  }

  // ---------- FLIP ----------
  if(command.toLowerCase()==='flip'){
    const outcome=Math.random()<0.5?'CARA':'CRUZ'
    pushHistory(`Flip: ${outcome}`)
    return send(`${DICE} @${short} — Tirada: ${outcome}`)
  }

  // ---------- DAILY ----------
  if(command.toLowerCase()==='daily'){
    const now=Date.now()
    if(now-(user.lastDaily||0)<DAILY_COOLDOWN){
      const remaining=DAILY_COOLDOWN-(now-user.lastDaily)
      const h=Math.floor(remaining/3600000), m=Math.floor((remaining%3600000)/60000)
      return send(`${SKULL} @${short} — Daily reclamado. Vuelve en ${h}h ${m}m`)
    }
    if(user.coins<0){
      const debt=Math.abs(user.coins)
      const interest=Math.ceil(debt*DEBT_INTEREST_RATE)
      user.coins-=interest
      pushHistory(`Interés deuda -${interest}`)
    }
    user.coins+=DAILY_REWARD
    user.lastDaily=now
    pushHistory(`+${DAILY_REWARD} Daily`)
    return send(`${CAS} @${short} — Cobras ${format(DAILY_REWARD)}. Fichas: ${format(user.coins)}`)
  }

  // ---------- APUESTA ----------
  if(['apuesta','bet','moneda'].includes(command.toLowerCase())){
    if(!args[0]) return send(`${SKULL} @${short} — Uso: ${usedPrefix}apuesta <cantidad>`)
    const amount=parseInt(args[0].toString().replace(/[^0-9]/g,''))||0
    if(!amount||amount<=0) return send(`${SKULL} @${short} — Cantidad inválida.`)
    if(user.coins-amount<DEBT_LIMIT) return send(`${SKULL} @${short} — Límite de deuda alcanzado.`)
    const win=Math.random()<WIN_PROB
    if(win){
      const gross=amount
      const tax=Math.floor(gross*TAX_RATE)
      const net=gross-tax
      user.coins+=net
      global.db.data.casinoFund+=tax
      pushHistory(`Apuesta GANADA +${net} (tax ${tax})`)
      if(net>GLOBAL_ANNOUNCE_THRESHOLD) await announceGlobal(`${short} ganó ${format(net)} en apuesta. ¡Grande!`)
      return send(`${CAS} @${short} — GANASTE +${format(net)} (impuesto ${format(tax)})\nFichas: ${format(user.coins)}`)
    }else{
      user.coins-=amount
      pushHistory(`Apuesta PERDIDA -${amount}`)
      return send(`${SKULL} @${short} — PERDISTE -${format(amount)}\nFichas: ${format(user.coins)}`)
    }
  }

  // ---------- DADOS ----------
  if(command.toLowerCase()==='dados'){
    const amount=parseInt(args[0])||0
    if(!amount||amount<=0) return send(`${SKULL} @${short} — Uso: ${usedPrefix}dados <cantidad>`)
    if(user.coins-amount<DEBT_LIMIT) return send(`${SKULL} @${short} — Límite de deuda alcanzado.`)
    const roll=Math.floor(Math.random()*6)+1
    const win=roll>=4
    if(win){
      const gross=amount
      const tax=Math.floor(gross*TAX_RATE)
      const net=gross-tax
      user.coins+=net
      global.db.data.casinoFund+=tax
      pushHistory(`Dados GANADOS +${net} (roll ${roll})`)
      if(net>GLOBAL_ANNOUNCE_THRESHOLD) await announceGlobal(`${short} ganó ${format(net)} en dados (roll ${roll}).`)
      return send(`${DICE} @${short} — Tirada ${roll}. GANASTE +${format(net)} (tax ${format(tax)})\nFichas: ${format(user.coins)}`)
    }else{
      user.coins-=amount
      pushHistory(`Dados PERDIDOS -${amount} (roll ${roll})`)
      return send(`${SKULL} @${short} — Tirada ${roll}. PERDISTE -${format(amount)}\nFichas: ${format(user.coins)}`)
    }
  }

  // ---------- RULETA ----------
  if(command.toLowerCase()==='ruleta'){
    const amount=parseInt(args[0])||0
    if(!amount||amount<=0) return send(`${SKULL} @${short} — Uso: ${usedPrefix}ruleta <cantidad>`)
    if(user.coins-amount<DEBT_LIMIT) return send(`${SKULL} @${short} — Límite de deuda alcanzado.`)
    const color=Math.random()<0.5?'Rojo':'Negro'
    const win=Math.random()<0.5
    if(win){
      const gross=amount
      const tax=Math.floor(gross*TAX_RATE)
      const net=gross-tax
      user.coins+=net
      global.db.data.casinoFund+=tax
      pushHistory(`Ruleta GANADA +${net} (color ${color})`)
      if(net>GLOBAL_ANNOUNCE_THRESHOLD) await announceGlobal(`${short} ganó ${format(net)} en ruleta!`)
      return send(`${CAS} @${short} — Ruleta ${color}. GANASTE +${format(net)} (tax ${format(tax)})\nFichas: ${format(user.coins)}`)
    }else{
      user.coins-=amount
      pushHistory(`Ruleta PERDIDA -${amount}`)
      return send(`${SKULL} @${short} — Ruleta ${color}. PERDISTE -${format(amount)}\nFichas: ${format(user.coins)}`)
    }
  }

  // ---------- SLOTS ----------
  if(command.toLowerCase()==='slots'){
    const symbols=['🍒','🍋','🍊','🍉','💎','7️⃣']
    const reel=[symbols[Math.floor(Math.random()*symbols.length)],symbols[Math.floor(Math.random()*symbols.length)],symbols[Math.floor(Math.random()*symbols.length)]]
    let win=false, amount=0
    if(reel[0]===reel[1]&&reel[1]===reel[2]){
      win=true
      amount=100
      user.coins+=amount
      global.db.data.casinoFund+=Math.floor(amount*TAX_RATE)
      pushHistory(`Slots GANADOS +${amount}`)
      if(amount>GLOBAL_ANNOUNCE_THRESHOLD) await announceGlobal(`${short} hizo JACKPOT en slots +${format(amount)}!`)
    }
    return send(`${CAS} @${short} — ${reel.join(' ')}\n${win?`GANASTE +${format(amount)}`:`No ganaste`} | Fichas: ${format(user.coins)}`)
  }

  // ---------- JACKPOT (caja misteriosa) ----------
  if(command.toLowerCase()==='jackpot'){
    const cost=100
    if(user.coins<cost) return send(`${SKULL} @${short} — Necesitas ${format(cost)} para abrir jackpot.`)
    user.coins-=cost
    const r=Math.random()
    if(r<0.5){
      const junk=Math.floor(Math.random()*50)
      pushHistory(`Jackpot basura +${junk}`)
      user.coins+=junk
      return send(`${BOX} @${short} — Jackpot barato: recuperaste ${format(junk)}\nFichas: ${format(user.coins)}`)
    }else if(r<0.85){
      const item=market[Math.floor(Math.random()*market.length)]
      const inv=user.inventory.find(x=>x.name===item.name)
      if(inv) inv.amount+=1; else user.inventory.push({name:item.name,amount:1})
      pushHistory(`Jackpot: recibió ${item.name}`)
      return send(`${BOX} @${short} — Jackpot entregó: ${item.name}\nFichas: ${format(user.coins)}`)
    }else{
      const big=Math.floor(Math.random()*1000)+300
      user.coins+=big
      pushHistory(`Jackpot fortuna +${big}`)
      if(big>GLOBAL_ANNOUNCE_THRESHOLD) await announceGlobal(`${short} sacó ${format(big)} del jackpot!`)
      return send(`${BOX} @${short} — Jackpot SUERTE: +${format(big)}\nFichas: ${format(user.coins)}`)
    }
  }

  // ---------- PERFIL CASINO ----------
  if(command.toLowerCase()==='perfilcasino'){
    const rank=getRank(user.coins)
    const invList=(user.inventory.length===0)?'Ninguno':user.inventory.map(i=>`${i.name} x${i.amount}`).join(', ')
    const lines=[
      `${CAS} PERFIL CASINO — @${short}`,
      ``,
      `Rango: ${rank}`,
      `Fichas: ${format(user.coins)}`,
      `Respect: ${user.respect||0}`,
      `Inventario: ${invList}`,
      `Historial (últ.5): ${user.history.slice(0,5).join(' | ')}`
    ]
    return send(lines.join('\n'))
  }

  // ---------- TOPCHIPS ----------
  if(['topchips','top'].includes(command.toLowerCase())){
    const arr=Object.keys(global.db.data.users).map(jid=>({jid,coins:global.db.data.users[jid].coins||0})).sort((a,b)=>b.coins-a.coins).slice(0,5)
    if(!arr||arr.length===0) return send(`${CAS} @${short} — Ningún jugador aún.`)
    let txt=`${ALERT} TOP ${CURRENCY} — Top 5\n`
    arr.forEach((u,i)=>txt+=`${i+1}) @${u.jid.split('@')[0]} — ${u.coins}\n`)
    return conn.sendMessage(m.chat,{ text: txt, mentions: arr.map(u=>u.jid) })
  }

  // ---------- HISTORY ----------
  if(command.toLowerCase()==='history'){
    if(!user.history||user.history.length===0) return send(`${CAS} @${short} — Sin historial.`)
    let txt=`${CAS} Historial de @${short}\n`
    user.history.slice(0,10).forEach(h=>txt+=`${B} ${h}\n`)
    return send(txt)
  }

  // ---------- INVENTARIO ----------
  if(command.toLowerCase()==='inventario'){
    if(!user.inventory||user.inventory.length===0) return send(`${CAS} @${short} — Inventario vacío.`)
    let txt=`${CAS} Inventario de @${short}\n`
    user.inventory.forEach(it=>txt+=`${B} ${it.name} x${it.amount}\n`)
    return send(txt)
  }

  // ---------- MERCADO ----------
  if(command.toLowerCase()==='mercado'){
    let txt=`${CAS} Mercado Casino — Objetos:\n`
    market.forEach((it,i)=>txt+=`${i+1}) ${it.name} — ${it.price} (${it.desc||'sin efecto'})\n`)
    txt+=`\nComprar: ${usedPrefix}comprar <nombre>\nVender: ${usedPrefix}vender


   // ---------- COMPRAR ----------
if(command.toLowerCase()==='comprar'){
  if(!args[0]) return send(`${SKULL} @${short} — Uso: ${usedPrefix}comprar <nombre>`)
  const item=findMarketItem(args.join(' '))
  if(!item) return send(`${SKULL} @${short} — No existe ese objeto en el mercado.`)
  if(user.coins<item.price) return send(`${SKULL} @${short} — No tienes suficientes fichas.`)
  user.coins-=item.price
  const inv=user.inventory.find(x=>x.name===item.name)
  if(inv) inv.amount+=1; else user.inventory.push({name:item.name,amount:1})
  pushHistory(`Compró ${item.name} -${item.price}`)
  return send(`${CAS} @${short} — Compraste: ${item.name} por ${format(item.price)}\nFichas: ${format(user.coins)}`)
}

// ---------- VENDER ----------
if(command.toLowerCase()==='vender'){
  if(!args[0]) return send(`${SKULL} @${short} — Uso: ${usedPrefix}vender <nombre>`)
  const itemName=args.join(' ')
  const invIndex=user.inventory.findIndex(i=>i.name.toLowerCase()===itemName.toLowerCase())
  if(invIndex===-1) return send(`${SKULL} @${short} — No tienes ese objeto.`)
  const itemMarket=findMarketItem(user.inventory[invIndex].name)
  if(!itemMarket) return send(`${SKULL} @${short} — No se puede vender este objeto.`)
  const sellPrice=Math.floor(itemMarket.price*0.7)
  user.coins+=sellPrice
  pushHistory(`Vendido ${itemMarket.name} +${sellPrice}`)
  if(user.inventory[invIndex].amount>1) user.inventory[invIndex].amount-=1
  else user.inventory.splice(invIndex,1)
  return send(`${CAS} @${short} — Vendiste: ${itemMarket.name} por ${format(sellPrice)}\nFichas: ${format(user.coins)}`)
}

// ---------- FIN DEL PLUGIN ----------
return
}

handler.command = [
  'casino','menucasino','saldo','coins','balance','daily',
  'apuesta','bet','flip','topchips','top','history',
  'dados','ruleta','slots','inventario','mercado','comprar','vender',
  'perfilcasino','jackpot'
]
handler.rowner = false
handler.mods = false
handler.register = true
export default handler
