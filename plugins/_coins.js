/* plugins/_coins.js
   Cuartel Mafia - Sistema de monedas "MafiaCoins"
   - Estilo: Modo Mafia (seca, directa)
   - Toggle: .mecoins (solo owners)
   - Menú: .menucoins
   - Juegos: apuesta, flip, dados, minar, escuadron
   - Economía: saldo, daily, topcoins, history
   - Inventario y mercado: inventario, mercado, comprar, vender
   - Menciones con ${who.split("@")[0]} y sin citar mensajes
   - Moneda: MafiaCoins
*/

let handler = async (m, { conn, args = [], usedPrefix = '.', command = '' }) => {
  const owners = ['59896026646','59898719147'];
  const who = m.sender;
  const short = who.split('@')[0];

  // ---------- DB ----------
  if (!global.db) global.db = { data: {} };
  if (!global.db.data.menuCoins) global.db.data.menuCoins = { active: true };
  if (!global.db.data.users) global.db.data.users = {};
  if (!global.db.data.market) global.db.data.market = [
    { name: "Granada", price: 200, desc: "+10% dados" },
    { name: "Botiquin", price: 100, desc: "+10% recuperación" },
    { name: "Armadura", price: 500, desc: "Reduce pérdidas" },
    { name: "Municion", price: 50, desc: "Aumenta chance combate" }
  ];

  if (!global.db.data.users[who]) global.db.data.users[who] = {
    coins: 500,
    lastDaily: 0,
    history: [],
    inventory: [] // { name, amount }
  };

  const user = global.db.data.users[who];
  const menuState = global.db.data.menuCoins;
  const market = global.db.data.market;

  // ---------- CONFIG ----------
  const CURRENCY_NAME = 'MafiaCoins';
  const DAILY_REWARD = 50;
  const DAILY_COOLDOWN = 24 * 60 * 60 * 1000;
  const WIN_PROB = 0.6;
  const DEBT_LIMIT = -100;

  // Mafia-style markers (Unicode escapes to avoid parser issues)
  const S_BULLET = '•';
  const S_ALERT = '\u{1F6A8}'; // 🚨
  const S_MAF = '\u{1F512}'; // 🔒 (mafia lock vibe)
  const S_COIN = '\u{1F4B0}'; // 💰
  const S_DICE = '\u{1F3B2}'; // 🎲 (escaped)
  const S_SKULL = '\u{1F480}'; // 💀

  // Safe send (mentions user only)
  const send = async (text) => {
    try {
      await conn.sendMessage(m.chat, { text, mentions: [who] });
    } catch (e) {
      try { await m.reply(text) } catch (err) { console.error('send err', err) }
    }
  };

  // Small helpers
  const pushHistory = (entry) => {
    user.history.unshift(entry);
    if (user.history.length > 10) user.history.pop();
  };

  const findMarketItem = (name) => market.find(i => i.name.toLowerCase() === name.toLowerCase());

  const formatMoney = (n) => `${n} ${CURRENCY_NAME}`;

  // ---------- OWNER TOGGLE ----------
  if (command.toLowerCase() === 'mecoins') {
    if (!owners.includes(short)) return m.reply(`${S_SKULL} @${short} — Acceso denegado. Sólo owner.`);
    menuState.active = !menuState.active;
    const msg = menuState.active
      ? `${S_ALERT} @${short} — EL MERCADO HA REABIERTO. Sistema activado.`
      : `${S_SKULL} @${short} — EL MERCADO SE CIERRA. Sistema desactivado.`;
    return send(msg);
  }

  // ---------- MENU ----------
  if (command.toLowerCase() === 'menucoins') {
    if (!menuState.active) return send(`${S_SKULL} @${short} — El cuartel está cerrado. Owner activa con .mecoins`);
    const menu = [
      `${S_MAF} MODO MAFIA — CUARTEL PRINCIPAL`,
      ``,
      `${S_BULLET} Estado: .saldo`,
      `${S_BULLET} Daily: .daily (+${DAILY_REWARD})`,
      `${S_BULLET} Apostar: .apuesta <cantidad> (60% chance)`,
      `${S_BULLET} Flip: .flip`,
      `${S_BULLET} Dados: .dados <cantidad>`,
      `${S_BULLET} Escuadrón: .escuadron <monto>`,
      `${S_BULLET} Minar: .minar`,
      ``,
      `${S_BULLET} Inventario: .inventario`,
      `${S_BULLET} Mercado: .mercado`,
      `${S_BULLET} Comprar: .comprar <objeto>`,
      `${S_BULLET} Vender: .vender <objeto>`,
      ``,
      `${S_BULLET} Top: .topcoins   History: .history`,
      ``,
      `Owner: usar .mecoins para activar/desactivar`
    ].join('\n');
    return send(menu);
  }

  // Block if disabled
  const mainCmds = ['saldo','coins','balance','daily','apuesta','bet','flip','topcoins','top','history','dados','minar','escuadron','inventario','mercado','comprar','vender'];
  if (!menuState.active && mainCmds.includes(command.toLowerCase())) return send(`${S_SKULL} @${short} — El sistema está apagado. Owner: .mecoins`);

  // ---------- COMMANDS ----------

  // SALDO
  if (['saldo','coins','balance'].includes(command.toLowerCase())) {
    return send(`${S_MAF} @${short}\nSaldo actual: ${formatMoney(user.coins)}`);
  }

  // FLIP
  if (command.toLowerCase() === 'flip') {
    const outcome = Math.random() < 0.5 ? 'CARA' : 'CRUZ';
    pushHistory(`Flip: ${outcome}`);
    return send(`${S_DICE} @${short}\nTirada: ${outcome}`);
  }

  // DAILY
  if (command.toLowerCase() === 'daily') {
    const now = Date.now();
    if (now - (user.lastDaily || 0) < DAILY_COOLDOWN) {
      const remaining = DAILY_COOLDOWN - (now - user.lastDaily);
      const h = Math.floor(remaining / 3600000), m = Math.floor((remaining % 3600000) / 60000);
      return send(`${S_SKULL} @${short} — Daily ya reclamado. Vuelve en ${h}h ${m}m.`);
    }
    user.coins += DAILY_REWARD;
    user.lastDaily = now;
    pushHistory(`+${DAILY_REWARD} Daily`);
    return send(`${S_MAF} @${short}\nHas recibido ${formatMoney(DAILY_REWARD)}. Saldo: ${formatMoney(user.coins)}`);
  }

  // APUESTA
  if (['apuesta','bet','moneda'].includes(command.toLowerCase())) {
    if (!args[0]) return send(`${S_SKULL} @${short} — Uso: ${usedPrefix}apuesta <cantidad>`);
    const amount = parseInt(args[0].toString().replace(/[^0-9]/g, '')) || 0;
    if (!amount || amount <= 0) return send(`${S_SKULL} @${short} — Cantidad inválida.`);
    if (user.coins - amount < DEBT_LIMIT) return send(`${S_SKULL} @${short} — Límite de deuda alcanzado.`);
    const win = Math.random() < WIN_PROB;
    if (win) {
      user.coins += amount;
      pushHistory(`+${amount} Apuesta`);
      return send(`${S_MAF} @${short} — GANASTE +${formatMoney(amount)}\nSaldo: ${formatMoney(user.coins)}`);
    } else {
      user.coins -= amount;
      pushHistory(`-${amount} Apuesta`);
      return send(`${S_SKULL} @${short} — PERDISTE -${formatMoney(amount)}\nSaldo: ${formatMoney(user.coins)}`);
    }
  }

  // DADOS (apuesta simple: si roll >= threshold gana)
  if (command.toLowerCase() === 'dados') {
    const amount = parseInt(args[0]) || 0;
    if (!amount || amount <= 0) return send(`${S_SKULL} @${short} — Uso: ${usedPrefix}dados <cantidad>`);
    if (user.coins - amount < DEBT_LIMIT) return send(`${S_SKULL} @${short} — Límite de deuda alcanzado.`);
    const roll = Math.floor(Math.random() * 6) + 1;
    const win = roll >= 4; // 4,5,6 gana
    if (win) {
      user.coins += amount;
      pushHistory(`+${amount} Dados (${roll})`);
      return send(`${S_DICE} @${short} — Tirada: ${roll}. GANASTE +${formatMoney(amount)}\nSaldo: ${formatMoney(user.coins)}`);
    } else {
      user.coins -= amount;
      pushHistory(`-${amount} Dados (${roll})`);
      return send(`${S_SKULL} @${short} — Tirada: ${roll}. PERDISTE -${formatMoney(amount)}\nSaldo: ${formatMoney(user.coins)}`);
    }
  }

  // ESCUADRON (riesgo fijo, recompensa aleatoria)
  if (command.toLowerCase() === 'escuadron') {
    const amount = parseInt(args[0]) || 0;
    if (!amount || amount <= 0) return send(`${S_SKULL} @${short} — Uso: ${usedPrefix}escuadron <monto>`);
    if (user.coins - amount < DEBT_LIMIT) return send(`${S_SKULL} @${short} — Límite de deuda alcanzado.`);
    const success = Math.random() < 0.5;
    if (success) {
      const gain = amount + Math.floor(Math.random() * amount);
      user.coins += gain;
      pushHistory(`Escuadrón +${gain}`);
      return send(`${S_MAF} @${short} — Escuadrón triunfó! +${formatMoney(gain)}\nSaldo: ${formatMoney(user.coins)}`);
    } else {
      user.coins -= amount;
      pushHistory(`Escuadrón -${amount}`);
      return send(`${S_SKULL} @${short} — Escuadrón falló. -${formatMoney(amount)}\nSaldo: ${formatMoney(user.coins)}`);
    }
  }

  // MINAR (recompensa aleatoria, sin apuesta)
  if (command.toLowerCase() === 'minar' || command.toLowerCase() === 'minar') {
    const gain = Math.floor(Math.random() * 50) + 10;
    user.coins += gain;
    pushHistory(`Minado +${gain}`);
    return send(`${S_MAF} @${short} — Minaste ${formatMoney(gain)}\nSaldo: ${formatMoney(user.coins)}`);
  }

  // TOPCOINS
  if (['topcoins','top'].includes(command.toLowerCase())) {
    const users = Object.keys(global.db.data.users || {}).map(jid => ({ jid, coins: global.db.data.users[jid].coins || 0 }))
      .sort((a, b) => b.coins - a.coins).slice(0, 5);
    if (!users || users.length === 0) return send(`${S_MAF} @${short} — No hay soldados aún.`);
    let txt = `${S_ALERT} TOP ${CURRENCY_NAME} — Top 5\n`;
    users.forEach((u, i) => txt += `${i+1}) @${u.jid.split('@')[0]} — ${u.coins}\n`);
    return conn.sendMessage(m.chat, { text: txt, mentions: users.map(u => u.jid) });
  }

  // HISTORY
  if (command.toLowerCase() === 'history') {
    if (!user.history || user.history.length === 0) return send(`${S_MAF} @${short} — No hay jugadas recientes.`);
    let txt = `${S_MAF} Historial de @${short}\n`;
    user.history.slice(0, 10).forEach(h => txt += `${S_BULLET} ${h}\n`);
    return send(txt);
  }

  // INVENTARIO
  if (command.toLowerCase() === 'inventario') {
    if (!user.inventory || user.inventory.length === 0) return send(`${S_MAF} @${short} — Inventario vacío.`);
    let txt = `${S_MAF} Inventario de @${short}\n`;
    user.inventory.forEach(it => txt += `${S_BULLET} ${it.name} x${it.amount}\n`);
    return send(txt);
  }

  // MERCADO
  if (command.toLowerCase() === 'mercado') {
    let txt = `${S_MAF} Mercado Militar — Objetos disponibles:\n`;
    market.forEach((it, i) => txt += `${i+1}) ${it.name} — ${it.price} (${it.desc || 'sin efecto'})\n`);
    txt += `\nComprar: ${usedPrefix}comprar <nombre>\nVender: ${usedPrefix}vender <nombre>`;
    return send(txt);
  }

  // COMPRAR
  if (command.toLowerCase() === 'comprar') {
    if (!args[0]) return send(`${S_SKULL} @${short} — Uso: ${usedPrefix}comprar <nombre objeto>`);
    const itemName = args.join(' ').trim();
    const item = findMarketItem(itemName);
    if (!item) return send(`${S_SKULL} @${short} — Objeto no encontrado.`);
    if (user.coins < item.price) return send(`${S_SKULL} @${short} — No tienes suficientes ${CURRENCY_NAME}.`);
    user.coins -= item.price;
    const inv = user.inventory.find(x => x.name === item.name);
    if (inv) inv.amount += 1; else user.inventory.push({ name: item.name, amount: 1 });
    pushHistory(`Compró ${item.name} -${item.price}`);
    return send(`${S_MAF} @${short} — Compraste ${item.name} por ${formatMoney(item.price)}\nSaldo: ${formatMoney(user.coins)}`);
  }

  // VENDER
  if (command.toLowerCase() === 'vender') {
    if (!args[0]) return send(`${S_SKULL} @${short} — Uso: ${usedPrefix}vender <nombre objeto>`);
    const itemName = args.join(' ').trim();
    const invItem = user.inventory.find(x => x.name.toLowerCase() === itemName.toLowerCase());
    if (!invItem) return send(`${S_SKULL} @${short} — No tienes ese objeto.`);
    const marketItem = findMarketItem(invItem.name);
    const sellPrice = Math.floor((marketItem ? marketItem.price : 0) / 2);
    user.coins += sellPrice;
    invItem.amount -= 1;
    if (invItem.amount <= 0) user.inventory = user.inventory.filter(x => x.amount > 0);
    pushHistory(`Vendió ${invItem.name} +${sellPrice}`);
    return send(`${S_MAF} @${short} — Vendiste ${invItem.name} por ${formatMoney(sellPrice)}\nSaldo: ${formatMoney(user.coins)}`);
  }

  // default fallback
  return send(`${S_MAF} @${short} — Comando no reconocido. Usa ${usedPrefix}menucoins para ver comandos.`);
};

// EXPORT
handler.help = ['mecoins','menucoins','saldo','daily','apuesta','flip','dados','minar','escuadron','topcoins','history','inventario','mercado','comprar','vender'];
handler.tags = ['economy','fun','owner'];
handler.command = /^(mecoins|menucoins|saldo|coins|balance|daily|apuesta|bet|flip|dados|minar|escuadron|topcoins|top|history|inventario|mercado|comprar|vender)$/i;

export default handler;
