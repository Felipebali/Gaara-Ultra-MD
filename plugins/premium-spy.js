// plugins/spy.js
// Comando .spy @usuario — Análisis táctico individual
// Solo owners +59898719147, +59896026646

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

let handler = async (m, { conn, isOwner, text }) => {
  try {
    const senderNumber = (m.sender||'').replace(/[^0-9]/g,'');
    const ownerCheck = isOwner || OWNERS.includes(senderNumber);
    if (!ownerCheck) return conn.sendMessage(m.chat, { text: "🚫 ACCESO DENEGADO — Solo owners." }, { quoted: null });
    if (!m.isGroup) return conn.sendMessage(m.chat, { text: "❗ .spy solo funciona en grupos." }, { quoted: null });

    // Validar que haya un usuario mencionado en el comando
    let target = text ? text.replace(/[^0-9]/g,'') : null;
    if (!target) return conn.sendMessage(m.chat, { text: "❗ Uso: .spy @usuario" }, { quoted: null });

    // Preparar buffer de mensajes del chat
    const chat = m.chat;
    if (!global.activityLog[chat]) global.activityLog[chat] = { messages: [], counts: {}, total: 0, lastSeen: {} };
    const room = global.activityLog[chat];

    const targetMsgs = room.messages.filter(msg => msg.sender === target);

    if (!targetMsgs.length) return conn.sendMessage(m.chat, { text: "ℹ️ No hay actividad registrada de este usuario." }, { quoted: null });

    const totalGroupMsgs = room.total || 1; // prevenir división por 0
    const percent = Math.round((targetMsgs.length / totalGroupMsgs) * 100);

    // Contadores de links, multimedia y menciones
    const linkRegex = /(https?:\/\/|wa.me\/|chat\.whatsapp\.com\/)/i;
    let linksCount = 0, mentionsCount = 0, mediaCount = 0;
    targetMsgs.forEach(x=>{
      if (!x) return;
      if (linkRegex.test(x.text)) linksCount++;
      if (/@\d+/.test(x.text)) mentionsCount++;
      if (x.text === '') mediaCount++;
    });

    // Obtener nombre del usuario
    let name;
    try { name = await conn.getName(target) } catch{ name = target }

    // Construir reporte táctico
    let report = [];
    report.push("🕵️‍♂️ *SPY - REPORTE INDIVIDUAL* 🕵️‍♂️");
    report.push(`👤 Usuario analizado: ${name}`);
    report.push(`📊 Mensajes enviados: ${targetMsgs.length} (${percent}% del grupo)`);
    report.push("");
    report.push("⚠️ Actividad detectada:");
    report.push(`• Links enviados: ${linksCount}`);
    report.push(`• Menciones enviadas: ${mentionsCount}`);
    report.push(`• Mensajes multimedia: ${mediaCount}`);
    report.push("");
    report.push("📝 Últimos mensajes:");
    targetMsgs.slice(-6).forEach((x,i)=>{
      let time = new Date(x.time).toLocaleTimeString();
      report.push(`${i+1}) [${time}] ${x.text || '(media)'}`);
    });
    report.push("");
    report.push("⚙️ Recomendaciones:");
    report.push("• Revisar links enviados si hay spam.");
    report.push("• Vigilar menciones frecuentes.");
    report.push("• Usar watchlist si es sospechoso.");

    await conn.sendMessage(chat, { text: report.join("\n") }, { quoted: null });

  } catch (e) {
    console.error(ANSI.red + "Error en plugin .spy:" + ANSI.reset, e);
    try { await conn.sendMessage(m.chat, { text: "⚠️ Error ejecutando .spy." }, { quoted: null }); } catch {}
  }
};

handler.command = ['spy'];
handler.owner = true;
export default handler;
