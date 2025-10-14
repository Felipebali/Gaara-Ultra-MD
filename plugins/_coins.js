/* plugins/coins_militar_total.js
   Sistema militar completo de monedas y juegos
   - Toggle: .mecoins (solo owner)
   - Menú: .menucoins
   - Juegos: apuesta, flip, dados, minar, escuadron
   - Economía: saldo, daily, topcoins, history
   - Inventario y mercado: inventario, mercado, comprar, vender
   - Todas las menciones con ${who.split("@")[0]} y sin citar mensajes
   - Estilo militar agresivo, emojis y mensajes rudos
*/

let handler = async (m, { conn, args, usedPrefix, command }) => {
  const owners = ['59896026646','59898719147']
  const who = m.sender
  const short = who.split("@")[0]

  // DB inicial
  if(!global.db) global.db = { data:{} }
  if(!global.db.data.menuCoins) global.db.data.menuCoins={active:true}
  if(!global.db.data.users) global.db.data.users = {}
  if(!global.db.data.market) global.db.data.market = [
    {name:"Granada",price:200},
    {name:"Botiquin",price:100},
    {name:"Armadura",price:500},
    {name:"Municion",price:50}
  ]

  if(!global.db.data.users[who]) global.db.data.users[who] = {coins:500,lastDaily:0,history:[],inventory:[]}
  const user = global.db.data.users[who]
  const menuState = global.db.data.menuCoins
  const market = global.db.data.market

  const DAILY_REWARD = 50
  const DAILY_COOLDOWN = 24*60*60*1000
  const WIN_PROB = 0.6
  const DEBT_LIMIT = -100

  const emojis = {
    good:['💥','🏆','🛡️','🎖️','🔥','💣'],
    bad:['☠️','💀','⚔️','💢','💣','🕷️'],
    neutral:['🪖','🎲','📜','🌀']
  }
  const randEmoji=(type)=>{const arr=type==='good'?emojis.good:type==='bad'?emojis.bad:emojis.neutral; return arr[Math.floor(Math.random()*arr.length)]}

  const send = async(text)=>{try{await conn.sendMessage(m.chat,{text,mentions:[who]})}catch(e){console.error(e)}}

  const templates = {
    victory:(amount,newBalance)=>`🪖 @${short}\n${randEmoji('good')} MISION CUMPLIDA! +${amount} fichas\nSaldo: ${newBalance} ${randEmoji('good')}`,
    defeat:(amount,newBalance)=>`💀 @${short}\n${randEmoji('bad')} FALLASTE EN EL COMBATE! -${amount} fichas\nSaldo: ${newBalance} ${randEmoji('bad')}`,
    if(command.toLowerCase()==='flip'){
  const outcome = Math.random()<0.5?'CAR A':'CRUZ'
  user.history.unshift(`Flip: ${outcome}`); 
  if(user.history.length>5) user.history.pop()
  return send(`\u{1F3B2} @${short}\nTirada de campo: ${outcome}`);
  saldo:(bal)=>`🪖 @${short}\n💣 Estado de recursos: ${bal} fichas`,
  daily_ok:(amount,newBalance)=>`🛡️ @${short}\n🎖️ Daily recibido: +${amount} fichas\nSaldo: ${newBalance}`,
  daily_cooldown:(h,m)=>`⏳ @${short}\n⚠️ Daily bloqueado. Vuelve en ${h}h ${m}m`,
  debt_block:(limit)=>`☠️ @${short} Límite de deuda alcanzado (${limit}). Retírate y prepárate para la siguiente batalla.`,
  menu_disabled:()=>`☠️🪖 @${short} — ¡El cuartel de monedas está cerrado! Solo el owner puede activarlo con .mecoins`
  }

  // ---------- TOGGLE ----------
  if(command.toLowerCase()==='mecoins'){
    if(!owners.includes(short)) return m.reply(`🚫 @${short} — Solo el owner puede ejecutar esto.`)
    menuState.active=!menuState.active
    const msg = menuState.active
      ? `⚡🪖 @${short} — CUARTEL DE MONEDAS ACTIVADO! 💥\n¡Todos los comandos disponibles para la tropa!`
      : `☠️🪖 @${short} — CUARTEL DE MONEDAS APAGADO! 💀\nVuelvan cuando tengan valor para jugar.`
    return send(msg)
  }

  // ---------- MENÚ ----------
  if(command.toLowerCase()==='menucoins'){
    if(!menuState.active) return send(templates.menu_disabled())
    const deco='☠️🪖⚔️💣🛡️🔥'
    const text=`${deco}
💀 *MENÚ MILITAR DE MONEDAS* 💀
${deco}

💎 .saldo — Estado de recursos
🎖️ .daily — Cobrar Daily
💰 .apuesta <cantidad> — Apostar fichas (60% chance)
🎲 .flip [cantidad] — Tirada rápida
🎲 .dados <cantidad> — Tirada de 2 dados
⛏️ .minar — Minar fichas
🛡️ .escuadron — Aventura en escuadrón
🏆 .topcoins — Ranking top 5 soldados
📜 .history — Últimas 5 jugadas
🎒 .inventario — Ver inventario
🛒 .mercado — Ver objetos en venta
💳 .comprar <objeto> — Comprar
💰 .vender <objeto> — Vender

💡 Owner: usar .mecoins para activar/desactivar el sistema`
    return send(text)
  }

  // ---------- BLOQUEO SI APAGADO ----------
  const mainCmds=['saldo','coins','balance','daily','apuesta','bet','flip','dados','minar','escuadron','topcoins','top','history','inventario','mercado','comprar','vender']
  if(!menuState.active && mainCmds.includes(command.toLowerCase())) return send(templates.menu_disabled())

  // ---------- COMANDOS PRINCIPALES ----------
  if(['apuesta','bet','moneda'].includes(command.toLowerCase())){
if(['apuesta','bet','moneda'].includes(command.toLowerCase())){
  if(!args[0]) return send(`\u{1F396} @${short} Uso: ${usedPrefix}apuesta <cantidad>`)
  let amount=parseInt(args[0].toString().replace(/[^0-9]/g,''))
  if(!amount||amount<=0) return send(`\u{2620} @${short} Cantidad inválida.`)
  if(user.coins-amount<DEBT_LIMIT) return send(templates.debt_block(DEBT_LIMIT))
  const win=Math.random()<WIN_PROB
  if(win){ 
    user.coins+=amount
    user.history.unshift(`+${amount} Apuesta`)
    if(user.history.length>5) user.history.pop()
    return send(templates.victory(amount,user.coins))
  } else { 
    user.coins-=amount
    user.history.unshift(`-${amount} Apuesta`)
    if(user.history.length>5) user.history.pop()
    return send(templates.defeat(amount,user.coins))
  }
}

  // ---------- DADOS ----------
  if(command.toLowerCase()==='dados'){
  const dice1=Math.floor(Math.random()*6)+1
  const dice2=Math.floor(Math.random()*6)+1
  const total=dice1+dice2
  user.history.unshift(`Dados: ${dice1}+${dice2}=${total}`); 
  if(user.history.length>5) user.history.pop()
  return send(`\u{1F3B2} @${short} — Tirada de dados: ${dice1} + ${dice2} = ${total}`);
}

  // ---------- MINAR ----------
  if(command.toLowerCase()==='minar'){
    const gain=Math.floor(Math.random()*50)+10
    user.coins+=gain; user.history.unshift(`+${gain} Minado`); if(user.history.length>5) user.history.pop()
    return send(`⛏️ @${short} — Minaste y obtuviste ${gain} fichas 💰`)
  }

  // ---------- ESCUADRON ----------
  if(command.toLowerCase()==='escuadron'){
    const gain=Math.floor(Math.random()*100)+20, fail=Math.random()<0.3
    if(fail){user.history.unshift(`Escuadrón FALLIDO`); if(user.history.length>5) user.history.pop(); return send(`💀 @${short} — La misión de escuadrón falló. No obtuviste fichas`)}
    user.coins+=gain; user.history.unshift(`Escuadrón +${gain}`); if(user.history.length>5) user.history.pop()
    return send(`🛡️ @${short} — Misión de escuadrón exitosa! Ganaste ${gain} fichas 🏆`)
  }

  // ---------- TOP COINS ----------
  if(['topcoins','top'].includes(command.toLowerCase())){
    const users=Object.keys(global.db.data.users).map(jid=>({jid,coins:global.db.data.users[jid].coins||0})).sort((a,b)=>b.coins-a.coins).slice(0,5)
    if(users.length===0) return send(`🏆 @${short} — No hay soldados todavía.`)
    let text=`🏆 *TOP 5 SOLDADOS* 🏆\n`
    users.forEach((u,i)=>{text+=`${i+1}) @${u.jid.split('@')[0]} — ${u.coins} fichas\n`})
    return conn.sendMessage(m.chat,{text,mentions:users.map(u=>u.jid)})
  }

  // ---------- HISTORY ----------
  if(command.toLowerCase()==='history'){
    if(!user.history||user.history.length===0) return send(`🪖 @${short} — No hay jugadas recientes.`)
    let text=`📜 *Últimas 5 Jugadas de @${short}*\n`
    user.history.forEach(h=>text+=`- ${h}\n`)
    return send(text)
  }

  // ---------- INVENTARIO ----------
  if(command.toLowerCase()==='inventario'){
    if(!user.inventory||user.inventory.length===0) return send(`🎒 @${short} — Inventario vacío.`)
    let text=`🎒 *Inventario de @${short}*\n`
    user.inventory.forEach(i=>text+=`- ${i.name} x${i.amount}\n`)
    return send(text)
  }

  // ---------- MERCADO ----------
  if(command.toLowerCase()==='mercado'){
    let text=`🛒 *Mercado Militar* 🛒\n💣 Objetos disponibles:\n`
    market.forEach((item,i)=>{ text+=`${i+1}) ${item.name} — ${item.price} fichas\n` })
    return send(text)
  }

  // ---------- COMPRAR ----------
  if(command.toLowerCase()==='comprar'){
    if(!args[0]) return send(`💀 @${short} — Uso: ${usedPrefix}comprar <nombre objeto>`)
    const itemName=args.join(" ").toLowerCase()
    const item = market.find(x=>x.name.toLowerCase()===itemName)
    if(!item) return send(`💀 @${short} — Objeto no encontrado en el mercado.`)
    if(user.coins<item.price) return send(`☠️ @${short} — No tienes suficientes fichas para comprar ${item.name}.`)
    user.coins-=item.price
    const invItem = user.inventory.find(x=>x.name===item.name)
    if(invItem) invItem.amount+=1
    else user.inventory.push({name:item.name,amount:1})
    return send(`🛡️ @${short} — Compraste 1 ${item.name} por ${item.price} fichas.\nSaldo actual: ${user.coins}`)
  }

  // ---------- VENDER ----------
  if(command.toLowerCase()==='vender'){
    if(!args[0]) return send(`💀 @${short} — Uso: ${usedPrefix}vender <nombre objeto>`)
    const itemName=args.join(" ").toLowerCase()
    const invItem = user.inventory.find(x=>x.name.toLowerCase()===itemName)
    if(!invItem) return send(`💀 @${short} — No tienes ese objeto en tu inventario.`)
    const sellPrice = Math.floor((market.find(x=>x.name.toLowerCase()===itemName)?.price||0)/2)
    user.coins+=sellPrice
    invItem.amount-=1
    if(invItem.amount<=0) user.inventory = user.inventory.filter(x=>x.amount>0)
    return send(`💰 @${short} — Vendiste 1 ${invItem.name} por ${sellPrice} fichas.\nSaldo actual: ${user.coins}`)
  }

  return send(`🪖 @${short} — Comando no reconocido. Usa .menucoins para ver todos los comandos disponibles.`)
}

// EXPORT
handler.help=['mecoins','menucoins','saldo','daily','apuesta','flip','dados','minar','escuadron','topcoins','history','inventario','mercado','comprar','vender']
handler.tags=['economy','fun','owner']
handler.command=/^(mecoins|menucoins|saldo|coins|balance|daily|apuesta|bet|flip|dados|minar|escuadron|topcoins|top|history|inventario|mercado|comprar|vender)$/i
export default handler
