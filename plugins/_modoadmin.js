// ✅ Modo Admin Global para Gaara-Ultra-MD
// ✅ Hecho para Feli (FelixCat_Bot)
// ✅ Solo 1 archivo, sin tocar el handler
// ✅ Dueños y Admins pueden usar cuando está activado

const ownerNumbers = ['59896026646', '59898719147']; // ← Dueños

if (!global.db.data.settings) global.db.data.settings = {};
if (typeof global.db.data.settings.modoadmin === 'undefined') {
    global.db.data.settings.modoadmin = false; // Default desactivado
}

let handler = async (m, { conn, isAdmin, isOwner, usedPrefix, command }) => {
    if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos.');

    const isRealOwner = ownerNumbers.includes(m.sender.replace(/[^0-9]/g, ''));

    if (!isAdmin && !isRealOwner)
        return m.reply('❌ Solo administradores o dueños pueden usar este comando.');

    global.db.data.settings.modoadmin = !global.db.data.settings.modoadmin;

    let estado = global.db.data.settings.modoadmin
        ? '🛡️ *MODO ADMIN ACTIVADO*\nAhora solo administradores y dueños pueden usar comandos.'
        : '⚠️ *MODO ADMIN DESACTIVADO*\nTodos los miembros pueden usar comandos nuevamente.';

    await conn.reply(m.chat, estado, m);
};

handler.command = /^modoadmin$/i;
handler.group = true; // Solo en grupos

export default handler;

// ✅ BLOQUEO GLOBAL DE COMANDOS
let before = async (m, { isAdmin, isOwner }) => {
    if (!m.isGroup) return;
    if (!global.db.data.settings.modoadmin) return;

    const isRealOwner = ownerNumbers.includes(m.sender.replace(/[^0-9]/g, ''));

    if (!isAdmin && !isRealOwner && m.text && m.text.startsWith('.')) {
        return m.reply('🚫 *MODO ADMIN ACTIVADO*\nSolo administradores y dueños pueden usar comandos ahora.');
    }
};
export { before };
