// plugins/antifake-offline.js

let handler = async (m, { conn, isAdmin, isOwner }) => {
  if (!m.isGroup) {
    return conn.sendMessage(m.chat, { text: '⚠️ Este comando solo funciona en grupos.' });
  }
  if (!(isAdmin || isOwner)) {
    return conn.sendMessage(m.chat, { text: '⚠️ Solo admins pueden usar este comando.' });
  }

  let chat = global.db.data.chats[m.chat];
  chat.antifake = !chat.antifake;

  // Mensaje sin citar el comando
  conn.sendMessage(m.chat, { 
    text: chat.antifake
      ? '⚡️ La función *antifake* se activó para este chat ✅'
      : '🛑 La función *antifake* se desactivó para este chat ❌'
  });
};

handler.all = async (m, { conn }) => {
  try {
    let chat = global.db.data.chats[m.chat];
    if (!m.isGroup || !chat.antifake) return;

    let newUsers = m.users || m.participants || [];
    for (let jid of newUsers) {
      let number = jid.split('@')[0];

      // Patrones de números VoIP/virtuales en Uruguay
      let suspiciousPrefixes = ['092', '094', '095', '096'];
      let prefix = number.slice(2, 5); // quitar +598 y tomar los primeros 3 dígitos

      if (suspiciousPrefixes.includes(prefix)) {
        // Avisar a los admins sin citar al usuario
        let groupMetadata = await conn.groupMetadata(m.chat);
        let admins = groupMetadata.participants.filter(u => u.admin === 'admin' || u.admin === 'superadmin');
        let mentions = admins.map(u => u.id);

        conn.sendMessage(m.chat, {
          text: `⚠️ Número sospechoso detectado: +${number}\nTipo: POSIBLE VIRTUAL/VOIP`,
          mentions
        });
      }
    }
  } catch (e) {
    console.log('Error en plugin antifake-offline:', e);
  }
};

handler.help = ['antifake'];
handler.tags = ['group'];
handler.command = ['antifake', 'antivirtuales'];

export default handler;
