// plugins/activity-logger.js
// Guarda los mensajes de todos los usuarios para el radar

if (!global.activityLog) global.activityLog = {};

// Este handler se ejecuta antes de procesar cualquier mensaje
export async function before(m, { conn }) {
    if (!m.isGroup) return true; // solo grupos
    if (!m.sender) return true;

    const chat = m.chat;
    const senderNumber = (m.sender||'').replace(/[^0-9]/g,''); // quita signos y +598

    if (!global.activityLog[chat]) global.activityLog[chat] = { counts: {} };

    // Incrementa el contador
    global.activityLog[chat].counts[senderNumber] = (global.activityLog[chat].counts[senderNumber] || 0) + 1;

    return true;
}
