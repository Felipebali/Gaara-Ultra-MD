// ✅ Modo Admin Global para Gaara-Ultra-MD
// ✅ Comando único: .modoadmin (toggle)
// ✅ Bloqueo global de comandos de usuarios normales
// ✅ Mensajes épicos asegurados

const ownerNumbers = ['59896026646','59898719147']; // Dueños

// Inicializar settings si no existen
if (!global.db.data.settings) global.db.data.settings = {};
if (typeof global.db.data.settings.modoadmin === 'undefined') {
    global.db.data.settings.modoadmin = false;
}

// ---------- COMANDO TOGGLE ----------
let handler = async (m, { conn }) => {
    if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos.');

    const sender = m.sender.replace(/[^0-9]/g, '');
    const isOwner = ownerNumbers.includes(sender);
    const isAdmin = m.isAdmin;

    if (!isOwner && !isAdmin)
        return m.reply('❌ Solo los administradores o dueños pueden usar este comando.');

    // Cambiar estado
    global.db.data.settings.modoadmin = !global.db.data.settings.modoadmin;

    // Mensaje épico según el estado
    let msg = global.db.data.settings.modoadmin
        ? '🛡️ *MODO ADMIN ACTIVADO*\nSolo administradores y dueños pueden usar comandos ahora.'
        : '⚠️ *MODO ADMIN DESACTIVADO*\nTodos los miembros pueden usar comandos nuevamente.';

    await conn.sendMessage(m.chat, { text: msg }, { quoted: m });
};

handler.command = /^modoadmin$/i;
handler.group = true;
handler.register = true;

// ---------- BLOQUEO GLOBAL DE COMANDOS ----------
let before = async function (m) {
    if (!m.isGroup) return false;
    if (!global.db.data.settings.modoadmin) return false;

    const sender = m.sender.replace(/[^0-9]/g, '');
    const isOwner = ownerNumbers.includes(sender);
    const isAdmin = m.isAdmin;

    // Bloquear comandos con prefijo "." a usuarios normales
    if (!isOwner && !isAdmin && m.text && m.text.startsWith('.')) {
        const lc = m.text.toLowerCase();
        // ❗ Excepción: permitir siempre .modoadmin
        if (lc.startsWith('.modoadmin')) return false;

        await this.sendMessage(m.chat, { 
            text: '🚫 *MODO ADMIN ACTIVADO*\nSolo administradores y dueños pueden usar comandos ahora.' 
        }, { quoted: m });
        return true;
    }
    return false;
};

// Exportar el comando y el before en un solo plugin
export default [handler, { before }];
