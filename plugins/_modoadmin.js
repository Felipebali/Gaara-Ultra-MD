// ✅ Modo Admin Global para Gaara-Ultra-MD
// ✅ Hecho para Feli (FelixCat_Bot)
// ✅ Solo admins y dueños pueden usar comandos cuando está activado
// ✅ Toggle con .modoadmin (sin ON/OFF)

const ownerNumbers = ['59896026646', '59898719147']; // ← Números dueños

// Asegurar espacio en DB
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

  // Mensaje de estado
  let msg = global.db.data.settings.modoadmin
    ? `🛡️ *MODO ADMIN ACTIVADO*\nSolo administradores y dueños pueden usar comandos ahora.`
    : `⚠️ *MODO ADMIN DESACTIVADO*\nTodos los miembros pueden usar comandos nuevamente.`;

  await conn.reply(m.chat, msg, m);
};

handler.command = /^modoadmin$/i;
handler.group = true;
handler.register = true; // Necesario para plugins globales

// ✅ BLOQUEO GLOBAL
handler.before = async function (m) {
  if (!m.isGroup) return false;
  if (!global.db.data.settings.modoadmin) return false;

  const sender = m.sender.replace(/[^0-9]/g, '');
  const isOwner = ownerNumbers.includes(sender);
  const isAdmin = m.isAdmin;

  // Bloquear comandos que empiecen con "."
  if (!isOwner && !isAdmin && m.text && m.text.startsWith('.')) {
    this.reply(m.chat, '🚫 *MODO ADMIN ACTIVADO*\nSolo admins y dueños pueden usar comandos.', m);
    return true;
  }
  return false;
};

export default handler;
