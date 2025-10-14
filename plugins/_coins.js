/* plugins/coins_militar_v2.js
   Sistema MILITAR de monedas - Menú visual agresivo
   Toggle: .mecoins (solo owner)
   Menú: .menucoins
   Juegos: saldo, daily, apuesta, flip, dados, escuadrón, minado, topcoins, history
*/

let handler = async (m, { conn, args, usedPrefix, command }) => {
  const owners = ['59896026646','59898719147']
  const who = m.sender
  const short = who.split("@")[0]

  // DB inicial
  if (!global.db) global.db = { data: {} }
  if (!global.db.data.menuCoins) global.db.data.menuCoins = { active:true }
  if (!global.db.data.users) global.db.data.users = {}
  if (!global.db.data.users[who]) global.db.data.users[who] = { coins:500, lastDaily:0, history:[] }

  const user = global.db.data.users[who]
  const menuState = global.db.data.menuCoins

  const DAILY_REWARD = 50
  const DAILY_COOLDOWN = 24*60*60*1000
  const WIN_PROB = 0.6
  const DEBT_LIMIT = -100

  const randEmoji = (type) => {
    const emojis = type==='good'?['💥','🏆','🛡️','🎖️','🔥','💣']
                  : type==='bad'?['☠️','💀','⚔️','💢','💣','🕷️']
                  : ['🪖','🎲','📜','🌀']
    return emojis[Math.floor(Math.random()*emojis.length)]
  }

  const send = async(text)=>{
    try{ await conn.sendMessage(m.chat,{ text, mentions:[who] }) } 
    catch(e){ console.error(e) }
  }

  const templates = {
    victory:(amount,newBalance)=>`🪖 @${short}\n${randEmoji('good')} MISION CUMPLIDA! +${amount} fichas\nSaldo: ${newBalance} ${randEmoji('good')}`,
    defeat:(amount,newBalance)=>`💀 @${short}\n${randEmoji('bad')} FALLASTE EN EL COMBATE! -${amount} fichas\nSaldo: ${newBalance} ${randEmoji('bad')}`,
    flip:(outcome)=>`🪖 @${short}\n🎲 Tirada de campo: ${outcome} ${randEmoji()}`,
    saldo:(bal)=>`🪖 @${short}\n💣 Estado de recursos: ${bal} fichas`,
    daily_ok:(amount,newBalance)=>`🛡️ @${short}\n🎖️ Daily recibido: +${amount} fichas\nSaldo: ${newBalance}`,
    daily_cooldown:(h,m)=>`⏳ @${short}\n⚠️ Daily bloqueado. Vuelve en ${h}h ${m}m`,
    debt_block:(limit)=>`☠️ @${short} Límite de deuda alcanzado (${limit}). Retírate y prepárate para la siguiente batalla.`,
    menu_disabled:()=>`☠️🪖 @${short} — ¡El cuartel de monedas está cerrado! Solo el owner puede activarlo con .mecoins`
  }

  // ---------- TOGGLE ----------
  if(command.toLowerCase()==='mecoins'){
    if(!owners.includes(short)) return m.reply(`🚫 @${short} — Solo el owner puede ejecutar esto.`)
    menuState.active = !menuState.active
    const msg = menuState.active
      ? `⚡🪖 @${short} — CUARTEL DE MONEDAS ACTIVADO! 💥\n¡Todos los comandos disponibles para la tropa!`
      : `☠️🪖 @${short} — CUARTEL DE MONEDAS APAGADO! 💀\nVuelvan cuando tengan valor para jugar.`
    return send(msg)
  }

  // ---------- MENÚ VISUAL ----------
  if(command.toLowerCase()==='menucoins'){
    if(!menuState.active) return send(templates.menu_disabled())
    
    const deco = '═▸ ☠️🪖⚔️💣🛡️🔥 ◂═'
    const line = '─────────────────────────'
    const text = `
${deco}
💀  █▄─█▀▀▀█▄─▄█▄─▀█▀─▄█  MENÚ MILITAR DE MONEDAS  █▄─█▀▀▀█▄─▄█▄─▀█▀─▄█ 💀
${deco}

💎 Estado:
  └ .saldo — Ver recursos actuales

🎖️ Recompensas:
  └ .daily — Cobrar Daily

💰 Apuestas:
  └ .apuesta <cantidad> — Apostar fichas (60% chance)
  └ .flip [cantidad] — Tirada rápida
  └ .dados <cantidad> — Tirada de dados vs IA
  └ .escuadron <cantidad> — Batalla de escuadrones
  └ .minado <cantidad> — Minado arriesgado

🏆 Rankings:
  └ .topcoins — Top 5 soldados
  └ .history — Últimas 5 jugadas

💡 Owner: usar .mecoins para activar/desactivar el sistema
${line}`
    return send(text)
  }

  // ---------- BLOQUEO SI APAGADO ----------
  const mainCmds=['saldo','coins','balance','daily','apuesta','bet','flip','topcoins','top','history','dados','escuadron','minado']
  if(!menuState.active && mainCmds.includes(command.toLowerCase())) return send(templates.menu_disabled())

  // ---------- COMANDOS ----------
  if(['saldo','coins','balance'].includes(command.toLowerCase())) return send(templates.saldo(user.coins))

  if(command.toLowerCase()==='flip'){
    const outcome = Math.random()<0.5?'CAR A':'CRUZ'
    user.history.unshift(`Flip: ${outcome}`)
    if(user.history.length>5) user.history.pop()
    return send(templates.flip(outcome))
  }

  if(command.toLowerCase()==='daily'){
    const now = Date.now()
    if(now-(user.lastDaily||0)<DAILY_COOLDOWN){
      const remaining = DAILY_COOLDOWN-(now-user.lastDaily)
      const h = Math.floor(remaining/3600000), m = Math.floor((remaining%3600000)/60000)
      return send(templates.daily_cooldown(h,m))
    }
    user.coins+=DAILY_REWARD
    user.lastDaily = now
    user.history.unshift(`+${DAILY_REWARD} Daily`)
    if(user.history.length>5) user.history.pop()
    return send(templates.daily_ok(DAILY_REWARD,user.coins))
  }

  if(['apuesta','bet','moneda'].includes(command.toLowerCase())){
    if(!args[0]) return send(`🪖 @${short} Uso: ${usedPrefix}apuesta <cantidad>`)
    let amount=parseInt(args[0].toString().replace(/[^0-9]/g,''))
    if(!amount||amount<=0) return send(`💀 @${short} Cantidad inválida.`)
    if(user.coins-amount<DEBT_LIMIT) return send(templates.debt_block(DEBT_LIMIT))
    const win=Math.random()<WIN_PROB
    if(win){ user.coins+=amount; user.history.unshift(`+${amount} Apuesta`); if(user.history.length>5) user.history.pop(); return send(templates.victory(amount,user.coins)) }
    else { user.coins-=amount; user.history.unshift(`-${amount} Apuesta`); if(user.history.length>5) user.history.pop(); return send(templates.defeat(amount,user.coins)) }
  }

  if(command.toLowerCase()==='dados'){
    if(!args[0]) return send(`🪖 @${short} Uso: ${usedPrefix}dados <cantidad>`)
    let amount=parseInt(args[0].toString().replace(/[^0-9]/g,''))
    if(!amount||amount<=0) return send(`💀 @${short} Cantidad inválida.`)
    if(user.coins-amount<DEBT_LIMIT) return send(templates.debt_block(DEBT_LIMIT))
    const player = Math.floor(Math.random()*6)+1
    const ia = Math.floor(Math.random()*6)+1
    if(player>ia){ user.coins+=amount; user.history.unshift(`+${amount} Dados`); if(user.history.length>5) user.history.pop(); return send(templates.victory(amount,user.coins)) }
    else { user.coins-=amount; user.history.unshift(`-${amount} Dados`); if(user.history.length>5) user.history.pop(); return send(templates.defeat(amount,user.coins)) }
  }

  if(command.toLowerCase()==='escuadron'){
    if(!args[0]) return send(`🪖 @${short} Uso: ${usedPrefix}escuadron <cantidad>`)
    let amount=parseInt(args[0].toString().replace(/[^0-9]/g,''))
    if(!amount||amount<=0) return send(`💀 @${short} Cantidad inválida.`)
    if(user.coins-amount<DEBT_LIMIT) return send(templates.debt_block(DEBT_LIMIT))
    const win=Math.random()<0.5
    if(win){ user.coins+=amount; user.history.unshift(`+${amount} Escuadron`); if(user.history.length>5) user.history.pop(); return send(templates.victory(amount,user.coins)) }
    else { user.coins-=amount; user.history.unshift(`-${amount} Escuadron`); if(user.history.length>5) user.history.pop(); return send(templates.defeat(amount,user.coins)) }
  }

  if(command.toLowerCase()==='minado'){
    if(!args[0]) return send(`🪖 @${short} Uso: ${usedPrefix}minado <cantidad>`)
    let amount=parseInt(args[0].toString().replace(/[^0-9]/g,''))
    if(!amount||amount<=0) return send(`💀 @${short} Cantidad inválida.`)
    if(user.coins-amount<DEBT_LIMIT) return send(templates.debt_block(DEBT_LIMIT))
    const win=Math.random()<0.6
    if(win){ const gain=Math.floor(amount*Math.random()*2); user.coins+=gain; user.history.unshift(`+${gain} Minado`); if(user.history.length>5) user.history.pop(); return send(templates.victory(gain,user.coins)) }
    else { user.coins-=amount; user.history.unshift(`-${amount} Minado`); if(user.history.length>5) user.history.pop(); return send(templates.defeat(amount,user.coins)) }
  }

  if(['topcoins','top'].includes(command.toLowerCase())){
    const users=Object.keys(global.db.data.users).map(jid=>({jid,coins:global.db.data.users[jid].coins||0}))
      .sort((a,b)=>b.coins-a.coins).slice(0,5)
    if(users.length===0) return send(`🏆 @${short} — No hay soldados todavía.`)
    let text=`🏆 *TOP 5 SOLDADOS* 🏆\n`
    users.forEach((u,i)=>{text+=`${i+1}) @${u.jid.split('@')[0]} — ${u.coins} fichas\n`})
    return conn.sendMessage(m.chat,{text,mentions:users.map(u=>u.jid)})
  }

  if(command.toLowerCase()==='history'){
    if(!user.history||user.history.length===0) return send(`🪖 @${short} — No hay jugadas recientes.`)
    let text=`📜 *Últimas 5 Jugadas de @${short}*\n`
    user.history.forEach(h=>text+=`- ${h}\n`)
    return send(text)
  }

  return send(`🪖 @${short} — Comando no reconocido. Usa .menucoins para ver comandos.`)
}

// EXPORT
handler.help=['mecoins','menucoins','saldo','daily','apuesta','flip','dados','escuadron','minado','topcoins','history']
handler.tags=['economy','fun','owner']
handler.command=/^(mecoins|menucoins|saldo|coins|balance|daily|apuesta|bet|flip|dados|escuadron|minado|topcoins|top|history)$/i
export default handler
