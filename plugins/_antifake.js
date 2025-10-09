// plugins/antifake-offline.js

let handler = async (m, { conn, isAdmin, isOwner }) => {
  if (!m.isGroup) return conn.sendMessage(m.chat, { text: '⚠️ Este comando solo funciona en grupos.' });
  if (!(isAdmin || isOwner)) return conn.sendMessage(m.chat, { text: '⚠️ Solo admins pueden usar este comando.' });

  let chat = global.db.data.chats[m.chat];
  chat.antifake = !chat.antifake;

  conn.sendMessage(m.chat, { 
    text: `⚡️ La función *antifake* se *${chat.antifake ? 'activó' : 'desactivó'}* para este chat`
  });
};

handler.all = async (m, { conn }) => {
  try {
    let chat = global.db.data.chats[m.chat];
    if (!m.isGroup || !chat.antifake) return;

    let newUsers = m.users || m.participants || [];
    for (let jid of newUsers) {
      let number = jid.split('@')[0];

      // Patrones comunes de números VoIP/virtuales en Uruguay
      // Ejemplo: 099, 098, 097 son móviles reales; 094, 092 pueden ser temporales
      // Ajusta según lo que quieras filtrar
      let suspiciousPrefixes = ['092', '094', '095', '096'];
      let prefix = number.slice(2, 5); // quitar +598 y tomar los primeros 3 dígitos

      if (suspiciousPrefixes.includes(prefix)) {
        // Avisar a los admins
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

handler.help = ['
