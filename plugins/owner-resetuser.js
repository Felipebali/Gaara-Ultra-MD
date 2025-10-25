// plugins/owner-resetuser.js
function normalizeJid(jid) {
  if (!jid) return null;
  return jid.replace(/@c\.us$/, '@s.whatsapp.net').replace(/@s\.whatsapp.net$/, '@s.whatsapp.net');
}

const handler = async (m, { conn, text, mentionedJid }) => {
  const emoji = '♻️';
  const done = '✅';
  let user = '';

  // 1️⃣ Detectar usuario
  if (mentionedJid && mentionedJid.length > 0) user = mentionedJid[0];
  else if (text?.match(/\d+/g)) user = text.match(/\d+/g).join('') + '@s.whatsapp.net';
  else if (m.quoted && m.quoted.sender) user = m.quoted.sender;
  else return conn.reply(m.chat, `${emoji} Debes mencionar, responder o escribir el número del usuario.\n\n📌 Ejemplo:\n.r @usuario\n.r 59898719147`, m);

  const userJid = normalizeJid(user);

  // 2️⃣ Asegurar existencia de la base
  global.db.data.users = global.db.data.users || {};
  global.db.data.chats = global.db.data.chats || {};

  // 3️⃣ Verificar si existe
  if (!global.db.data.users[userJid]) {
    return conn.reply(m.chat, `⚠️ El usuario no se encuentra en la base de datos.`, m);
  }

  // 4️⃣ Eliminar datos del usuario
  delete global.db.data.users[userJid];

  // 5️⃣ Eliminar advertencias y motivos en todos los grupos
  Object.values(global.db.data.chats).forEach(chat => {
    if (chat.warns && chat.warns[userJid]) {
      delete chat.warns[userJid];
    }
  });

  // 6️⃣ Guardar cambios
  if (global.db.write) await global.db.write();

  // 7️⃣ Mensaje final
  const name = user.split('@')[0];
  const fecha = new Date().toLocaleString('es-UY', { timeZone: 'America/Montevideo' });

  await conn.sendMessage(m.chat, { 
    text: `${emoji} *Reinicio completado*\n\n👤 Usuario: @${name}\n🧾 Estado: Datos y advertencias eliminados\n📅 Fecha: ${fecha}\n\n${done} Base de datos actualizada correctamente.`,
    mentions: [userJid]
  });
};

handler.tags = ['owner'];
handler.command = ['r','deletedatauser','resetuser','borrardatos'];
handler.owner = true;

export default handler;
