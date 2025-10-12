// plugins/radar.js
// Radar Omega - Conteo de mensajes con menciones
// Owners: +59898719147, +59896026646

const OWNERS = ['59898719147','59896026646'];

if (!global.activityLog) global.activityLog = {};

let handler = async (m, { conn, isOwner }) => {
  try {
    const senderNumber = (m.sender||'').replace(/[^0-9]/g,'');
    const ownerCheck = isOwner || OWNERS.includes(senderNumber);
    if (!ownerCheck) return conn.sendMessage(m.chat, { text: "🚫 ACCESO DENEGADO — Solo owners." }, { quoted: null });
    if (!m.isGroup) return conn.sendMessage(m.chat, { text: "❗ El comando .radar solo funciona en *grupos*." }, { quoted: null });

    const chat = m.chat;
    if (!global.activityLog[chat]) global.activityLog[chat] = { counts: {} };
    const counts = global.activityLog[chat].counts;

    const entries = Object.entries(counts).sort((a,b)=>b[1]-a[1]);
    const topN = entries.slice(0,10); // top 10
    const total = Object.values(counts).reduce((a,b)=>a+b,0);

    // Top emisores con mención
    let report = [];
    report.push("🛰️ *RADAR OMEGA - CONTEO DE MENSAJES* 🛰️");
    report.push(`📡 Grupo: ${chat}`);
    report.push(`📊 Total mensajes registrados: ${total}\n`);
    report.push("🏆 Ranking de actividad:");

    if (!topN.length) report.push("• (sin datos de emisores)");
    else topN.forEach(([user,count],i)=>{
      report.push(`${i+1}) @${user.split("@")[0]} — ${count} msg`);
    });

    await conn.sendMessage(chat, { text: report.join("\n"), mentions: topN.map(t=>t[0]) }, { quoted: null });

  } catch(e){
    console.error("Error en .radar:", e);
    try { await conn.sendMessage(m.chat, { text: "⚠️ Error ejecutando .radar." }, { quoted: null }); } catch{}
  }
};

handler.command = ['radar','scan'];
handler.owner = true;

// === Comando para resetear el radar ===
export async function rareset(m, { conn, isOwner }) {
  const senderNumber = (m.sender||'').replace(/[^0-9]/g,'');
  const ownerCheck = isOwner || OWNERS.includes(senderNumber);
  if (!ownerCheck) return conn.sendMessage(m.chat, { text: "🚫 ACCESO DENEGADO — Solo owners." }, { quoted: null });
  if (!m.isGroup) return conn.sendMessage(m.chat, { text: "❗ El comando .rareset solo funciona en grupos." }, { quoted: null });

  const chat = m.chat;
  if (!global.activityLog[chat]) global.activityLog[chat] = { counts: {} };
  global.activityLog[chat].counts = {};
  await conn.sendMessage(chat, { text: "✅ Radar reseteado correctamente." }, { quoted: null });
}

export default handler;
