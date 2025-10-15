/* plugins/_coins_mafia_final.js
   CUARTEL MAFIA — Mafia Italiana (Versión OG Mejorada)
   - Estilo: Modo Mafia (italiana, fría, elegante)
   - Toggle: .mecoins (solo owners)
   - Menú: .menucoins
   - Juegos: apuesta, flip, dados, escuadron, minar
   - Economía: saldo, daily (aplica interés a deuda), topcoins, history
   - Inventario y mercado: inventario, mercado, comprar, vender
   - Nuevos: .mafia (perfil), .contrabando (caja misteriosa)
   - Impuesto 2% a ganancias -> Fondo Mafia (global.db.data.mafiaFund)
   - Mensajes globales si ganás > GLOBAL_ANNOUNCE_THRESHOLD
   - Moneda: MafiaCoins
   - Menciones con ${who.split("@")[0]} y sin citar mensajes
*/

let handler = async (m, { conn, args = [], usedPrefix = '.', command = '' }) => {
  const owners = ['59896026646','59898719147']
  const who = m.sender
  const short = who.split('@')[0]

  // ---------- DB ----------
  if (!global.db) global.db = { data: {} }
  if (!global.db.data.menuCoins) global.db.data.menuCoins = { active: true }
  if (!global.db.data.users) global.db.data.users = {}
  if (!global.db.data.market) global.db.data.market = [
    { name: "Granada", price: 200, desc: "+30% dados" },
    { name: "Botiquin", price: 150, desc: "Quita deuda (1 uso)" },
    { name: "Armadura", price: 450, desc: "Reduce pérdidas en apuestas" },
    { name: "Municion", price: 120, desc: "+20% escuadrón" },
    { name: "Mochila", price: 300, desc: "+10 slots inventario" },
    { name: "C4", price: 800, desc: "Objeto raro (sin robar funcionalidad)" }
  ]
  if (global.db.data.mafiaFund === undefined) global.db.data.mafiaFund = 0

  if (!global.db.data.users[who]) global.db.data.users[who] = {
    coins: 500,
    lastDaily: 0,
    history: [],
    inventory: [], // { name, amount }
    respect: 0 // valor para rangos
  }

  const user = global.db.data.users[who]
  const menuState = global.db.data.menuCoins
  const market = global.db.data.market

  // ---------- CONFIG ----------
  const CURRENCY = 'MafiaCoins'
  const DAILY_REWARD = 50
  const DAILY_COOLDOWN = 24 * 60 * 60 * 1000
  const WIN_PROB = 0.60
  const DEBT_LIMIT = -100
  const DEBT_INTEREST_RATE = 0.05 // 5% de la deuda se añade en cada daily si estás negativo
  const TAX_RATE = 0.02 // 2% va al Fondo Mafia
  const GLOBAL_ANNOUNCE_THRESHOLD = 2000 // anuncio global si gana > threshold

  // ---------- UNICODE MARKERS ----------
  const B = '\u{2022}' // bullet
  const ALERT = '\u{1F6A8}' // 🚨
  const MAF = '\u{1F512}' // 🔒
  const COIN = '\u{1F4B0}' // 💰
  const DICE = '\u{1F3B2}' // 🎲
  const SKULL = '\u{1F480}' // 💀
  const BOX = '\u{1F4E6}' // 📦

  // ---------- HELPERS ----------
  const send = async (text) => {
    try {
      await conn.sendMessage(m.chat, { text, mentions: [who] })
    } catch (e) {
      try { await m.reply(text) } catch (err) { console.error('send err', err) }
    }
  }

  const pushHistory = (s) => {
    user.history.unshift(s)
    if (user.history.length > 20) user.history.pop()
  }

  const findMarketItem = (name) => market.find(i => i.name.toLowerCase() === name.toLowerCase())

  const format = (n) => `${n} ${CURRENCY}`

  const getRank = (coins) => {
    if (coins < 0) return 'Pordiosero'
    if (coins < 500) return 'Soldado'
    if (coins < 2000) return 'Sicario'
    if (coins < 5000) return 'Capo'
    return 'Jefe'
  }

  const announceGlobal = async (txt) => {
    // envia al mismo chat; si querés global across groups, habría que iterar chats (no hacemos eso aquí)
    try { await conn.sendMessage(m.chat, { text: `${ALERT} ${txt}` }) } catch (e) { console.error(e) }
  }

  // ---------- OWNER: toggle ----------
  if (command.toLowerCase() === 'mecoins') {
    if (!owners.includes(short)) return m.reply(`${SKULL} @${short} — Acceso denegado (solo owner).`)
    menuState.active = !menuState.active
    const msg = menuState.active
      ? `${ALERT} @${short} — CUARTEL: ABIERTO. Que empiece el negocio.`
      : `${SKULL} @${short} — CUARTEL: CERRADO. Nadie entra ni sale.`
    return send(msg)
  }

  // ---------- MENU ----------
  if (command.toLowerCase() === 'menucoins') {
    if (!menuState.active) return send(`${SKULL} @${short} — El cuartel está cerrado. Owner: .mecoins`)
    const rank = getRank(user.coins)
    const lines = [
      `${MAF} CUARTEL MAFIA — Modo Italiana`,
      ``,
      `${B} Soldado: @${short} | Rango: ${rank} | Saldo: ${format(user.coins)}`,
      ``,
      `⫸ ${B} Estado: .saldo    ⫸ ${B} Daily: .daily (+${DAILY_REWARD})`,
      `⫸ ${B} Apostar: .apuesta <cantidad>  ⫸ ${B} Flip: .flip`,
      `⫸ ${B} Dados: .dados <cantidad>      ⫸ ${B} Escuadrón: .escuadron <monto>`,
      `⫸ ${B} Minar: .minar`,
      ``,
      `⫸ ${B} Inventario: .inventario      ⫸ ${B} Mercado: .mercado`,
      `⫸ ${B} Comprar: .comprar <nombre>    ⫸ ${B} Vender: .vender <nombre>`,
      ``,
      `⫸ ${B} Perfil Mafia: .mafia         ⫸ ${B} Contrabando: .contrabando`,
      `⫸ ${B} Top: .topcoins               ⫸ ${B} History: .history`,
      ``,
      `Owner: usar .mecoins para activar/desactivar`
    ]
    return send(lines.join('\n'))
  }

  // bloquear si off
  const mainCmds = ['saldo','coins','balance','daily','apuesta','bet','flip','topcoins','top','history','dados','minar','escuadron','inventario','mercado','comprar','vender','mafia','contrabando']
  if (!menuState.active && mainCmds.includes(command.toLowerCase())) return send(`${SKULL} @${short} — El sistema está apagado.`)

  // ---------- SALDO ----------
  if (['saldo','coins','balance'].includes(command.toLowerCase())) {
    const rank = getRank(user.coins)
    return send(`${MAF} @${short}\nSaldo: ${format(user.coins)}\nRango: ${rank}`)
  }

  // ---------- FLIP ----------
  if (command.toLowerCase() === 'flip') {
    const outcome = Math.random() < 0.5 ? 'CARA' : 'CRUZ'
    pushHistory(`Flip: ${outcome}`)
    return send(`${DICE} @${short} — Tirada: ${outcome}`)
  }

  // ---------- DAILY (aplica interés de deuda si aplica) ----------
  if (command.toLowerCase() === 'daily') {
    const now = Date.now()
    if (now - (user.lastDaily || 0) < DAILY_COOLDOWN) {
      const remaining = DAILY_COOLDOWN - (now - user.lastDaily)
      const h = Math.floor(remaining / 3600000), m = Math.floor((remaining % 3600000) / 60000)
      return send(`${SKULL} @${short} — Daily reclamado. Vuelve en ${h}h ${m}m`)
    }
    // si está en deuda, aplicar interés
    if (user.coins < 0) {
      const debt = Math.abs(user.coins)
      const interest = Math.ceil(debt * DEBT_INTEREST_RATE)
      user.coins -= interest
      pushHistory(`Interés deuda -${interest}`)
    }
    user.coins += DAILY_REWARD
    user.lastDaily = now
    pushHistory(`+${DAILY_REWARD} Daily`)
    return send(`${MAF} @${short} — Cobras ${format(DAILY_REWARD)}. Saldo: ${format(user.coins)}`)
  }

  // ---------- APUESTA (60% chance). Aplica impuesto 2% sobre ganancias. ----------
  if (['apuesta','bet','moneda'].includes(command.toLowerCase())) {
    if (!args[0]) return send(`${SKULL} @${short} — Uso: ${usedPrefix}apuesta <cantidad>`)
    const amount = parseInt(args[0].toString().replace(/[^0-9]/g, '')) || 0
    if (!amount || amount <= 0) return send(`${SKULL} @${short} — Cantidad inválida.`)
    if (user.coins - amount < DEBT_LIMIT) return send(`${SKULL} @${short} — Límite de deuda alcanzado.`)
    const win = Math.random() < WIN_PROB
    if (win) {
      const gross = amount
      const tax = Math.floor(gross * TAX_RATE)
      const net = gross - tax
      user.coins += net
      global.db.data.mafiaFund += tax
      pushHistory(`Apuesta GANADA +${net} (tax ${tax})`)
      // global announce if big
      if (net > GLOBAL_ANNOUNCE_THRESHOLD) await announceGlobal(`${short} ganó ${format(net)} en apuesta. Respeto.`)
      return send(`${MAF} @${short} — GANASTE +${format(net)} (impuesto ${format(tax)})\nSaldo: ${format(user.coins)}`)
    } else {
      user.coins -= amount
      pushHistory(`Apuesta PERDIDA -${amount}`)
      return send(`${SKULL} @${short} — PERDISTE -${format(amount)}\nSaldo: ${format(user.coins)}`)
    }
  }

  // ---------- DADOS ----------
  if (command.toLowerCase() === 'dados') {
    const amount = parseInt(args[0]) || 0
    if (!amount || amount <= 0) return send(`${SKULL} @${short} — Uso: ${usedPrefix}dados <cantidad>`)
    if (user.coins - amount < DEBT_LIMIT) return send(`${SKULL} @${short} — Límite de deuda alcanzado.`)
    const roll = Math.floor(Math.random() * 6) + 1
    const win = roll >= 4
    if (win) {
      const gross = amount
      const tax = Math.floor(gross * TAX_RATE)
      const net = gross - tax
      user.coins += net
      global.db.data.mafiaFund += tax
      pushHistory(`Dados GANADOS +${net} (roll ${roll})`)
      if (net > GLOBAL_ANNOUNCE_THRESHOLD) await announceGlobal(`${short} ganó ${format(net)} en dados (roll ${roll}). Respeto.`)
      return send(`${DICE} @${short} — Tirada ${roll}. GANASTE +${format(net)} (tax ${format(tax)})\nSaldo: ${format(user.coins)}`)
    } else {
      user.coins -= amount
      pushHistory(`Dados PERDIDOS -${amount} (roll ${roll})`)
      return send(`${SKULL} @${short} — Tirada ${roll}. PERDISTE -${format(amount)}\nSaldo: ${format(user.coins)}`)
    }
  }

  // ---------- ESCUADRON ----------
  if (command.toLowerCase() === 'escuadron') {
    const amount = parseInt(args[0]) || 0
    if (!amount || amount <= 0) return send(`${SKULL} @${short} — Uso: ${usedPrefix}escuadron <monto>`)
    if (user.coins - amount < DEBT_LIMIT) return send(`${SKULL} @${short} — Límite de deuda alcanzado.`)
    const success = Math.random() < 0.5
    if (success) {
      const gross = amount + Math.floor(Math.random() * amount)
      const tax = Math.floor(gross * TAX_RATE)
      const net = gross - tax
      user.coins += net
      global.db.data.mafiaFund += tax
      pushHistory(`Escuadrón +${net}`)
      if (net > GLOBAL_ANNOUNCE_THRESHOLD) await announceGlobal(`${short} arrasó en escuadrón y ganó ${format(net)}. Respeto.`)
      return send(`${MAF} @${short} — Escuadrón triunfó! +${format(net)} (tax ${format(tax)})\nSaldo: ${format(user.coins)}`)
    } else {
      user.coins -= amount
      pushHistory(`Escuadrón -${amount}`)
      return send(`${SKULL} @${short} — Escuadrón falló. -${format(amount)}\nSaldo: ${format(user.coins)}`)
    }
  }

  // ---------- MINAR ----------
  if (command.toLowerCase() === 'minar') {
    const gain = Math.floor(Math.random() * 80) + 10
    user.coins += gain
    pushHistory(`Minado +${gain}`)
    if (gain > GLOBAL_ANNOUNCE_THRESHOLD) await announceGlobal(`${short} minó ${format(gain)}. Botín grande.`)
    return send(`${MAF} @${short} — Minaste ${format(gain)}\nSaldo: ${format(user.coins)}`)
  }

  // ---------- CONTRABANDO (caja misteriosa) ----------
  if (command.toLowerCase() === 'contrabando') {
    const cost = 100
    if (user.coins < cost) return send(`${SKULL} @${short} — Necesitas ${format(cost)} para abrir contrabando.`)
    user.coins -= cost
    const r = Math.random()
    if (r < 0.50) {
      const junk = Math.floor(Math.random() * 50)
      pushHistory(`Contrabando basura +${junk}`)
      user.coins += junk
      return send(`${BOX} @${short} — Contrabando barato: recuperaste ${format(junk)}\nSaldo: ${format(user.coins)}`)
    } else if (r < 0.85) {
      const item = market[Math.floor(Math.random() * market.length)]
      const inv = user.inventory.find(x => x.name === item.name)
      if (inv) inv.amount += 1; else user.inventory.push({ name: item.name, amount: 1 })
      pushHistory(`Contrabando: recibió ${item.name}`)
      return send(`${BOX} @${short} — Contrabando entregó: ${item.name}\nSaldo: ${format(user.coins)}`)
    } else {
      const big = Math.floor(Math.random() * 1000) + 300
      user.coins += big
      pushHistory(`Contrabando fortuna +${big}`)
      if (big > GLOBAL_ANNOUNCE_THRESHOLD) await announceGlobal(`${short} sacó ${format(big)} del contrabando. Respeto.`)
      return send(`${BOX} @${short} — Contrabando SUERTE: +${format(big)}\nSaldo: ${format(user.coins)}`)
    }
  }

  // ---------- MAFIA PROFILE ----------
  if (command.toLowerCase() === 'mafia') {
    const rank = getRank(user.coins)
    const invList = (user.inventory.length === 0) ? 'Ninguno' : user.inventory.map(i => `${i.name} x${i.amount}`).join(', ')
    const lines = [
      `${MAF} PERFIL MAFIA — @${short}`,
      ``,
      `Rango: ${rank}`,
      `Saldo: ${format(user.coins)}`,
      `Respect: ${user.respect || 0}`,
      `Inventario: ${invList}`,
      `Historial (últ.5): ${user.history.slice(0,5).join(' | ')}`
    ]
    return send(lines.join('\n'))
  }

  // ---------- TOPCOINS ----------
  if (['topcoins','top'].includes(command.toLowerCase())) {
    const arr = Object.keys(global.db.data.users).map(jid => ({ jid, coins: global.db.data.users[jid].coins || 0 }))
      .sort((a, b) => b.coins - a.coins).slice(0, 5)
    if (!arr || arr.length === 0) return send(`${MAF} @${short} — Ningún soldado aún.`)
    let txt = `${ALERT} TOP ${CURRENCY} — Top 5\n`
    arr.forEach((u, i) => txt += `${i + 1}) @${u.jid.split('@')[0]} — ${u.coins}\n`)
    return conn.sendMessage(m.chat, { text: txt, mentions: arr.map(u => u.jid) })
  }

  // ---------- HISTORY ----------
  if (command.toLowerCase() === 'history') {
    if (!user.history || user.history.length === 0) return send(`${MAF} @${short} — Sin historial.`)
    let txt = `${MAF} Historial de @${short}\n`
    user.history.slice(0, 10).forEach(h => txt += `${B} ${h}\n`)
    return send(txt)
  }

  // ---------- INVENTARIO ----------
  if (command.toLowerCase() === 'inventario') {
    if (!user.inventory || user.inventory.length === 0) return send(`${MAF} @${short} — Inventario vacío.`)
    let txt = `${MAF} Inventario de @${short}\n`
    user.inventory.forEach(it => txt += `${B} ${it.name} x${it.amount}\n`)
    return send(txt)
  }

  // ---------- MERCADO ----------
  if (command.toLowerCase() === 'mercado') {
    let txt = `${MAF} Mercado Militar — Objetos:\n`
    market.forEach((it, i) => txt += `${i + 1}) ${it.name} — ${it.price} (${it.desc || 'sin efecto'})\n`)
    txt += `\nComprar: ${usedPrefix}comprar <nombre>\nVender: ${usedPrefix}vender <nombre>`
    return send(txt)
  }

  // ---------- COMPRAR ----------
  if (command.toLowerCase() === 'comprar') {
    if (!args[0]) return send(`${SKULL} @${short} — Uso: ${usedPrefix}comprar <nombre>`)
    const name = args.join(' ').trim()
    const item = findMarketItem(name)
    if (!item) return send(`${SKULL} @${short} — Objeto no encontrado.`)
    if (user.coins < item.price) return send(`${SKULL} @${short} — Sin fondos.`)
    user.coins -= item.price
    const inv = user.inventory.find(x => x.name === item.name)
    if (inv) inv.amount += 1; else user.inventory.push({ name: item.name, amount: 1 })
    pushHistory(`Compró ${item.name} -${item.price}`)
    return send(`${MAF} @${short} — Compraste ${item.name} por ${format(item.price)}\nSaldo: ${format(user.coins)}`)
  }

  // ---------- VENDER ----------
  if (command.toLowerCase() === 'vender') {
    if (!args[0]) return send(`${SKULL} @${short} — Uso: ${usedPrefix}vender <nombre>`)
    const name = args.join(' ').trim()
    const invItem = user.inventory.find(x => x.name.toLowerCase() === name.toLowerCase())
    if (!invItem) return send(`${SKULL} @${short} — No tienes ese objeto.`)
    const mItem = findMarketItem(invItem.name)
    const price = Math.floor((mItem ? mItem.price : 0) / 2)
    user.coins += price
    invItem.amount -= 1
    if (invItem.amount <= 0) user.inventory = user.inventory.filter(x => x.amount > 0)
    pushHistory(`Vendió ${invItem.name} +${price}`)
    return send(`${MAF} @${short} — Vendiste ${invItem.name} por ${format(price)}\nSaldo: ${format(user.coins)}`)
  }

  // ---------- FALLBACK ----------
  return send(`${MAF} @${short} — Comando no reconocido. Usa ${usedPrefix}menucoins para ver opciones.`)
}

// EXPORT
handler.help = ['mecoins','menucoins','saldo','daily','apuesta','flip','dados','minar','escuadron','topcoins','history','inventario','mercado','comprar','vender','mafia','contrabando']
handler.tags = ['economy','fun','owner']
handler.command = /^(mecoins|menucoins|saldo|coins|balance|daily|apuesta|bet|flip|dados|minar|escuadron|topcoins|top|history|inventario|mercado|comprar|vender|mafia|contrabando)$/i

export default handler
