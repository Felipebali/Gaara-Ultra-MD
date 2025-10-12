// plugins/radar.js
// Radar de mensajes (contador real) + .radar + .rareset
// Owners (pueden ejecutar comandos): +59898719147, +59896026646

const OWNERS = ['59898719147','59896026646'];

// Estructura global segura
if (!global.activityLog) global.activityLog = {};
if (!global.activityLog._meta) global.activityLog._meta = { created: Date.now() };

// -----------------------------
// before(m) -> se ejecuta antes de procesar cada mensaje
export async function before(m, { conn }) {
  try {
    if (!m || !m.isGroup) return true;           // solo grupos
    if (m.isBaileys && m.fromMe) return true;    // ignorar mensajes propios del bot

    const chat = m.chat;
    const senderJid = (m.sender||'').toString();
    const sender = senderJid.replace(/[^0-9]/g,''); // ej: 59891234567

    if (!global.activityLog[chat]) global.activityLog[chat] = { counts: {}, lastUpdated: Date.now() };

    // Inicializar si no existe
    const room = global.activityLog[chat];

    // Incrementar contador
    room.counts[sender] = (room.counts[sender] || 0) + 1;
    room.lastUpdated = Date.now();

    // opcional: mantener máximo de keys para evitar memory leak (no necesario si reiniciás)
    return true;
  } catch (e) {
    console.error('radar.before error', e);
    return true;
  }
}

// -----------------------------
// Comando .radar -> muestra conteo (ordenado) — solo owners
let handler = async (m, { conn, isOwner }) => {
  try {
    const senderNumber = (m.sender||'').replace(/[^0-9]/g,'');
    const ownerCheck = isOwner || OWNERS.includes(senderNumber);
    if (!ownerCheck) return conn.sendMessage(m.chat, { text: "🚫 ACCESO DENEGADO — Solo owners." }, { quoted: null });
    if (!m.isGroup) return conn.sendMessage(m.chat, { text: "❗ El comando solo funciona en grupos." }, { quoted: null });

    const chat = m.chat;
    const room = global.activityLog[chat] || { counts: {} };

    // Obtener participantes para listar en orden y para mencionar
    let participants = [];
    try {
      const meta = await conn.groupMetadata(chat);
      participants = (meta.participants || []).map(p => p.id);
    } catch (e) {
      // si falla obtener meta, tomamos solo keys de counts
      participants = Object.keys(room.counts).map(id => id + '@s.whatsapp.net');
    }

    // Construir listado combinado: usar participantes (todo el grupo)
    const list = participants.map(jid => {
      const id = jid.replace(/[^0-9]/g,'');
      const count = room.counts[id] || 0;
      return { jid, id, count };
    });

    // Añadir cualquier usuario que haya hablado pero no esté en participants (por si falla meta)
    Object.keys(room.counts || {}).forEach(id => {
      const jid = `${id}@s.whatsapp.net`;
      if (!list.find(x => x.id === id)) list.push({ jid, id, count: room.counts[id] });
    });

    // Ordenar por count descendente
    list.sort((a,b) => b.count - a.count);

    // Si no hay datos, avisar
    const totalMsgs = Object.values(room.counts || {}).reduce((a,b)=>a+b,0);
    if (!list.length || totalMsgs === 0) {
      return conn.sendMessage(chat, { text: '📭 No hay mensajes contabilizados todavía en este grupo.' }, { quoted: null });
    }

    // Construir texto (estilo militar)
    let report = [];
    report.push('🛰️ *RADAR OMEGA - CONTEO DIARIO* 🛰️');
    report.push(`📡 Grupo: ${chat}`);
    report.push(`📊 Total mensajes registrados: ${totalMsgs}`);
    report.push('');
    report.push('🏆 *Ranking de actividad:*');

    // Mostrar todo el grupo (list puede ser grande)
    list.forEach((u, i) => {
      // mostrar posición si tiene >0, sino lo mostramos igual con 0
      const pos = (i < 9) ? `0${i+1}` : `${i+1}`;
      report.push(`${pos}) @${u.id} — ${u.count} msg`);
    });

    // Menciones: todos los jid (para notificar si querés)
    const mentions = list.map(x => x.jid);

    await conn.sendMessage(chat, { text: report.join('\n'), mentions }, { quoted: null });
  } catch (e) {
    console.error('radar.handler error', e);
    try { await conn.sendMessage(m.chat, { text: '⚠️ Error ejecutando .radar.' }, { quoted: null }); } catch {}
  }
};

handler.command = ['radar','scan'];
handler.owner = true;
export default handler;

// -----------------------------
// Comando .rareset -> reinicia conteo (solo owners)
export const resetHandler = async (m, { conn, isOwner }) => {
  try {
    const senderNumber = (m.sender||'').replace(/[^0-9]/g,'');
    const ownerCheck = isOwner || OWNERS.includes(senderNumber);
    if (!ownerCheck) return conn.sendMessage(m.chat, { text: "🚫 ACCESO DENEGADO — Solo owners." }, { quoted: null });
    if (!m.isGroup) return conn.sendMessage(m.chat, { text: "❗ El comando solo funciona en grupos." }, { quoted: null });

    const chat = m.chat;
    global.activityLog[chat] = { counts: {}, lastUpdated: Date.now() };
    await conn.sendMessage(chat, { text: '✅ Conteo de mensajes reiniciado.' }, { quoted: null });
  } catch (e) {
    console.error('radar.resetHandler error', e);
  }
};

resetHandler.command = ['rareset'];
resetHandler.owner = true;
