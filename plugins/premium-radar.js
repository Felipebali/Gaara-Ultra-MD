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
    const room = global.activityLog[chat];

    const counts = room.counts || {};
    const entries = Object.entries(counts).sort((a,b)=>b[1]-a[1]);
    const topN = entries.slice(0,5); // top 5
    const total = Object.values(counts).reduce((a,b)=>a+b,0);

    // Obtener metadata del grupo
    let participants = [];
    try { 
      const meta = await conn.groupMetadata(chat);
      participants = meta.participants.map(p=>p.id);
    } catch{}

    // Top emisores con nombre y mención
    let topNames = [];
    for (let [user,count] of topN) {
      try { topNames.push({ name: await conn.getName(user), count }); } 
      catch { topNames.push({ name: user, count }); }
    }

    // Usuarios silenciosos (hasta 5)
    let silentIds = participants.filter(u => !(u in counts)).slice(0,5);
    let silentNames = [];
    for (let s of silentIds) {
      try { silentNames.push(await conn.getName(s)); } catch { silentNames.push(s); }
    }

    // Construir reporte
    let report = [];
    report.push("🛰️ *RADAR OMEGA - CONTEO DIARIO* 🛰️");
    report.push(`📡 Grupo: ${chat}`);
    report.push(`📊 Total mensajes registrados: ${total}`);
    report.push("");
    report.push("🏆 Ranking de actividad:");
    if (!topNames.length) report.push("• (sin datos de emisores)");
    else topNames.forEach((t,i)=>{
      report.push(`${i+1}) @${t.name.split("@")[0]} — ${t.count} msg`);
    });
    if (silentNames.length) report.push(`\n🤫 Miembros silenciosos: ${silentNames.map(n=>`@${n.split("@")[0]}`).join(', ')}`);

    await conn.sendMessage(chat, { text: report.join("\n"), mentions: [...topNames.map(t=>t.name), ...silentNames] }, { quoted: null });

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
