// plugins/antitemu.js
let handler = async (m, { conn, isAdmin }) => {
    if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos.');
    if (!isAdmin) return m.reply('❌ Solo los administradores pueden usar este comando.');

    if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {};
    let chat = global.db.data.chats[m.chat];
    chat.antitemu = !chat.antitemu;

    await global.db.write();
    m.reply(`✅ El *antitemu* ha sido ${chat.antitemu ? '🟢 activado' : '🔴 desactivado'}.`);
};

handler.command = ['antitemu'];
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

// === Detección automática de cualquier texto que contenga "temu" ===
handler.all = async function (m, { conn, isBotAdmin }) {
    if (!m.isGroup) return;
    if (!isBotAdmin) return;
    if (!m.text) return;

    let chat = global.db.data.chats[m.chat];
    if (!chat?.antitemu) return;

    if (/temu/i.test(m.text)) { // detecta la palabra "temu" en cualquier parte
        try {
            await conn.sendMessage(m.chat, { delete: m.key });
            await conn.sendMessage(m.chat, {
                text: `⚠️ El mensaje de *${m.pushName || m.sender.split('@')[0]}* contenía la palabra "temu" y fue eliminado.`,
            });
            console.log(`🧹 AntiTemu: mensaje borrado en ${m.chat}`);
        } catch (err) {
            console.error('❌ Error al eliminar mensaje Temu:', err);
        }
    }
};

export default handler;
