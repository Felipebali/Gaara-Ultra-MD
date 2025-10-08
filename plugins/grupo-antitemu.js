// plugins/antitemu.js
let handler = async (m, { conn }) => {
  if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos.');

  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {};
  let chat = global.db.data.chats[m.chat];
  chat.antitemu = !chat.antitemu;

  m.reply(`✅ El *antitemu* ha sido ${chat.antitemu ? '🟢 activado' : '🔴 desactivado'}.`);
};

handler.command = ['antitemu'];
handler.admin = true;
handler.group = true;
export default handler;

// === DETECTOR AUTOMÁTICO ===
export async function before(m, { conn, isAdmin, isBotAdmin }) {
  try {
    if (!m.isGroup) return true;
    const chat = global.db.data.chats[m.chat];
    if (!chat?.antitemu) return true;
    if (!isBotAdmin) return true;

    // Capturar TODO tipo de texto posible
    const text =
      (m.text ||
        m.message?.conversation ||
        m.message?.extendedTextMessage?.text ||
        m.message?.imageMessage?.caption ||
        m.message?.videoMessage?.caption ||
        m.message?.buttonsResponseMessage?.selectedButtonId ||
        m.message?.listResponseMessage?.singleSelectReply?.selectedRowId ||
        '')?.toLowerCase();

    if (!text) return true;

    // Mostrar en consola qué texto detectó
    console.log(`[ANTITEMU] Mensaje detectado: "${text}"`);

    // Si contiene "temu" o links de temu
    if (text.includes('temu.com') || text.includes('share.temu.com') || text.includes('temu')) {
      console.log(`[ANTITEMU] Coincidencia TEMU detectada en ${m.sender}`);
      if (m.isBaileys || m.fromMe) return true;

      // Intentar borrar
      await conn.sendMessage(m.chat, { delete: m.key });
      console.log(`[ANTITEMU] Mensaje borrado de ${m.sender}`);

      await conn.sendMessage(m.chat, {
        text: `🚫 Mensaje eliminado automáticamente (palabra o link *"temu"* detectado).`,
      });
    }
  } catch (e) {
    console.error('[ANTITEMU ERROR]', e);
  }
  return true;
}
