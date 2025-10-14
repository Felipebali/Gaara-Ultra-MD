/* plugins/coins.js
   Juego de monedas - Estilo "Militar Oscuro"
   - Prefijo fijo: "."
   - Comandos: .saldo .daily .moneda <monto> .flip .topcoins
   - Saldo inicial: 500
   - Daily: 50 (24h cooldown)
   - Probabilidad de ganar: 60%
   - Deuda permitida hasta: -100 (límite)
   - Menciones: usa @${sender.split("@")[0]}
   Compatible con estructura global.db.data.users
*/

let handler = async (m, { conn, args, usedPrefix, command }) => {
  // asegurar estructura de DB
  if (!global.db) global.db = { data: { users: {} } }
  if (!global.db.data) global.db.data = { users: {} }
  if (!global.db.data.users) global.db.data.users = {}

  const sender = m.sender
  const short = sender.split('@')[0]

  // Inicializar usuario si no existe o si quieres forzar inicio con 500
  if (!global.db.data.users[sender]) {
    global.db.data.users[sender] = { coins: 500, lastDaily: 0 }
  }
  const user = global.db.data.users[sender]
  if (user.coins === undefined) user.coins = 500
  if (user.lastDaily === undefined) user.lastDaily = 0

  const cmd = command.toLowerCase()

  const send = async (text) => {
    try {
      await conn.sendMessage(m.chat, { text, mentions: [sender] })
    } catch (e) {
      try { await m.reply(text) } catch (err) { console.error('No se pudo enviar mensaje:', err) }
    }
  }

  // Mensajes estilo Militar Oscuro
  const templates = {
    victory: (amount, newBalance) => (
      `🦂 @${short}\n` +
      `Operación: Apuesta ${amount} fichas.\n` +
      `Resultado: ÉXITO ✅\n` +
      `Ganancia: +${amount}\n` +
      `Saldo: ${newBalance}\n` +
      `Vuelve cuando tengas sangre en las venas.`
    ),
    defeat: (amount, newBalance) => (
      `🦂 @${short}\n` +
      `Operación: Apuesta ${amount} fichas.\n` +
      `Resultado: DERROTA ❌\n` +
      `Pérdida: -${amount}\n` +
      `Saldo: ${newBalance}\n` +
      `Vuelve cuando tengas sangre en las venas.`
    ),
    flip: (outcome) => (
      `🦂 @${short}\n` +
      `Tirada: ${outcome}\n` +
      `Que la suerte te acompañe, soldado.`
    ),
    saldo: (bal) => (
      `🦂 @${short}\n` +
      `Informe: Estado de recursos.\n` +
      `Saldo actual: ${bal} fichas.`
    ),
    daily_ok: (amount, newBalance) => (
      `🦂 @${short}\n` +
      `Recompensa diaria: +${amount} fichas.\n` +
      `Saldo: ${newBalance}\n` +
      `Cumpliste tu turno.`
    ),
    daily_cooldown: (h, m) => (
      `🦂 @${short}\n` +
      `Estado: En freno.\n` +
      `You already collected your daily. Vuelve en ${h}h ${m}m.`
    ),
    debt_block: (limit) => (
      `🦂 @${short}\n` +
      `ALERTA: Límite de deuda alcanzado (límite ${limit}).\n` +
      `No podes seguir apostando. Recuperá recursos o esperá al daily.\n` +
      `No vuelvas sin honor.`
    ),
    usage_help: (p) => (
      `🦂 @${short}\n` +
      `Comandos disponibles:\n` +
      `${p}saldo - Ver saldo\n` +
      `${p}daily - Cobrar 50 fichas (24h)\n` +
      `${p}moneda <monto> - Apostar\n` +
      `${p}flip - Tirada sin apuestas\n` +
      `${p}topcoins - Top 5 soldados (ranking)`
    )
  }

  // Configuración del juego
  const DAILY_REWARD = 50
  const DAILY_COOLDOWN = 24 * 60 * 60 * 1000
  const WIN_PROB = 0.6
  const DEBT_LIMIT = -100

  // Comandos
  if (cmd === 'saldo' || cmd === 'coins' || cmd === 'balance') {
    return send(templates.saldo(user.coins))
  }

  if (cmd === 'flip') {
    const outcome = Math.random() < 0.5 ? 'CAR A' : 'CRUZ'
    return send(templates.flip(outcome))
  }

  if (cmd === 'daily') {
    const now = Date.now()
    if (now - (user.lastDaily || 0) < DAILY_COOLDOWN) {
      const remaining = DAILY_COOLDOWN - (now - user.lastDaily)
      const hours = Math.floor(remaining / (60 * 60 * 1000))
      const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000))
      return send(templates.daily_cooldown(hours, minutes))
    }
    user.coins += DAILY_REWARD
    user.lastDaily = now
    return send(templates.daily_ok(DAILY_REWARD, user.coins))
  }

  if (cmd === 'moneda' || cmd === 'apostar' || cmd === 'bet') {
    if (!args || args.length === 0) return send(templates.usage_help(usedPrefix))
    let amount = parseInt(args[0].toString().replace(/[^0-9]/g, ''))
    if (!amount || amount <= 0) return send(`🦂 @${short}\nCantidad inválida. Ingresá un número mayor a 0.`)

    const projected = user.coins - amount
    if (projected < DEBT_LIMIT) return send(templates.debt_block(DEBT_LIMIT))

    const win = Math.random() < WIN_PROB
    if (win) {
      user.coins += amount
      return send(templates.victory(amount, user.coins))
    } else {
      user.coins -= amount
      return send(templates.defeat(amount, user.coins))
    }
  }

  if (cmd === 'topcoins' || cmd === 'top') {
    const users = Object.keys(global.db.data.users)
      .map(jid => ({ jid, coins: global.db.data.users[jid].coins ?? 0 }))
      .sort((a, b) => b.coins - a.coins)
      .slice(0, 5)

    if (!users.length) return send(`🦂 @${short}\nNo hay datos de soldados todavía.`)

    let text = `🦂 RANKING MILITAR - TOP 5\n\n`
    for (let i = 0; i < users.length; i++) {
      const u = users[i]
      text += `${i + 1}) @${u.jid.split('@')[0]} — ${u.coins} fichas\n`
    }
    text += `\nMantengan la disciplina.`
    try {
      const mentions = users.map(u => u.jid)
      await conn.sendMessage(m.chat, { text, mentions })
    } catch (e) {
      return send(text)
    }
    return
  }

  return send(templates.usage_help(usedPrefix))
}

handler.help = ['moneda <cantidad>', 'saldo', 'flip', 'daily', 'topcoins']
handler.tags = ['economy', 'fun']
handler.command = /^(moneda|apostar|bet|saldo|coins|balance|flip|daily|topcoins|top)$/i

export default handler
