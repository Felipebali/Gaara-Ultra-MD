// plugins/radar.js
// Radar de mensajes con menciones
// Owners: +59898719147, +59896026646

const OWNERS = ['59898719147','59896026646'];

if (!global.activityLog) global.activityLog = {};

let handler = async (m, { conn, isOwner }) => {
  try {
    const senderNumber = (m.sender||'').replace(/[^0-9]/g,'');
    const ownerCheck = isOwner || OWNERS.includes(senderNumber);
    if (!ownerCheck) return conn.sendMessage(m.chat, { text: "🚫 ACCESO DENEGADO — Solo owners." }, { quoted: null });
    if (!m.isGroup) return conn.sendMessage(m.chat, { text: "❗ El comando solo funciona en grupos." }, { quoted: null });

    const chat = m.chat;
    if (!global.activityLog[chat]) global.activityLog[chat] = { counts: {} };
    const room = global.activityLog[chat];

    // Contar mensaje del usuario
    room.counts[senderNumber] = (room.counts[senderNumber] || 0) + 1;

    // Obtener todos los participantes
    let participants = [];
    try { 
      const meta = await conn.groupMetadata(chat);
      participants = meta.participants || [];
    } catch{}

    // Construir reporte
    let report = [];
    report.push("🛰️ *RADAR OMEGA - CONTEO DE MENSAJES* 🛰️");
    report.push("");

    // Top emisores (todos)
    report.push("📊 Mensajes por usuario:");
    for (let p of participants) {
      const id = p.id.replace(/[^0-9]/g,'');
      const count = room.counts[id] || 0;
      report.push(`• @${id} — ${count} msg`);
    }

    await conn.sendMessage(chat, { text: report.join("\n"), mentions: participants.map(p => p.id) }, { quoted: null });

  } catch(e) {
    console.error("Error en plugin .radar:", e);
    try { await conn.sendMessage(m.chat, { text: "⚠️ Error ejecutando .radar." }, { quoted: null }); } catch{}
  }
};

handler.command = ['radar','scan'];
handler.owner = true;
export default handler;

// -----------------------------
// Comando .rareset — reinicia conteo
let resetHandler = async (m, { conn, isOwner }) => {
  const senderNumber = (m.sender||'').replace(/[^0-9]/g,'');
  const ownerCheck = isOwner || OWNERS.includes(senderNumber);
  if (!ownerCheck) return conn.sendMessage(m.chat, { text: "🚫 ACCESO DENEGADO — Solo owners." }, { quoted: null });
  if (!m.isGroup) return conn.sendMessage(m.chat, { text: "❗ El comando solo funciona en grupos." }, { quoted: null });

  const chat = m.chat;
  global.activityLog[chat] = { counts: {} };
  await conn.sendMessage(chat, { text: "✅ Conteo de mensajes reiniciado." }, { quoted: null });
};

resetHandler.command = ['rareset'];
resetHandler.owner = true;
export { resetHandler };
