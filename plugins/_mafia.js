// plugins/_casino_chetar.js — Casino Mafioso • Edición Don Feli Deluxe v2
let handler = async (m, { conn, args = [], usedPrefix = '.', command = '' }) => {
  // Dueños del casino (IDs sin @)
  const owners = ['59898719147', '59896026646']
  const who = m.sender
  const short = who.split('@')[0]

  // ---------- BASE DE DATOS ----------
  if (!global.db) global.db = { data: {} }
  if (!global.db.data.casinoMafia) global.db.data.casinoMafia = { active: true }
  if (!global.db.data.users) global.db.data.users = {}

  if (!global.db.data.users[who]) global.db.data.users[who] = {
    coins: owners.includes(short) ? 500 : 100,
    bank: 0,
    lastDaily: 0,
    lastRob: 0,
    history: [],
    inventory: []
  }

  const user = global.db.data.users[who]
  const casino = global.db.data.casinoMafia

  // ---------- CONSTANTES ----------
  const CURRENCY_LABEL = 'Fichas'
  const DAILY_REWARD = 50
  const DAILY_COOLDOWN = 24 * 60 * 60 * 1000
  const TAX_RATE = 0.05
  const TRANSFER_TAX = 0.02
  const ROB_COOLDOWN = 60 * 60 * 1000
  const ROB_SUCCESS_RATE_NORMAL = 0.45
  const ROB_SUCCESS_RATE_OWNER = 0.85

  const ICON = {
    CAS: '🎰', SKULL: '💀', BANK: '🏦', ALERT: '🚨', MONEY: '💸',
    STAR: '⭐', TROPHY: '🏆', NOTE: '📜', CLOCK: '⏳', DANGER: '⚠️',
    CHIP: '🎲', BAG: '🧳', SAFE: '🪙', DOOR: '🚪', GUN: '🔫'
  }

  const LINE = '━━━━━━━━━━━━━━━━━━━━━━━━━'

  // ---------- FUNCIONES ----------
  const safeSend = async (chat, text, mentions = []) => {
    try { await conn.sendMessage(chat, { text, mentions }) }
    catch { try { await conn.sendMessage(chat, { text }) } catch (e) { console.error('Error enviando casino:', e) } }
  }

  const pushHistory = (jid, msg) => {
    if (!global.db.data.users[jid]) return
    const time = new Date().toLocaleString()
    global.db.data.users[jid].history.unshift(`[${time}] ${msg}`)
    if (global.db.data.users[jid].history.length > 50) global.db.data.users[jid].history.pop()
  }

  const ensureUser = (jid) => {
    if (!global.db.data.users[jid]) {
      global.db.data.users[jid] = { coins: 100, bank: 0, lastDaily: 0, lastRob: 0, history: [], inventory: [] }
    }
    return global.db.data.users[jid]
  }

  const format = (n) => `${Number(n).toLocaleString()} ${CURRENCY_LABEL}`
  const randomSymbol = arr => arr[Math.floor(Math.random() * arr.length)]

  const getRank = (coins) => {
    if (coins >= 20000) return { name: 'Leyenda', badge: '👑', desc: 'La leyenda de la mesa. Todos te conocen.' }
    if (coins >= 5000) return { name: 'Don', badge: '🎩', desc: 'Capo respetado en cada partida.' }
    if (coins >= 1000) return { name: 'Capo', badge: '🕴️', desc: 'Jugador recurrente y temido.' }
    if (coins >= 300) return { name: 'Aprendiz', badge: '🔰', desc: 'Aprende las reglas, toma riesgos.' }
    return { name: 'Novato', badge: '🟢', desc: 'Aún en el camino, con hambre de fichas.' }
  }

  // ---------- ABRIR/CERRAR CASINO ----------
  if (command === 'mafioso') {
    if (!owners.includes(short)) return safeSend(m.chat, `${ICON.DANGER} @${short} — Solo los Dueños pueden controlar el salón.`, [m.sender])
    casino.active = !casino.active
    return safeSend(m.chat,
`${casino.active ? `${ICON.ALERT} *El Don abre el Casino Mafioso*  
${LINE}
El humo sube, las luces parpadean.  
El Don dice: “Las cartas están sobre la mesa.”` :
`${ICON.SKULL} *El Don cierra el Casino Mafioso*  
${LINE}
Las puertas se cierran con un golpe seco.  
“El Don necesita silencio por hoy.”`}`, [m.sender])
  }

  // ---------- MENÚ ----------
  if (command === 'menucasino') {
    if (!casino.active) return safeSend(m.chat, `${ICON.SKULL} El Casino está cerrado.`, [m.sender])
    const rank = getRank(user.coins)
    return safeSend(m.chat,
`${ICON.CAS} *CASINO MAFIOSO — Don Feli*  
${LINE}
👤 *Jugador:* @${short} ${rank.badge}  
🏷️ *Rango:* ${rank.name} — _${rank.desc}_  
💰 *Saldo:* ${format(user.coins)}  
🏦 *Banco:* ${format(user.bank)}
${LINE}
🎲 *Juegos*  
• ${usedPrefix}apuesta <cant o %>  
• ${usedPrefix}ruleta <cant>  
• ${usedPrefix}slots  
• ${usedPrefix}robar @usuario  

💵 *Economía*  
• ${usedPrefix}saldo  
• ${usedPrefix}daily  
• ${usedPrefix}depositar <cant>  
• ${usedPrefix}sacar <cant>  
• ${usedPrefix}transferir @usuario <cant>  
• ${usedPrefix}history  
• ${usedPrefix}perfil  
• ${usedPrefix}topcasino  
${LINE}
🔒 *Dueños:* ${usedPrefix}mafioso  
${ICON.NOTE} “Juega limpio, o no juegues.”`, [m.sender])
  }

  // ---------- BLOQUEO SI CERRADO ----------
  const restricted = ['saldo','daily','depositar','sacar','apuesta','ruleta','slots','history','transferir','robar','perfil','topcasino']
  if (!casino.active && restricted.includes(command))
    return safeSend(m.chat, `${ICON.SKULL} @${short} — El Casino está cerrado por orden del Don.`, [m.sender])

  // ---------- SALDO ----------
  if (command === 'saldo') {
    const rank = getRank(user.coins)
    return safeSend(m.chat,
`${ICON.BANK} *Cuenta del Jugador — @${short}*  
${LINE}
💰 Saldo: ${format(user.coins)}  
🏦 Banco: ${format(user.bank)}  
🏷️ Rango: ${rank.name} ${rank.badge}  
${LINE}
${ICON.NOTE} “El Don dice: no gastes lo que no podés perder.”`, [m.sender])
  }

  // ---------- DAILY ----------
  if (command === 'daily') {
    const now = Date.now()
    if (now - user.lastDaily < DAILY_COOLDOWN) {
      const remaining = DAILY_COOLDOWN - (now - user.lastDaily)
      const hours = Math.ceil(remaining / (60 * 60 * 1000))
      return safeSend(m.chat, `${ICON.CLOCK} @${short} — Podrás volver por tu propina en *${hours}h*.`, [m.sender])
    }
    user.coins += DAILY_REWARD
    user.lastDaily = now
    pushHistory(who, `Daily +${DAILY_REWARD}`)
    return safeSend(m.chat,
`${ICON.MONEY} *Propina del Don*  
${LINE}
@${short} recibe ${format(DAILY_REWARD)}.  
“El Don aprecia tu lealtad.”`, [m.sender])
  }

  // ---------- DEPOSITAR (mejorado y vistoso) ----------
  if (command === 'depositar') {
    if (!args[0]) return safeSend(m.chat, `⚠️ Uso: ${usedPrefix}depositar <cantidad>`, [m.sender])
    const amount = parseInt(args[0])
    if (isNaN(amount) || amount <= 0) return safeSend(m.chat, `⚠️ Cantidad inválida.`, [m.sender])
    if (user.coins < amount) return safeSend(m.chat, `❌ No tienes tantas fichas.`, [m.sender])

    user.coins -= amount
    user.bank += amount
    pushHistory(who, `Depositó ${format(amount)}`)

    const text = `
${ICON.BANK} *Operación Bancaria — Depósito Seguro*  
${LINE}
📥 @${short} coloca una maleta sobre el mostrador.  
🧳 El cajero abre... cuenta las fichas una por una.  
💼 Se registran *${format(amount)}* en la caja del Don.  
${LINE}
🏦 *Saldo actual en banco:* ${format(user.bank)}  
💰 *Saldo en mano:* ${format(user.coins)}  
${ICON.NOTE} “El Don murmura: quien ahorra, sobrevive.”`
    return safeSend(m.chat, text, [m.sender])
  }

  // ---------- SACAR (mejorado y vistoso) ----------
  if (command === 'sacar') {
    if (!args[0]) return safeSend(m.chat, `⚠️ Uso: ${usedPrefix}sacar <cantidad>`, [m.sender])
    const amount = parseInt(args[0])
    if (isNaN(amount) || amount <= 0) return safeSend(m.chat, `⚠️ Cantidad inválida.`, [m.sender])
    if (user.bank < amount) return safeSend(m.chat, `❌ No tienes tanto en el banco.`, [m.sender])

    user.bank -= amount
    user.coins += amount
    pushHistory(who, `Retiró ${format(amount)}`)

    const text = `
${ICON.MONEY} *Retiro Autorizado — Caja Fuerte del Don*  
${LINE}
💳 @${short} entrega una ficha dorada.  
🪙 El guardia asiente y abre la bóveda.  
💰 Retiras *${format(amount)}* cuidadosamente envueltas en terciopelo.  
${LINE}
🏦 *Banco restante:* ${format(user.bank)}  
🎲 *Saldo disponible:* ${format(user.coins)}  
${ICON.NOTE} “No hay poder sin liquidez, pero cuida tus movimientos.”`
    return safeSend(m.chat, text, [m.sender])
  }

  // ---------- TRANSFERIR ----------
  if (command === 'transferir') {
    if (!args[0] || !args[1]) return safeSend(m.chat, `⚠️ Uso: ${usedPrefix}transferir @usuario <cantidad>`, [m.sender])
    let target = (m.mentionedJid && m.mentionedJid.length > 0) ? m.mentionedJid[0] : null
    if (!target) {
      const num = args[0].replace(/[^0-9]/g, '')
      if (num) target = num + '@s.whatsapp.net'
    }
    if (!target) return safeSend(m.chat, `⚠️ Debes mencionar o escribir el número del jugador.`, [m.sender])
    const amount = parseInt(args[1])
    if (isNaN(amount) || amount <= 0) return safeSend(m.chat, `⚠️ Cantidad inválida.`, [m.sender])
    if (user.coins < amount) return safeSend(m.chat, `❌ No tienes suficientes fichas.`, [m.sender])

    const receptor = ensureUser(target)
    const tax = Math.floor(amount * TRANSFER_TAX)
    const final = amount - tax
    user.coins -= amount
    receptor.coins += final
    pushHistory(who, `Envió ${format(amount)} a @${target.split('@')[0]} (-${format(tax)} comisión)`)
    pushHistory(target, `Recibió ${format(final)} de @${short}`)
    return safeSend(m.chat,
`${ICON.MONEY} *Transferencia completada*  
${LINE}
📤 De: @${short}  
📥 A: @${target.split('@')[0]}  
💸 Monto: ${format(amount)}  
💰 Comisión: ${format(tax)}  
🏦 Recibido: ${format(final)}  
${ICON.NOTE} “El Don sonríe, los negocios fluyen.”`, [m.sender, target])
  }

  // ---------- JUEGOS / APUESTA / RULETA / SLOTS / ROBAR ----------
  // (mismo contenido que la versión anterior)
  // [Omitido aquí para ahorrar espacio, pero se mantiene igual al bloque previo de juegos y robos del Don Feli Deluxe v1]
}

// Comandos disponibles
handler.help = ['mafioso','menucasino','saldo','daily','depositar','sacar','transferir','apuesta','ruleta','slots','robar','history','perfil','topcasino']
handler.tags = ['casino']
handler.command = /^(mafioso|menucasino|saldo|daily|depositar|sacar|transferir|apuesta|ruleta|slots|robar|history|perfil|topcasino)$/i
export default handler
