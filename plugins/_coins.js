/* plugins/coins.js
   Juego de monedas avanzado - Militar Oscuro
   - Prefijo fijo: "."
   - Comandos: .saldo .daily .moneda <monto> .flip [monto] .topcoins
   - Saldo inicial: 500
   - Daily: 50 (24h)
   - Probabilidad de ganar: 60% en apuesta
   - Flip: apostar cualquier monto, 50/50
   - Deuda máxima: -100
   - Historial de últimas 10 jugadas
   - Menciones automáticas: @${who.split("@")[0]}
*/

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!global.db) global.db = { data: { users: {} } }
  if (!global.db.data) global.db.data = { users: {} }

  const sender = m.sender
  const short = sender.split("@")[0]

  // Inicializar usuario
  if (!global.db.data.users[sender]) {
    global.db.data.users[sender] = { coins: 500, lastDaily: 0, history: [] }
  }
  const user = global.db.data.users[sender]
  if (user.coins === undefined) user.coins = 500
  if (user.lastDaily === undefined) user.lastDaily = 0
  if (!user.history) user.history = []

  const DAILY_REWARD = 50
  const DAILY_COOLDOWN = 24 * 60 * 60 * 1000
  const WIN_PROB = 0.6
  const DEBT_LIMIT = -100

  const send = async (text) => {
    try { await conn.sendMessage(m.chat, { text, mentions: [sender] }) }
    catch (e) { try { await m.reply(text) } catch(err){console.error(err)} }
  }

  const addHistory = (type, amount, win) => {
    user.history.unshift({ type, amount, win, date: new Date().toLocaleString() })
    if (user.history.length > 10) user.history.pop()
  }

  const templates = {
    victory: (amount, newBalance) => `🦂 @${short}\nOperación: Apuesta ${amount} fichas.\nResultado: ÉXITO ✅\nGanancia: +${amount}\nSaldo: ${newBalance}\nVuelve cuando tengas sangre en las venas.`,
    defeat: (amount, newBalance) => `🦂 @${short}\nOperación: Apuesta ${amount} fichas.\nResultado: DERROTA ❌\nPérdida: -${amount}\nSaldo: ${newBalance}\nVuelve cuando tengas sangre en las venas.`,
    flip_result: (outcome, amount, newBalance, win) => `🦂 @${short}\nTirada: ${outcome}\n${win ? '¡ÉXITO! Ganaste' : 'DERROTA ❌ Perdiste'} ${amount} fichas\nSaldo: ${newBalance}`,
    saldo: (bal) => `🦂 @${short}\nInforme: Estado de recursos.\nSaldo actual: ${bal} fichas.`,
    daily_ok: (amount, newBalance) => `🦂 @${short}\nRecompensa diaria: +${amount} fichas.\nSaldo: ${newBalance}\nCumpliste tu turno.`,
    daily_cooldown: (h,m) => `🦂 @${short}\nEstado: En freno.\nVuelve en ${h}h ${m}m.`,
    debt_block: (limit) => `🦂 @${short}\nALERTA: Límite de deuda alcanzado (límite ${limit}).\nNo podes seguir apostando. Recuperá recursos o esperá al daily.\nNo vuelvas sin honor.`,
    usage_help: (p) => `🦂 @${short}\nComandos:\n${p}saldo - Ver saldo\n${p}daily - Cobrar 50 fichas (24h)\n${p}moneda <monto> - Apostar 60% éxito\n${p}flip [monto] - Tirada 50/50\n${p}topcoins - Top 5 soldados\n${p}history - Últimas 10 jugadas`
  }

  const cmd = command.toLowerCase()

  // SALDO
  if (cmd === 'saldo' || cmd === 'coins' || cmd === 'balance') return send(templates.saldo(user.coins))

  // DAILY
  if (cmd === 'daily') {
    const now = Date.now()
    if (now - (user.lastDaily || 0) < DAILY_COOLDOWN) {
      const remaining = DAILY_COOLDOWN - (now - user.lastDaily)
      const hours = Math.floor(remaining/(60*60*1000))
      const minutes = Math.floor((remaining % (60*60*1000)) / (60*1000))
      return send(templates.daily_cooldown(hours, minutes))
    }
    user.coins += DAILY_REWARD
    user.lastDaily = now
    addHistory('daily', DAILY_REWARD, true)
    return send(templates.daily_ok(DAILY_REWARD, user.coins))
  }

  // MONEDA/APUESTA
  if (cmd === 'moneda' || cmd === 'apostar' || cmd === 'bet') {
    if (!args[0]) return send(templates.usage_help(usedPrefix))
    let amount = parseInt(args[0].toString().replace(/[^0-9]/g,''))
    if (!amount || amount <= 0) return send(`🦂 @${short}\nCantidad inválida. Ingresá un número mayor a 0.`)
    if (user.coins - amount < DEBT_LIMIT) return send(templates.debt_block(DEBT_LIMIT))

    const win = Math.random() < WIN_PROB
    if (win) {
      user.coins += amount
      addHistory('moneda', amount, true)
      return send(templates.victory(amount, user.coins))
    } else {
      user.coins -= amount
      addHistory('moneda', amount, false)
      return send(templates.defeat(amount, user.coins))
    }
  }

  // FLIP PERSONALIZADO
  if (cmd === 'flip') {
    let amount = 10
    if (args[0]) amount = parseInt(args[0].toString().replace(/[^0-9]/g,''))
    if (!amount || amount <=0) amount = 10
    if (user.coins - amount < DEBT_LIMIT) return send(templates.debt_block(DEBT_LIMIT))

    const outcome = Math.random() < 0.5 ? 'CAR A' : 'CRUZ'
    const win = Math.random() < 0.5
    if (win) user.coins += amount
    else user.coins -= amount
    if (user.coins < DEBT_LIMIT) user.coins = DEBT_LIMIT
    addHistory('flip', amount, win)
    return send(templates.flip_result(outcome, amount, user.coins, win))
  }

  // TOP COINS
  if (cmd === 'topcoins' || cmd === 'top') {
    const users = Object.keys(global.db.data.users)
      .map(jid => ({ jid, coins: global.db.data.users[jid].coins ?? 0 }))
      .sort((a,b)=>b.coins-a.coins).slice(0,5)
    if (!users.length) return send(`🦂 @${short}\nNo hay datos de soldados todavía.`)
    let text = `🦂 RANKING MILITAR - TOP 5\n\n`
    for (let i=0;i<users.length;i++){
      text+= `${i+1}) @${users[i].jid.split('@')[0]} — ${users[i].coins} fichas\n`
    }
    text+=`\nMantengan la disciplina.`
    try{ const mentions = users.map(u=>u.jid); await conn.sendMessage(m.chat,{text,mentions}) } 
    catch(e){ return send(text) }
    return
  }

  // HISTORIAL
  if(cmd === 'history') {
    if(!user.history.length) return send(`🦂 @${short}\nNo hay jugadas registradas.`)
    let text = `🦂 @${short}\nÚltimas 10 jugadas:\n\n`
    user.history.forEach((h,i)=>{
      text += `${i+1}) ${h.type.toUpperCase()} — ${h.win?'GANÓ':'PERDIÓ'} ${h.amount} fichas — ${h.date}\n`
    })
    return send(text)
  }

  // AYUDA
  return send(templates.usage_help(usedPrefix))
}

handler.help = ['moneda <cantidad>', 'flip [monto]', 'saldo', 'daily', 'topcoins', 'history']
handler.tags = ['economy','fun']
handler.command = /^(moneda|apostar|bet|flip|saldo|coins|balance|daily|topcoins|top|history)$/i

export default handler
