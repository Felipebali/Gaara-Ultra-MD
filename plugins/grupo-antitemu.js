// plugins/antitemu.js
let handler = async (m, { conn }) => {
  if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos.');

  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {};
  let chat = global.db.data.chats[m.chat];
  chat.antitemu = !chat.antitemu;

  await m.reply(`✅ *Antitemu* ha sido ${chat.antitemu ? '🟢 activado' : '🔴 desactivado'} en este grupo.`);
};

handler.command = ['antitemu'];
handler.admin = true;
handler.group = true;
export default handler;

// === DETECTOR UNIVERSAL DE "temu" ===
export async function all(m, { conn, isBotAdmin }) {
  try {
    if (!m.isGroup) return;
    const chat = global.db.data.chats[m.chat];
    if (!chat?.antitemu) return;
    if (!isBotAdmin) return;

    // Captura absolutamente todos los posibles tipos de texto
    let text = '';
    if (typeof m.text === 'string') text = m.text;
    else if (m.message?.conversation) text = m.message.conversation;
    else if (m.message?.extendedTextMessage?.text) text = m.message.extendedTextMessage.text;
    else if (m.message?.imageMessage?.caption) text = m.message.imageMessage.caption;
    else if (m.message?.videoMessage?.caption) text = m.message.videoMessage.caption;
    else if (m.message?.buttonsResponseMessage?.selectedButtonId) text = m.message.buttonsResponseMessage.selectedButtonId;
    else if (m.message?.listResponseMessage?.singleSelectReply?.selectedRowId) text = m.message.listResponseMessage.singleSelectReply.selectedRowId;

    text = (text || '').toLowerCase();

    // Mostrar lo que detecta (para confirmar)
    if (text) console.log(`[ANTITEMU DEBUG] Texto detectado: ${text}`);

    if (text.includes('temu')) {
      console.log(`[ANTITEMU] 🔥 Coincidencia "temu" detectada en ${m.sender}`);

      // Eliminar el mensaje
      await conn.sendMessage(m.chat, { delete: m.key });
      console.log(`[ANTITEMU] 🗑️ Mensaje eliminado en ${m.chat}`);

      // Avisar al grupo
      await conn.sendMessage(m.chat, {
        text: `🚫 Mensaje eliminado automáticamente (se detectó la palabra o link *temu*).`
      });
    }
  } catch (e) {
    console.error('[ANTITEMU ERROR]', e);
  }
}
