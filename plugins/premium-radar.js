// plugins/radar.js
// Radar de mensajes + .radar + .rareset
// Owners: +59898719147, +59896026646

const OWNERS = ['59898719147','59896026646'];

if (!global.activityLog) global.activityLog = {};

// -----------------------------
// before(m) -> cuenta mensajes automáticamente
export async function before(m, { conn }) {
  try {
    if (!m || !m.isGroup) return true;
    if (m.isBaileys && m.fromMe) return true;

    const chat = m.chat;
    const sender = (m.sender || '').replace(/[^0-9]/g,'');

    if (!global.activityLog[chat]) global.activityLog[chat] = { counts: {}, lastUpdated: Date.now() };
    const room = global.activityLog[chat];
    room.counts[sender] = (room.counts[sender] || 0) + 1;
    room.lastUpdated = Date.now();

    return true;
  } catch (e) {
    console.error('radar.before error', e);
    return true;
  }
}

// -----------------------------
// Handler principal (radar + rareset)
let handler = async (m, { conn, isOwner }) => {
  try {
    const senderNumber = (m.sender||'').replace(/[^0-9]/g,'');
    const ownerCheck = isOwner || OWNERS.includes(senderNumber);
    if (!ownerCheck) return conn.sendMessage(m.chat, { text: "🚫 ACCESO DENEGADO — Solo owners." }, { quoted: null });
    if (!m.isGroup) return conn.sendMessage(m.chat, { text: "❗ El comando solo funciona en grupos." }, { quoted: null });

    const chat = m.chat;

    // Si es .rareset -> reinicia el conteo
    if (m.text.startsWith('.rareset')) {
      global.activityLog[chat] = { counts: {}, lastUpdated: Date.now() };
      return conn.sendMessage(chat, { text: '✅ Conteo de mensajes reiniciado.' }, { quoted: null });
    }

    // -----------------------------
    // Comando .radar -> mostrar conteo
    const room = global.activityLog[chat] || { counts: {} };
    const totalMsgs = Object.values(room.counts || {}).reduce((a,b)=>a+b,0);
    if (!totalMsgs) return conn.sendMessage(chat, { text: '📭 No hay mensajes contabilizados todavía.' }, { quoted: null });

    // Obtener participantes para mencionar
    let participants = [];
    try {
      const meta = await conn.groupMetadata(chat);
      participants = (meta.participants || []).map(p => p.id);
    } catch (e) {
      participants = Object.keys(room.counts || {}).map(id => id+'@s.whatsapp.net');
    }

    // Construir listado
    const list = participants.map(jid=>{
      const id = jid.replace(/[^0-9]/g,'');
      const count = room.counts[id] || 0;
      return { jid, id, count };
    });

    // Añadir cualquier usuario que haya hablado pero no esté en participantes
    Object.keys(room.counts || {}).forEach(id=>{
      const jid = id+'@s.whatsapp.net';
      if (!list.find(x=>x.id===id)) list.push({ jid, id, count: room.counts[id] });
    });

    // Orden descendente
    list.sort((a,b)=>b.count-a.count);

    // Texto del reporte
    let report = [];
    report.push('🛰️ *RADAR OMEGA - CONTEO DIARIO* 🛰️');
    report.push(`📡 Grupo: ${chat}`);
    report.push(`📊 Total mensajes registrados: ${totalMsgs}`);
    report.push('');
    report.push('🏆 *Ranking de actividad:*');
    list.forEach((u,i)=>{
      const pos = (i<9)?`0${i+1}`:`${i+1}`;
      report.push(`${pos}) @${u.id} — ${u.count} msg`);
    });

    const mentions = list.map(x=>x.jid);
    await conn.sendMessage(chat, { text: report.join('\n'), mentions }, { quoted: null });

  } catch(e) {
    console.error('radar.handler error', e);
    try { await conn.sendMessage(m.chat, { text: '⚠️ Error ejecutando comando.' }, { quoted: null }); } catch {}
  }
};

handler.command = ['radar','scan','rareset'];
handler.owner = true;
export default handler;
