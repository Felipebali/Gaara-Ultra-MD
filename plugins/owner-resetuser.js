// plugins/owner-resetuser.js
const handler = async (m, { conn, text, mentionedJid }) => {
  const emoji = '♻️';
  const done = '✅';
  let user = '';

  // 🧩 1️⃣ Detectar usuario (mención / número / respuesta)
  if (mentionedJid && mentionedJid.length > 0) user = mentionedJid[0];
  else if (text?.match(/\d+/g)) user = text.match(/\d+/g).join('') + '@s.whatsapp.net';
  else if (m.quoted && m.quoted.sender) user = m.quoted.sender;
  else return conn.reply(m.chat, `${emoji} Debes mencionar, responder o escribir el número del usuario.\n\n📌 Ejemplo:\n.r @usuario\n.r 59898719147`, m);

  const userJid = user.toLowerCase();

  // 🧩 2️⃣ Asegurar existencia de las bases
  global.db.data.users = global.db.data.users || {};
  global.db.data.chats = global.db.data.chats || {};

  // 🧩 3️⃣ Verificar si el usuario está en la base
  if (!global.db.data.users[userJid]) {
    return conn.reply(m.chat, `⚠️ El usuario no se encuentra en la base de datos.`, m);
  }

  // 🧩 4️⃣ Eliminar datos del usuario
  delete global.db.data.users[userJid];

  // 🧩 5️⃣ Eliminar advertencias (y motivos) del usuario en todos los grupos
  Object.values(global.db.data.chats).forEach(chat => {
    if (chat.warns && chat.warns[userJid]) delete chat.warns[userJid];
  });

  // 🧩 6️⃣ Guardar cambios
  if (global.db.write) await global.db.write();

  // 🧩 7️⃣ Mensaje final en grupo
  const name = user.split('@')[0];
  const fecha = new Date().toLocaleString('es-UY', { timeZone: 'America/Montevideo' });

  await conn.sendMessage(m.chat, { 
    text: `${emoji} *Reinicio completado*\n\n👤 Usuario: @${name}\n🧾 Estado: Datos y advertencias eliminados\n📅 Fecha: ${fecha}\n\n${done} Base de datos actualizada correctamente.`,
    mentions: [user]
  });
};

handler.tags = ['owner'];
handler.command = ['r','deletedatauser','resetuser','borrardatos'];
handler.owner = true; // Solo dueño

export default handler;
