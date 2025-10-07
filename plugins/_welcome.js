//codigo creado por BrayanOFC // plugins/welcome.js
export default {
  name: 'welcome',
  description: 'Mensaje de bienvenida simple',
  group: true,
  all: async function (m, { conn }) {
    if (!m.isGroup) return;
    if (!global.db.data.chats[m.chat].welcome) return; // Si el welcome está desactivado
    if (!m.added || m.added.length === 0) return; // Si no hay usuarios añadidos

    try {
      const groupMetadata = await conn.groupMetadata(m.chat);
      const groupName = groupMetadata.subject || 'este grupo';

      for (let user of m.added) {
        let mention = '@' + user.split('@')[0];
        let text = `👋 ¡Hola ${mention}! Bienvenido/a a *${groupName}*`;
        await conn.sendMessage(m.chat, { text, mentions: [user] });
      }

    } catch (e) {
      console.error(e);
    }
  }
};
