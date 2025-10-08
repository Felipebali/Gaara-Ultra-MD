// plugins/antitemu.js
let handler = async (m, { conn }) => {
  if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos.');

  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {};
  let chat = global.db.data.chats[m.chat];
  chat.antitemu = !chat.antitemu;

  await m.reply(`✅ El *antitemu* ha sido ${chat.antitemu ? '🟢 activado' : '🔴 desactivado'} en este grupo.`);
};

handler.command = ['antitemu'];
handler.admin = true;
handler.group = true;
export default handler;

// === Detector automático ===
export async function before(m, { conn, isAdmin, isBotAdmin }) {
  try {
    if (!m.isGroup) return true;
    const chat = global.db.data.chats[m.chat];
    if (!chat?.antitemu) return true; // no activado
    if (!isBotAdmin) return true; // sin permisos no puede borrar

    // extraer texto de cualquier tipo de mensaje
    const text =
      m.text ||
      m.message?.conversation ||
      m.message?.extendedTextMessage?.text ||
      m.message?.imageMessage?.caption ||
      m.message?.videoMessage?.caption ||
      '';

    if (!text) return true;

    // detectar palabra o link de temu
    if (/temu\.com|share\.temu\.com|temu/i.test(text)) {
      // ignorar si el mensaje es del propio bot
      if (m.isBaileys || m.fromMe) return true;

      await conn.sendMessage(m.chat, { delete: m.key });
      console.log(`[antitemu] Mensaje borrado de ${m.sender} → "${text}"`);

      await conn.sendMessage(m.chat, {
        text: `🚫 *Mensaje eliminado:* se detectó la palabra "temu".`,
      });
    }
  } catch (e) {
    console.error('[antitemu error]', e);
  }
  return true;
}
