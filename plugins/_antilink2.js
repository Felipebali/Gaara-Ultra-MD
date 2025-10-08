let linkRegex = /\b((https?:\/\/|www\.)?[\w-]+\.[\w-]+(?:\.[\w-]+)*(\/[\w\.\-\/]*)?)\b/i

export async function before(m, { isAdmin, isBotAdmin }) {
  if (m.isBaileys && m.fromMe) return true;
  if (!m.isGroup) return false;

  const chat = global.db.data.chats[m.chat];
  const delet = m.key.participant;
  const bang = m.key.id;
  const bot = global.db.data.settings[this.user.jid] || {};
  const user = `@${m.sender.split('@')[0]}`;
  const isGroupLink = linkRegex.exec(m.text);

  if (chat.antiLink2 && isGroupLink) {
    if (isAdmin) {
      // Solo borramos el mensaje del admin
      await this.sendMessage(m.chat, {
        text: `⚠️ ${user} envió un enlace.\nRecuerden que las reglas son iguales para todos en este grupo.`,
        mentions: [m.sender]
      });
      if (isBotAdmin) {
        await this.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: bang, participant: delet } });
      }
      return false; // No expulsar, solo borrar
    }

    if (!isAdmin) {
      // Para miembros normales, borrar y avisar igual
      await this.sendMessage(m.chat, {
        text: `🚫 ${user} no puede enviar enlaces aquí, respeta las reglas del grupo.`,
        mentions: [m.sender]
      });
      if (isBotAdmin) {
        await this.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: bang, participant: delet } });
      }
      return false;
    }
  }

  return true;
}
