// plugins/owner-resetuser.js
const handler = async (m, { conn, text, mentionedJid }) => {
  const emoji = '⚠️';
  const done = '✅';
  let user = '';

  // --- 1️⃣ Detectar usuario por mención ---
  if (mentionedJid && mentionedJid.length > 0) {
    user = mentionedJid[0];
  }
  // --- 2️⃣ O por número escrito en el texto ---
  else if (text?.match(/\d+/g)) {
    const number = text.match(/\d+/g).join('');
    user = number + '@s.whatsapp.net';
  }
  // --- 3️⃣ O por mensaje citado ---
  else if (m.quoted && m.quoted.sender) {
    user = m.quoted.sender;
  }
  // --- 4️⃣ Si no se detecta ningún usuario ---
  else {
    return conn.sendMessage(m.chat, {
      text: `${emoji} Debes mencionar, responder o escribir el número del usuario.\n📌 Ejemplo:\n.r @usuario\n.r 59898719147`
    });
  }

  const userJid = user.toLowerCase();

  // --- Verificar si el usuario existe en la DB ---
  if (!global.db.data.users[userJid]) {
    return conn.sendMessage(m.chat, { 
      text: `${emoji} El usuario no se encuentra en la base de datos.` 
    });
  }

  // --- Eliminar datos personales del usuario ---
  delete global.db.data.users[userJid];

  // --- Eliminar advertencias del usuario en todos los grupos ---
  Object.values(global.db.data.chats).forEach(chat => {
    if (chat.warns && chat.warns[userJid]) {
      delete chat.warns[userJid];
    }
  });

  // --- Guardar cambios ---
  if (global.db.write) await global.db.write();

  // --- Mensaje de éxito ---
  await conn.sendMessage(m.chat, { 
    text: `${done} Éxito. Todos los datos y advertencias de @${user.split('@')[0]} fueron eliminados de la base de datos.`,
    mentions: [user]
  });
};

handler.tags = ['owner'];
handler.command = ['r','deletedatauser','resetuser','borrardatos'];
handler.owner = true; // Solo para dueño

export default handler;
