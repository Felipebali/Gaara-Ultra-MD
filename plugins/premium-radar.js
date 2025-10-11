// plugins/radar.js
// Comando .radar — Omega Militar Elite con NOMBRES visibles
// Owners: +59898719147, +59896026646

const OWNERS = ['59898719147','59896026646'];

const ANSI = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m"
};

if (!global.activityLog) global.activityLog = {};

let handler = async (m, { conn, isOwner }) => {
  try {
    const senderNumber = (m.sender||'').replace(/[^0-9]/g,'');
    const ownerCheck = isOwner || OWNERS.includes(senderNumber);
    if (!ownerCheck) return conn.sendMessage(m.chat, { text: "🚫 ACCESO DENEGADO — Solo owners." }, { quoted: null });
    if (!m.isGroup) return conn.sendMessage(m.chat, { text: "❗ El comando .radar solo funciona en *grupos*." }, { quoted: null });

    const chat = m.chat;
    if (!global.activityLog[chat]) global.activityLog[chat] = { messages: [], counts: {}, total: 0, lastSeen: {} };
    const room = global.activityLog[chat];

    // === Registrar mensaje actual ===
    const sender = senderNumber;
    room.messages.push({ id: m.key?.id || `${Date.now()}_${Math.random()}`, sender, time: Date.now(), text: m.text || '' });
    room.total = (room.total || 0) + 1;
    room.counts[sender] = (room.counts[sender] || 0) + 1;
    room.lastSeen[sender] = Date.now();
    if (room.messages.length > 200) {
      const removed = room.messages.shift();
      if (removed && removed.sender && room.counts[removed.sender]) room.counts[removed.sender] = Math.max(0, room.counts[removed.sender]-1);
    }

    // === Analizar actividad ===
    const counts = room.counts || {};
    const entries = Object.entries(counts).sort((a,b)=>b[1]-a[1]);
    const topN = entries.slice(0,6);
    const total = room.total || 0;

    const linkRegex = /(https?:\/\/|wa.me\/|chat\.whatsapp\.com\/)/i;
    let linksCount = 0, mentionsCount = 0, mediaCount = 0;
    room.messages.forEach(x=>{
      if (!x) return;
      if (linkRegex.test(x.text)) linksCount++;
      if (/@\d+/.test(x.text)) mentionsCount++;
      if (x.text === '') mediaCount++;
    });

    // Obtener metadata del grupo
    let participants = [];
    try { 
      const meta = await conn.groupMetadata(chat);
      participants = meta.participants || [];
    } catch{}

    // Admins con nombre
    let adminsList = participants.filter(p=>p.isAdmin||p.isSuperAdmin).map(p=>p.id);
    let adminsNames = [];
    for (let a of adminsList) {
      try { adminsNames.push(await conn.getName(a)) } catch{ adminsNames.push(a) }
    }

    // Usuarios silenciosos con nombre
    let allUsers = participants.map(p=>p.id);
    let silentIds = allUsers.filter(u => !(u in counts)).slice(0,6);
    let silentNames = [];
    for (let s of silentIds) {
      try { silentNames.push(await conn.getName(s)) } catch{ silentNames.push(s) }
    }

    // Top emisores con nombre
    let topNames = [];
    for (let [user,count] of topN) {
      try { topNames.push({name: await conn.getName(user), count}) } catch{ topNames.push({name:user, count}) }
    }

    // === Construir reporte ===
    let report = [];
    report.push("🛰️ *RADAR OMEGA - REPORTE TÁCTICO* 🛰️");
    report.push(`📊 Mensajes analizados: últimos ${room.messages.length}`);
    report.push(`🔢 Total mensajes registrados: ${total}`);
    report.push("");
    report.push("🏆 Top emisores:");
    if (!topNames.length) report.push("• (sin datos de emisores)");
    else topNames.forEach((t,i)=>{
      const percent = total ? Math.round((t.count/total)*100) : 0;
      report.push(`${i+1}) ${t.name} — ${t.count} msg (${percent}%)`);
    });
    report.push("");
    report.push(`⚠️ Posible spam (links detectados): ${linksCount}`);
    report.push(`📎 Menciones detectadas: ${mentionsCount}`);
    report.push(`🖼️ Mensajes multimedia: ${mediaCount}`);
    report.push("");
    report.push(`🛡️ Admins: ${adminsNames.length ? adminsNames.join(', ') : '(no info)'}`);
    if (silentNames.length) report.push(`🤫 Miembros silenciosos: ${silentNames.join(', ')}`);
    report.push("");
    report.push("⚙️ Recomendaciones:");
    report.push("• Revisar top emisores por % de mensajes.");
    report.push("• Activar watchlist si sospechosos.");
    report.push("• Ejecutar 'lockdown' si spam masivo.");

    await conn.sendMessage(chat, { text: report.join("\n") }, { quoted: null });

  } catch(e) {
    console.error(ANSI.red + "Error en plugin .radar:" + ANSI.reset, e);
    try { await conn.sendMessage(m.chat, { text: "⚠️ Error ejecutando .radar." }, { quoted: null }); } catch{}
  }
};

handler.command = ['radar','scan'];
handler.owner = true;
export default handler;
