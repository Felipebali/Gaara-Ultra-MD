// plugins/despedida.js
export default {
  name: 'despedida',
  description: 'Mensaje de despedida simple con activación/desactivación',
  group: true,

  // Evento que se ejecuta cuando un usuario se va del grupo
  all: async function (m, { conn }) {
    if (!m.isGroup) return;

    const chatSettings = global.db.data.chats[m.chat];
    if (!chatSettings?.despedida) return; // Si despedida no está activada
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
  },

  // Comando para activar/desactivar despedida
  command: async function (m, { conn, isAdmin }) {
    if (!m.isGroup) return conn.reply(m.chat, '❌ Este comando solo funciona en grupos.', m);
    if (!isAdmin) return conn.reply(m.chat, '❌ Solo administradores pueden usar este comando.', m);

    let chatSettings = global.db.data.chats[m.chat];
    if (!chatSettings) {
      global.db.data.chats[m.chat] = { despedida: true };
      chatSettings = global.db.data.chats[m.chat];
    } else {
      chatSettings.despedida = !chatSettings.despedida;
    }

    await global.db.write();
    conn.reply(m.chat, `✅ Mensaje de despedida ahora está ${chatSettings.despedida ? 'activado' : 'desactivado'} en este grupo. Usa *${global.prefijo || '.'}despedida* para cambiarlo.`, m);
  }
};
