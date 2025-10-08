// plugins/antitemu.js
// Borra cualquier mensaje que contenga "temu" (o links de Temu) en grupos.
// Por defecto NO elimina mensajes enviados por admins (puedes cambiar esto más abajo).

const temuWordRegex = /temu/i;
const temuUrlRegex = /(https?:\/\/)?(www\.)?(share\.temu\.com\/|temu\.com\/s\/)[^\s]+/i;

function extractTextFromMessage(m) {
  try {
    // Si es ephemeral message, obtener el mensaje interno
    const msg = m.message?.ephemeralMessage?.message || m.message || {};
    // Texto simple
    if (msg.conversation) return msg.conversation;
    // Texto extendido (replies, etc.)
    if (msg.extendedTextMessage?.text) return msg.extendedTextMessage.text;
    // Captions en multimedia
    if (msg.imageMessage?.caption) return msg.imageMessage.caption;
    if (msg.videoMessage?.caption) return msg.videoMessage.caption;
    if (msg.documentMessage?.caption) return msg.documentMessage.caption;
    // Mensajes viewOnce
    if (msg.viewOnceMessage?.message) {
      const v = msg.viewOnceMessage.message;
      if (v.imageMessage?.caption) return v.imageMessage.caption;
      if (v.videoMessage?.caption) return v.videoMessage.caption;
      if (v.documentMessage?.caption) return v.documentMessage.caption;
    }
    // Buttons/list replies (pueden contener texto identificador)
    if (msg.buttonsResponseMessage?.selectedButtonId) return msg.buttonsResponseMessage.selectedButtonId;
    if (msg.listResponseMessage?.singleSelectReply?.selectedRowId) return msg.listResponseMessage.singleSelectReply.selectedRowId;
    // Fallback a m.text si existe (algunos handlers rellenan esto)
    if (typeof m.text === 'string' && m.text.trim()) return m.text;
  } catch (e) {
    // no romper por errores inesperados
    console.error('extractTextFromMessage error', e);
  }
  return '';
}

let handler = async (m, { conn, isAdmin, isBotAdmin }) => {
  // comando .antitemu para togglear
  if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos.');
  if (!isAdmin) return m.reply('❌ Solo administradores pueden activar/desactivar Antitemu.');

  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {};
  let chat = global.db.data.chats[m.chat];

  // por si no existe, inicializar
  if (typeof chat.antitemu === 'undefined') chat.antitemu = false;
  // toggle
  chat.antitemu = !chat.antitemu;
  await global.db.write();

  m.reply(`✅ Antitemu ${chat.antitemu ? '🟢 activado' : '🔴 desactivado'} en este grupo.\n` +
          `⚙️ Actualmente los *admins* ${chat.antitemuIgnoreAdmins ? 'son ignorados' : 'NO son ignorados'} (no se eliminan).`);
};

handler.command = ['antitemu'];
handler.group = true;
handler.admin = true;
// no forzamos handler.botAdmin aquí para que puedas activar aun si bot no es admin
handler.botAdmin = false;

// === detector automático (se ejecuta en cada mensaje entrante) ===
handler.all = async function (m, { conn, isAdmin, isBotAdmin }) {
  try {
    if (!m || !m.isGroup) return true;
    if (!m.message) return true;

    const chat = global.db.data.chats[m.chat] || {};
    if (!chat.antitemu) return true; // filtro desactivado

    // extraer texto/caption de forma robusta
    const text = extractTextFromMessage(m) || '';
    if (!text) return true;

    // detectar "temu" o links de Temu
    const hasTemuWord = temuWordRegex.test(text);
    const hasTemuUrl = temuUrlRegex.test(text);
    if (!hasTemuWord && !hasTemuUrl) return true;

    const senderName = m.pushName || (m.sender || '').split('@')[0];

    // Si queremos ignorar admins (por defecto true), comprobar
    // Puedes cambiar el comportamiento si deseas que también borre admins
    const ignoreAdmins = chat.antitemuIgnoreAdmins !== false; // default true
    if (ignoreAdmins && isAdmin) {
      console.log(`[antitemu] Ignorado (admin): ${senderName} en ${m.chat}`);
      return true;
    }

    // Si el bot no es admin no puede borrar mensajes de otros: avisar una vez
    if (!isBotAdmin) {
      // avisar en el chat (solo si no avisamos antes)
      const warnKey = `antitemuWarned_${m.chat}`;
      if (!global[warnKey]) {
        try {
          await conn.sendMessage(m.chat, { text: '⚠️ No puedo eliminar mensajes: necesito ser administrador del grupo.' });
        } catch (e) { /* ignore */ }
        global[warnKey] = true; // evita spamear avisos
      }
      console.log(`[antitemu] No soy admin, no pude borrar mensaje en ${m.chat}`);
      return true;
    }

    // borrar el mensaje detectado
    try {
      await conn.sendMessage(m.chat, { delete: m.key });
      // opcional: enviar notificación en el chat
      await conn.sendMessage(m.chat, { text: `🧹 Mensaje de *${senderName}* eliminado por contener "temu".` });
      console.log(`[antitemu] Mensaje eliminado en ${m.chat} por ${senderName}: ${text.slice(0,80)}`);
    } catch (err) {
      console.error('[antitemu] Error borrando mensaje:', err);
    }

    return true;
  } catch (e) {
    console.error('antitemu all error', e);
    return true;
  }
};

export default handler;
