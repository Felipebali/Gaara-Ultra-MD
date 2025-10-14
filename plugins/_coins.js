/* plugins/_coins.js
   Juego de monedas estilo Arcade Cósmico
   Comandos: .saldo .daily .apuesta <monto> .flip [monto] .topcoins .history
*/

let handler = async (m, { conn, args, usedPrefix, command }) => {
  // Inicializar DB si no existe
  if (!global.db) global.db = { data: {} }
  if (!global.db.data.users) global.db.data.users = {}

  const sender = m.sender
  const short = sender.split("@")[0]

  // Inicializar usuario
  if (!global.db.data.users[sender]) global.db.data.users[sender] = { coins: 500, lastDaily: 0, history: [] }
  const user = global.db.data.users[sender]
  if (user.coins === undefined) user.coins = 500
  if (!user.history) user.history = []

  const DAILY_REWARD = 50
  const DAILY_COOLDOWN = 24*60*60*1000
  const WIN_PROB = 0.6
  const DEBT_LIMIT = -100

  const send = async text => {
    try { await conn.sendMessage(m.chat, { text, mentions: [sender] }) }
    catch(e){ try{ await m.reply(text) } catch(err){console.error(err)} }
  }

  const react = async emoji => {
    try { await conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } }) }
    catch(e){ console.error(e) }
  }

  const addHistory = (type, amount, win) => {
    user.history.unshift({ type, amount, win, date: new Date().toLocaleString() })
    if (user.history.length > 10) user.history.pop()
  }

  const templates = {
    victory: (amt, bal) => `💥🎰 @${short}\n¡VICTORIA! Ganaste +${amt} 💎\nSaldo: ${bal} 🕹️`,
    defeat: (amt, bal) => `💀🕹️ @${short}\n¡DERROTA! Perdeste ${amt} 💎\nSaldo: ${bal}`,
    flip_result: (outcome, amt, bal, win) => `🎲🕹️ @${short}\nTirada: ${outcome}\n${win?'¡GANASTE!':'PERDISTE'} ${amt} 💎\nSaldo: ${bal}`,
    saldo: bal => `💎📊 @${short}\nSaldo actual: ${bal} fichas`,
    daily_ok: (amt, bal) => `🎖️💰 @${short}\nDaily: +${amt} 💎\nSaldo: ${bal} 🕹️`,
    daily_cooldown: (h,m) => `⌛ @${short}\nDaily en espera: ${h}h ${m}m`,
    debt_block: limit => `🚫💥 @${short}\n¡Límite de deuda alcanzado (${limit}) 💀!`
  }

  const cmd = command.toLowerCase()

  // SALDO
  if (cmd === 'saldo' || cmd === 'coins' || cmd === 'balance') {
    await react('💎'); return send(templates.saldo(user.coins))
  }

  // DAILY
  if (cmd === 'daily') {
    await react('🎖️')
    const now = Date.now()
    if(now - user.lastDaily < DAILY_COOLDOWN) {
      const remaining = DAILY_COOLDOWN - (now - user.lastDaily)
      const h = Math.floor(remaining/(60*60*1000))
      const m = Math.floor((remaining%(60*60*1000))/(60*1000))
      return send(templates.daily_cooldown(h,m))
    }
    user.coins += DAILY_REWARD
    user.lastDaily = now
    addHistory('daily', DAILY_REWARD, true)
    return send(templates.daily_ok(DAILY_REWARD,user.coins))
  }

  // APUESTA
  if (cmd === 'apuesta' || cmd === 'moneda' || cmd === 'bet') {
    await react('🎰')
    if(!args[0]) return send(`📝 Uso: ${usedPrefix}apuesta <cantidad>`)
    let amount = parseInt(args[0].replace(/[^0-9]/g,''))
    if(!amount || amount<=0) return send(`❌ @${short} Cantidad inválida`)
    if(user.coins - amount < DEBT_LIMIT) return send(templates.debt_block(DEBT_LIMIT))
    
    // Niveles de riesgo
    let multiplier = 1
    if(amount >= 100) multiplier = 2
    else if(amount >=50) multiplier = 1.5

    const win = Math.random() < WIN_PROB
    if(win){ 
      const gain = Math.floor(amount * multiplier)
      user.coins += gain
      addHistory('apuesta',gain,true)
      return send(`💥🎰 @${short}\n¡VICTORIA! Ganaste +${gain} 💎 (x${multiplier})\nSaldo: ${user.coins} 🕹️`)
    } else { 
      user.coins -= amount
      addHistory('apuesta',amount,false)
      return send(`💀🕹️ @${short}\n¡DERROTA! Perdeste ${amount} 💎\nSaldo: ${user.coins}`)
    }
  }

  // FLIP
  if (cmd === 'flip') {
    await react('🎲')
    let amount = args[0]?parseInt(args[0].replace(/[^0-9]/g,'')):10
    if(!amount || amount<=0) amount = 10
    if(user.coins - amount < DEBT_LIMIT) return send(templates.debt_block(DEBT_LIMIT))
    const outcome = Math.random()<0.5?'CAR A':'CRUZ'
    const win = Math.random()<0.5
    if(win) user.coins+=amount; else user.coins-=amount
    if(user.coins<DEBT_LIMIT) user.coins=DEBT_LIMIT
    addHistory('flip',amount,win)
    return send(templates.flip_result(outcome,amount,user.coins,win))
  }

  // TOP COINS
  if(cmd==='topcoins'||cmd==='top'){
    await react('🏆')
    const users = Object.keys(global.db.data.users)
      .map(jid=>({jid,coins:global.db.data.users[jid].coins||0}))
      .sort((a,b)=>b.coins-a.coins).slice(0,5)
    if(!users.length) return send(`🧐 @${short}\nNo hay jugadores todavía.`)
    let text = `🏆🎮 TOP 5 ARCADE\n\n`
    users.forEach((u,i)=>text+=`${i+1}) @${u.jid.split('@')[0]} — ${u.coins} 💎\n`)
    return send(text)
  }

  // HISTORIAL
  if(cmd==='history'){
    await react('📜')
    if(!user.history.length) return send(`📜 @${short}\nNo hay jugadas registradas`)
    let text=`📜 @${short}\nÚltimas 10 jugadas:\n\n`
    user.history.forEach((h,i)=>text+=`${i+1}) ${h.type.toUpperCase()} — ${h.win?'✅ GANÓ':'❌ PERDIÓ'} ${h.amount} 💎 — ${h.date}\n`)
    return send(text)
  }

  // AYUDA
  return send(`🛠️ @${short}\nComandos:\n${usedPrefix}saldo\n${usedPrefix}daily\n${usedPrefix}apuesta <monto>\n${usedPrefix}flip [monto]\n${usedPrefix}topcoins\n${usedPrefix}history`)
}

handler.help = ['apuesta <cantidad>','flip [monto]','saldo','daily','topcoins','history']
handler.tags = ['economy','fun']
handler.command = /^(apuesta|moneda|bet|flip|saldo|coins|balance|daily|topcoins|top|history)$/i

export default handler
