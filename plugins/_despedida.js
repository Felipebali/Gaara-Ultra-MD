// plugins/despedida.js
export default {
  name: 'despedida',
  description: 'Mensaje de despedida simple',
  group: true,
  all: async function (m, { conn }) {
    if (!m.isGroup) return;
    if (!global.db.data.chats[m.chat].welcome) return; // Se usa la misma variable que welcome
    if (!m.removed || m.removed.length === 0) return; // Si no hay usuarios eliminados

    try {
      const groupMetadata = await conn.groupMetadata(m.chat);
      const groupName = groupMetadata.subject || 'este grupo';

      for (let user of m.removed) {
        let mention = '@' + user.split('@')[0];
        let text = `👋 ${mention} se ha ido de *${groupName}*. ¡Hasta luego!`;
        await conn.sendMessage(m.chat, { text, mentions: [user] });
      }

    } catch (e) {
      console.error(e);
    }
  }
};
