// plugins/radar.js
// Comando .radar — Omega Militar Elite, todo en uno
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

// Buffer de actividad global por chat
if (!global.activityLog) global.activityLog = {};

let handler = async (m, { conn, isOwner }) => {
  try {
    const senderNumber = (m.sender||'').replace(/[^0-9]/g,'');
    const ownerCheck = isOwner || OWNERS.includes(senderNumber);
    if (!ownerCheck) return conn.sendMessage(m.chat, { text: "🚫 ACCESO DENEGADO — Solo owners." }, { quoted: null });

    if (!m.isGroup) return conn.sendMessage(m.chat, { text: "❗ El comando .radar solo funciona en *grupos*." }, { quoted: null });

    console.log(ANSI.cyan + ANSI.bold + "=== RADAR OMEGA INVOCADO ===" + ANSI.reset);
    console.log(`${ANSI.green}Invocado por:${ANSI.reset} ${senderNumber} - chat: ${m.chat}`);

    // === REGISTRO DE ACTIVIDAD ===
    const chat = m.chat;
    if (!global.activityLog[chat]) {
      global.activityLog[chat] = { messages: [], counts: {}, total: 0, lastSeen: {} };
    }
    const room = global.activityLog[chat];

    const sender = senderNumber;
    room.messages.push({ id: m.key?.id || `${Date.now()}_${Math.random()}`, sender, time: Date.now(), text: m.text || '' });
    room.total = (room.total || 0) + 1;
    room.counts[sender] = (room.counts[sender] || 0) + 1;
    room.lastSeen[sender] = Date.now();

    // Limitar buffer
    if (room.messages.length > 200) {
      const removed = room.messages.shift();
      if (removed && removed.sender && room.counts[removed.sender]) {
        room.counts[removed.sender] = Math.max(0, room.counts[removed.sender] - 1);
      }
    }

    // === ANALISIS RADAR ===
    const counts = room.counts || {};
    const entries = Object.entries(counts).sort((a,b)=>b[1]-a[1]);
    const topN = entries.slice(0,6);
    const total = room.total || 0;

    // Detectar links, menciones y media
    const linkRegex = /(https?:\/\/|wa.me\/|chat\.whatsapp\.com\/)/i;
    let linksCount = 0, mentionsCount = 0, mediaCount = 0;
    room.messages.forEach(x=>{
      if (!x) return;
      if (linkRegex.test(x.text)) linksCount++;
      if (/@\d+/.test(x.text)) mentionsCount++;
      if (x.text === '') mediaCount++;
    });

    // Obtener admins
    let adminsList = [];
    try {
      const meta = await conn.groupMetadata(chat);
      adminsList = (meta.participants||[]).filter(p=>p.isAdmin||p.isSuperAdmin).map(p=>p.id.replace(/[^0-9]/g,''));
    } catch{}

    // Usuarios silenciosos (sin mensajes)
    let silent = [];
    try {
      const meta = await conn.groupMetadata(chat);
      const all = (meta.participants||[]).map(p=>p.id.replace(/[^0-9]/g,''));
      silent = all.filter(u => !(u in counts)).slice(0,6);
    } catch{}

    // === CONSTRUIR REPORTE ===
    let report = [];
    report.push("🛰️ *RADAR OMEGA - REPORTE TÁCTICO* 🛰️");
    report.push(`📊 Mensajes analizados: últimos ${room.messages.length}`);
    report.push(`🔢 Total mensajes registrados: ${total}`);
    report.push("");
    report.push("🏆 Top emisores:");
    if (!topN.length) report.push("• (sin datos de emisores)");
    else topN.forEach(([user,count],i)=>{
      const percent = total ? Math.round((count/total)*100) : 0;
      report.push(`${i+1}) ${user} — ${count} msg (${percent}%)`);
    });
    report.push("");
    report.push(`⚠️ Posible spam (links detectados): ${linksCount}`);
    report.push(`📎 Menciones detectadas: ${mentionsCount}`);
    report.push(`🖼️ Mensajes multimedia: ${mediaCount}`);
    report.push("");
    report.push(`🛡️ Admins: ${adminsList.length ? adminsList.slice(0,6).join(', ') : '(no info)'}`);
    if (silent.length) report.push(`🤫 Miembros silenciosos: ${silent.join(', ')}`);
    report.push("");
    report.push("⚙️ Recomendaciones:");
    report.push("• Revisar top emisores por % de mensajes.");
    report.push("• Activar watchlist si sospechosos.");
    report.push("• Ejecutar 'lockdown' si spam masivo.");

    await conn.sendMessage(chat, { text: report.join("\n") }, { quoted: null });

  } catch (e) {
    console.error(ANSI.red + "Error en plugin .radar:" + ANSI.reset, e);
    try { await conn.sendMessage(m.chat, { text: "⚠️ Error ejecutando .radar." }, { quoted: null }); } catch {}
  }
};

handler.command = ['radar','scan'];
handler.owner = true;

export default handler; 
