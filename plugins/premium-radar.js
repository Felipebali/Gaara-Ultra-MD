// plugins/radar.js
// Radar de mensajes con menciones y conteo real
// Owners: +59898719147, +59896026646

const OWNERS = ['59898719147','59896026646'];

// Crear la estructura global si no existe
if (!global.activityLog) global.activityLog = {};

// --------------------------
// Este se ejecuta antes de cada mensaje
export async function before(m, { conn }) {
  if (!m.isGroup) return true;

  const chat = m.chat;
  if (!global.activityLog[chat]) global.activityLog[chat] = { counts: {} };

  const senderNumber = (m.sender||'').replace(/[^0-9]/g,'');
  global.activityLog[chat].counts[senderNumber] = (global.activityLog[chat].counts[senderNumber] || 0) + 1;

  return true;
}

// --------------------------
// Comando .radar — muestra el conteo
let handler = async (m, { conn, isOwner }) => {
  const senderNumber = (m.sender||'').replace(/[^0-9]/g,'');
  const ownerCheck = isOwner || OWNERS.includes(senderNumber);
  if (!ownerCheck) return conn.sendMessage(m.chat, { text: "🚫 ACCESO DENEGADO — Solo owners." }, { quoted: null });
  if (!m.isGroup) return conn.sendMessage(m.chat, { text: "❗ El comando solo funciona en grupos." }, { quoted: null });

  const chat = m.chat;
  const room = global.activityLog[chat] || { counts: {} };

  // Obtener participantes
  let participants = [];
  try {
    const meta = await conn.groupMetadata(chat);
    participants = meta.participants || [];
  } catch{}

  // Construir reporte
  let report = [];
  report.push("🛰️ *RADAR OMEGA - CONTEO DE MENSAJES* 🛰️\n");
  for (let p of participants) {
    const id = p.id.replace(/[^0-9]/g,'');
    const count = room.counts[id] || 0;
    report.push(`• @${id} — ${count} msg`);
  }

  await conn.sendMessage(chat, { text: report.join("\n"), mentions: participants.map(p => p.id) }, { quoted: null });
};

handler.command = ['radar','scan'];
handler.owner = true;
export default handler;

// --------------------------
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
