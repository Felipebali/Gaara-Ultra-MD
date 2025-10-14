/* plugins/coins_menu_militar.js
   Sistema de monedas militar rudo
   - Toggle: .mecoins (solo owner)
   - Menú: .menucoins
   - Comandos: saldo, daily, apuesta, flip, topcoins, history
   - Mensajes agresivos estilo militar
*/

let handler = async (m,{conn,args,usedPrefix,command})=>{
  const owners=['59896026646','59898719147']
  const who=m.sender
  const short=who.split('@')[0]

  // DB
  if(!global.db) global.db={data:{}}
  if(!global.db.data) global.db.data={users:{},menuCoins:{active:true}}
  if(!global.db.data.users) global.db.data.users={}
  if(!global.db.data.menuCoins) global.db.data.menuCoins={active:true}

  const user=global.db.data.users[who]||(global.db.data.users[who]={coins:500,lastDaily:0,history:[]})
  const menuState=global.db.data.menuCoins

  const DAILY_REWARD=50,DAILY_COOLDOWN=24*60*60*1000,WIN_PROB=0.6,DEBT_LIMIT=-100

  const emojis={good:['💥','🏆','🛡️','🎖️','🔥','💣'],bad:['☠️','💀','⚔️','💢','💣','🕷️'],neutral:['🪖','🎲','📜','🌀']}
  const randEmoji=(type)=>{ const arr=type==='good'?emojis.good:type==='bad'?emojis.bad:emojis.neutral; return arr[Math.floor(Math.random()*arr.length)] }

  const send=async(text,reaction=null)=>{
    try{
      if(reaction) await conn.sendMessage(m.chat,{reaction:{text:reaction,key:m.key}})
      await conn.sendMessage(m.chat,{text,mentions:[who]})
    }catch(e){ try{await m.reply(text)}catch(err){console.error(err)} }
  }

  const templates={
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
    menuState.active=!menuState.active
    const msg=menuState.active
      ? `⚡🪖 @${short} — CUARTEL DE MONEDAS ACTIVADO! 💥\n¡Todos los comandos disponibles para la tropa!`
      : `☠️🪖 @${short} — CUARTEL DE MONEDAS APAGADO! 💀\nVuelvan cuando tengan valor para jugar.`
    return conn.sendMessage(m.chat,{text:msg,mentions:[who]})
  }

  // ---------- MENÚ ----------
  if(command.toLowerCase()==='menucoins'){
    if(!menuState.active) return send(templates.menu_disabled())
    const deco='☠️🪖⚔️💣🛡️🔥'
    const text=`${deco}\n💀 *MENÚ DE MONEDAS MILITAR* 💀\n${deco}\n
💎 .saldo — Estado de recursos
🎖️ .daily — Cobrar Daily
💰 .apuesta <cant> — Apostar fichas (60% chance)
🎲 .flip [cant] — Tirada rápida
🏆 .topcoins — Ranking top 5 soldados
📜 .history — Últimas 5 jugadas

💡 Owner: usar .mecoins para activar/desactivar el sistema`
    return send(text,randEmoji())
  }

  // ---------- BLOQUEO SI APAGADO ----------
  const mainCmds=['saldo','coins','balance','daily','apuesta','bet','flip','topcoins','top','history']
  if(!menuState.active && mainCmds.includes(command.toLowerCase())) return send(templates.menu_disabled())

  // ---------- COMANDOS PRINCIPALES ----------
  if(['saldo','coins','balance'].includes(command.toLowerCase())) return send(templates.saldo(user.coins),randEmoji())

  if(command.toLowerCase()==='flip'){
    const outcome=Math.random()<0.5?'CAR A':'CRUZ'
    user.history.unshift(`Flip: ${outcome}`)
    if(user.history.length>5) user.history.pop()
    return send(templates.flip(outcome),randEmoji())
  }

  if(command.toLowerCase()==='daily'){
    const now=Date.now()
    if(now-(user.lastDaily||0)<DAILY_COOLDOWN){
      const remaining=DAILY_COOLDOWN-(now-user.lastDaily)
      const h=Math.floor(remaining/3600000), m=Math.floor((remaining%3600000)/60000)
      return send(templates.daily_cooldown(h,m),randEmoji())
    }
    user.coins+=DAILY_REWARD
    user.lastDaily=now
    user.history.unshift(`+${DAILY_REWARD} Daily`)
    if(user.history.length>5) user.history.pop()
    return send(templates.daily_ok(DAILY_REWARD,user.coins),randEmoji('good'))
  }

  if(['apuesta','bet','moneda'].includes(command.toLowerCase())){
    if(!args[0]) return send(`🪖 @${short} Uso: ${usedPrefix}apuesta <cantidad>`,randEmoji())
    let amount=parseInt(args[0].toString().replace(/[^0-9]/g,''))
    if(!amount||amount<=0) return send(`💀 @${short} Cantidad inválida.`,randEmoji('bad'))
    if(user.coins-amount<DEBT_LIMIT) return send(templates.debt_block(DEBT_LIMIT),randEmoji('bad'))
    const win=Math.random()<WIN_PROB
    if(win){ user.coins+=amount; user.history.unshift(`+${amount} Apuesta`); if(user.history.length>5) user.history.pop(); return send(templates.victory(amount,user.coins),randEmoji('good')) }
    else { user.coins-=amount; user.history.unshift(`-${amount} Apuesta`); if(user.history.length>5) user.history.pop(); return send(templates.defeat(amount,user.coins),randEmoji('bad')) }
  }

  if(['topcoins','top'].includes(command.toLowerCase())){
    const users=Object.keys(global.db.data.users).map(jid=>({jid,coins:global.db.data.users[jid].coins||0}))
      .sort((a,b)=>b.coins-a.coins).slice(0,5)
    if(users.length===0) return send(`🏆 @${short} — No hay soldados todavía.`,randEmoji())
    let text=`🏆 *TOP 5 SOLDADOS* 🏆\n`
    users.forEach((u,i)=>{text+=`${i+1}) @${u.jid.split('@')[0]} — ${u.coins} fichas\n`})
    return conn.sendMessage(m.chat,{text,mentions:users.map(u=>u.jid)})
  }

  if(command.toLowerCase()==='history'){
    if(!user.history||user.history.length===0) return send(`🪖 @${short} — No hay jugadas recientes.`,randEmoji())
    let text=`📜 *Últimas 5 Jugadas de @${short}*\n`
    user.history.forEach(h=>text+=`- ${h}\n`)
    return send(text,randEmoji())
  }

  return send(`🪖 @${short} — Comando no reconocido. Usa .menucoins para ver comandos.`,randEmoji('bad'))
}

// EXPORT
handler.help=['mecoins','menucoins','saldo','daily','apuesta','flip','topcoins','history']
handler.tags=['economy','fun','owner']
handler.command=/^(mecoins|menucoins|saldo|coins|balance|daily|apuesta|bet|flip|topcoins|top|history)$/i
export default handler
