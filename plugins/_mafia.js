// plugins/_casino_chetar.js — versión profesional “Don Feli”
let handler = async (m, { conn, args = [], usedPrefix = '.', command = '' }) => {
  const owners = ['59898719147', '59896026646']
  const who = m.sender
  const short = who.split('@')[0]

  if (!global.db) global.db = { data: {} }
  if (!global.db.data.casinoMafia) global.db.data.casinoMafia = { active: true }
  if (!global.db.data.users) global.db.data.users = {}

  if (!global.db.data.users[who]) global.db.data.users[who] = {
    coins: owners.includes(short) ? 500 : 100,
    bank: 0, lastDaily: 0, lastRob: 0, history: [], inventory: [],
  }

  const user = global.db.data.users[who]
  const casino = global.db.data.casinoMafia

  const CURRENCY = '💰 Fichas'
  const CAS = '🎰', SKULL = '💀', BANK = '🏦', ALERT = '🚨', MONEY = '💸'
  const LINE = '━━━━━━━━━━━━━━━━━━━'

  const format = n => `${n.toLocaleString()}`
  const safeSend = async (chat, text, mentions = []) => {
    try { await conn.sendMessage(chat, { text, mentions }) }
    catch { try { await conn.sendMessage(chat, { text }) } catch (e) { console.error(e) } }
  }

  const pushHistory = (jid, msg) => {
    const u = global.db.data.users[jid]
    if (!u) return
    u.history.unshift(msg)
    if (u.history.length > 50) u.history.pop()
  }

  const ensureUser = (jid) => {
    if (!global.db.data.users[jid]) global.db.data.users[jid] = { coins: 100, bank: 0, lastDaily: 0, lastRob: 0, history: [] }
    return global.db.data.users[jid]
  }

  // -------------------- TOGGLE CASINO --------------------
  if (command === 'mafioso') {
    if (!owners.includes(short))
      return safeSend(m.chat, `🚫 *Acceso denegado, @${short}.*\nSolo los dueños pueden manipular el negocio.`, [m.sender])
    casino.active = !casino.active
    return safeSend(m.chat, casino.active ?
      `🔫 *Don Feli ordena abrir el Casino Mafioso.*\n${LINE}\n🍷 Las luces se encienden, el humo llena la sala...\nBienvenido al juego, capo.` :
      `💼 *El Don cerró el Casino Mafioso.*\n${LINE}\nSilencio... los apostadores guardan sus fichas.`, [m.sender])
  }

  // -------------------- MENÚ --------------------
  if (command === 'menucasino') {
    if (!casino.active) return safeSend(m.chat, `💀 El Casino Mafioso está cerrado.`, [m.sender])
    return safeSend(m.chat,
`${CAS} *CASINO MAFIOSO – Don Feli*  
${LINE}
👤 *Jugador:* @${short}
💰 *Saldo:* ${format(user.coins)} ${CURRENCY}
🏦 *Banco:* ${format(user.bank)} ${CURRENCY}
${LINE}

🎲 *Juegos disponibles*
• .apuesta <cantidad o %>
• .ruleta <cantidad>
• .slots
• .robar @usuario [cantidad]

💵 *Economía*
• .saldo — Ver tu fortuna
• .daily — Recompensa diaria
• .depositar <cantidad>
• .sacar <cantidad>
• .transferir @usuario <cantidad>
• .history — Movimientos

🔒 *Dueños*
• .mafioso — abrir/cerrar casino`, [m.sender])
  }

  const restricted = ['saldo','daily','depositar','sacar','apuesta','ruleta','slots','history','transferir','robar','rob']
  if (!casino.active && restricted.includes(command))
    return safeSend(m.chat, `💀 *@${short}, el casino está cerrado.*\nEl Don no permite apuestas fuera de horario.`, [m.sender])

  // -------------------- SALDO --------------------
  if (command === 'saldo')
    return safeSend(m.chat,
`💼 *Cuenta del jugador @${short}*  
${LINE}
💰 Saldo: ${format(user.coins)} ${CURRENCY}  
🏦 Banco: ${format(user.bank)} ${CURRENCY}
${LINE}
📜 El Don dice: “La suerte favorece a los valientes.”`, [m.sender])

  // -------------------- DAILY --------------------
  if (command === 'daily') {
    const now = Date.now()
    const cooldown = 24 * 60 * 60 * 1000
    if (now - user.lastDaily < cooldown) {
      const h = Math.ceil((cooldown - (now - user.lastDaily)) / 3600000)
      return safeSend(m.chat, `⏳ @${short}, volvé en *${h}h* para reclamar tus fichas diarias.`, [m.sender])
    }
    const reward = 50
    user.coins += reward
    user.lastDaily = now
    pushHistory(who, `Daily +${reward}`)
    return safeSend(m.chat,
`🎁 *Recompensa diaria*  
${LINE}
@${short}, recibís +${format(reward)} ${CURRENCY}.  
El Don sonríe satisfecho.`, [m.sender])
  }

  // -------------------- DEPOSITAR --------------------
  if (command === 'depositar') {
    if (!args[0]) return safeSend(m.chat, `Uso correcto: ${usedPrefix}depositar <cantidad>`, [m.sender])
    const amount = parseInt(args[0])
    if (isNaN(amount) || amount <= 0) return safeSend(m.chat, `Cantidad inválida.`, [m.sender])
    if (user.coins < amount) return safeSend(m.chat, `No tenés tantas fichas.`, [m.sender])
    user.coins -= amount
    user.bank += amount
    pushHistory(who, `Depositó ${amount}`)
    return safeSend(m.chat, `🏦 *Depósito exitoso*  
${LINE}
@${short} guardó ${format(amount)} ${CURRENCY} en el banco.  
“El dinero seguro es dinero sabio.”`, [m.sender])
  }

  // -------------------- SACAR --------------------
  if (command === 'sacar') {
    if (!args[0]) return safeSend(m.chat, `Uso correcto: ${usedPrefix}sacar <cantidad>`, [m.sender])
    const amount = parseInt(args[0])
    if (isNaN(amount) || amount <= 0) return safeSend(m.chat, `Cantidad inválida.`, [m.sender])
    if (user.bank < amount) return safeSend(m.chat, `No tenés tanto en el banco.`, [m.sender])
    user.bank -= amount
    user.coins += amount
    pushHistory(who, `Retiró ${amount}`)
    return safeSend(m.chat, `💸 *Retiro completado*  
${LINE}
@${short} retiró ${format(amount)} ${CURRENCY} del banco.`, [m.sender])
  }

  // -------------------- TRANSFERIR --------------------
  if (command === 'transferir') {
    if (!args[0] || !args[1]) return safeSend(m.chat, `Uso: ${usedPrefix}transferir @usuario <cantidad>`, [m.sender])
    let target = m.mentionedJid?.[0] || args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net'
    if (!target) return safeSend(m.chat, `Debes mencionar o escribir el número del jugador.`, [m.sender])
    const amount = parseInt(args[1])
    if (isNaN(amount) || amount <= 0) return safeSend(m.chat, `Cantidad inválida.`, [m.sender])
    if (user.coins < amount) return safeSend(m.chat, `No tenés suficientes fichas.`, [m.sender])

    const receptor = ensureUser(target)
    const tax = Math.floor(amount * 0.02)
    const final = amount - tax
    user.coins -= amount
    receptor.coins += final

    pushHistory(who, `Envió ${amount} a ${target}`)
    pushHistory(target, `Recibió ${final} de ${short}`)

    return safeSend(m.chat,
`${MONEY} *Transferencia exitosa*  
${LINE}
📤 *De:* @${short}  
📥 *A:* @${target.split('@')[0]}  
💸 *Monto:* ${format(amount)}  
💰 *Comisión:* ${format(tax)} (2%)  
🏦 *Recibido:* ${format(final)}  
${LINE}
El Don aprueba la transacción.`, [m.sender, target])
  }

  // -------------------- APUESTA --------------------
  if (command === 'apuesta') {
    if (!args[0]) return safeSend(m.chat, `Uso: ${usedPrefix}apuesta <cantidad o %>`, [m.sender])
    let amount = 0
    const arg = args[0].trim()
    if (arg.endsWith('%')) {
      const perc = parseFloat(arg.replace('%',''))
      amount = Math.floor(user.coins * (perc / 100))
    } else amount = parseInt(arg)
    if (isNaN(amount) || amount <= 0) return safeSend(m.chat, `Cantidad inválida.`, [m.sender])
    if (user.coins < amount) return safeSend(m.chat, `No tenés fichas suficientes.`, [m.sender])
    const win = Math.random() < (owners.includes(short) ? 0.85 : 0.5)
    if (win) {
      const gain = amount - Math.floor(amount * 0.05)
      user.coins += gain
      pushHistory(who, `Apuesta ganada +${gain}`)
      return safeSend(m.chat, `🎲 *Apuesta ganada!*  
${LINE}
@${short} gana ${format(gain)} ${CURRENCY}.  
“El Don brinda por tu suerte.”`, [m.sender])
    } else {
      user.coins -= amount
      pushHistory(who, `Apuesta perdida -${amount}`)
      return safeSend(m.chat, `🎲 *Apuesta fallida*  
${LINE}
@${short} perdió ${format(amount)} ${CURRENCY}.  
“El azar no perdona.”`, [m.sender])
    }
  }

  // -------------------- RULETA --------------------
  if (command === 'ruleta') {
    if (!args[0]) return safeSend(m.chat, `Uso: ${usedPrefix}ruleta <cantidad>`, [m.sender])
    const amount = parseInt(args[0])
    if (isNaN(amount) || amount <= 0) return safeSend(m.chat, `Cantidad inválida.`, [m.sender])
    if (user.coins < amount) return safeSend(m.chat, `No tenés fichas suficientes.`, [m.sender])
    const win = Math.random() < (owners.includes(short) ? 0.85 : 0.5)
    if (win) {
      user.coins += amount
      pushHistory(who, `Ruleta ganada +${amount}`)
      return safeSend(m.chat, `🎯 *Ruleta ganada!*  
${LINE}
@${short} duplica su apuesta.  
“La fortuna te guiña el ojo.”`, [m.sender])
    } else {
      user.coins -= amount
      pushHistory(who, `Ruleta perdida -${amount}`)
      return safeSend(m.chat, `❌ *Ruleta perdida*  
${LINE}
@${short} perdió ${format(amount)} ${CURRENCY}.`, [m.sender])
    }
  }

  // -------------------- SLOTS --------------------
  if (command === 'slots') {
    const symbols = ['🍒','🍋','🍉','💎','7️⃣','⭐']
    const roll = Array(3).fill().map(() => symbols[Math.floor(Math.random()*symbols.length)])
    const win = Math.random() < (owners.includes(short) ? 0.8 : 0.4)
    if (win) {
      user.coins += 120
      pushHistory(who, `Slots ganada +120`)
      return safeSend(m.chat, `🎰 ${roll.join(' ')}  
${LINE}
@${short} gana +120 ${CURRENCY}!  
“El Don te aplaude desde su mesa.”`, [m.sender])
    } else {
      user.coins -= 30
      pushHistory(who, `Slots perdida -30`)
      return safeSend(m.chat, `🎰 ${roll.join(' ')}  
${LINE}
@${short}, esta vez la suerte te dio la espalda.`, [m.sender])
    }
  }

  // -------------------- HISTORY --------------------
  if (command === 'history') {
    if (!user.history.length) return safeSend(m.chat, `📜 Sin movimientos todavía.`, [m.sender])
    return safeSend(m.chat,
`🗂️ *Historial de @${short}*  
${LINE}
${user.history.slice(0,10).join('\n')}
${LINE}
“El pasado del jugador revela su destino.”`, [m.sender])
  }
}

handler.help = ['mafioso','menucasino','saldo','daily','depositar','sacar','transferir','apuesta','ruleta','slots','robar','history']
handler.tags = ['casino']
handler.command = /^(mafioso|menucasino|saldo|daily|depositar|sacar|transferir|apuesta|ruleta|slots|robar|rob|history)$/i
export default handler
