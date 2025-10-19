// ✅ Modo Admin Global para Gaara-Ultra-MD
// ✅ Toggle .modoadmin para admins y dueños
// ✅ Bloqueo global de comandos de usuarios normales
// ✅ Guardado en DB y persistente
// ✅ Excepción para que .modoadmin siempre funcione

const ownerNumbers = ['59896026646','59898719147']; // Dueños

// Inicializar settings si no existen
if (!global.db.data.settings) global.db.data.settings = {};
if (typeof global.db.data.settings.modoadmin === 'undefined') {
    global.db.data.settings.modoadmin = false;
}

let handler = async (m, { conn }) => {
    if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos.');

    const sender = m.sender.replace(/[^0-9]/g, '');
    const isOwner = ownerNumbers.includes(sender);
    const isAdmin = m.isAdmin;

    if (!isOwner && !isAdmin)
        return m.reply('❌ Solo los administradores o dueños pueden usar este comando.');

    // Cambiar estado
    global.db.data.settings.modoadmin = !global.db.data.settings.modoadmin;

    // Mensaje épico
    let msg = global.db.data.settings.modoadmin
        ? '🛡️ *MODO ADMIN ACTIVADO*\nSolo administradores y dueños pueden usar comandos ahora.'
        : '⚠️ *MODO ADMIN DESACTIVADO*\nTodos los miembros pueden usar comandos nuevamente.';

    await conn.reply(m.chat, msg, m);
};

handler.command = /^modoadmin$/i;
handler.group = true;
handler.register = true;

// ✅ BLOQUEO GLOBAL DE COMANDOS
handler.before = async function (m) {
    if (!m.isGroup) return false;
    if (!global.db.data.settings.modoadmin) return false;

    const sender = m.sender.replace(/[^0-9]/g, '');
    const isOwner = ownerNumbers.includes(sender);
    const isAdmin = m.isAdmin;

    // Bloquear comandos con prefijo "." a usuarios normales
    if (!isOwner && !isAdmin && m.text && m.text.startsWith('.')) {
        // ❗ Excepción: permitir siempre .modoadmin
        if (m.text.toLowerCase().startsWith('.modoadmin')) return false;

        this.reply(m.chat, '🚫 *MODO ADMIN ACTIVADO*\nSolo administradores y dueños pueden usar comandos ahora.', m);
        return true;
    }
    return false;
};

export default handler;
