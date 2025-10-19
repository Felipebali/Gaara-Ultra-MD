// ✅ Modo Admin Global para Gaara-Ultra-MD
// ✅ Comando único: .modoadmin (toggle)
// ✅ Bloqueo global de comandos de usuarios normales
// ✅ Estilo similar a antifake-offline.js

const ownerNumbers = ['59896026646','59898719147']; // Dueños

let handler = async (m, { conn, isAdmin }) => {
    if (!m.isGroup) return conn.sendMessage(m.chat, { text: '❌ Este comando solo funciona en grupos.' });

    const sender = m.sender.replace(/[^0-9]/g, '');
    const isOwner = ownerNumbers.includes(sender);

    if (!isAdmin && !isOwner) return conn.sendMessage(m.chat, { text: '❌ Solo administradores o dueños pueden usar este comando.' });

    if (!global.db.data.settings) global.db.data.settings = {};
    global.db.data.settings.modoadmin = !global.db.data.settings.modoadmin;

    let msg = global.db.data.settings.modoadmin
        ? '🛡️ *MODO ADMIN ACTIVADO*\nSolo administradores y dueños pueden usar comandos ahora.'
        : '⚠️ *MODO ADMIN DESACTIVADO*\nTodos los miembros pueden usar comandos nuevamente.';

    await conn.sendMessage(m.chat, { text: msg });
};

// ---------- BLOQUEO GLOBAL ----------
handler.before = async function (m) {
    if (!m.isGroup) return false;
    if (!global.db.data.settings?.modoadmin) return false;

    const sender = m.sender.replace(/[^0-9]/g, '');
    const isOwner = ownerNumbers.includes(sender);
    const isAdmin = m.isAdmin;

    if (!isOwner && !isAdmin && m.text && m.text.startsWith('.')) {
        const lc = m.text.toLowerCase();
        if (lc.startsWith('.modoadmin')) return false; // Excepción

        await this.sendMessage(m.chat, {
            text: '🚫 *MODO ADMIN ACTIVADO*\nSolo administradores y dueños pueden usar comandos ahora.'
        }, { quoted: m });
        return true;
    }
    return false;
};

handler.help = ['modoadmin'];
handler.tags = ['group'];
handler.command = ['modoadmin'];
handler.group = true;
handler.register = true;

export default handler;
