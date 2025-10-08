let linkRegex = /\b((https?:\/\/|www\.)?[\w-]+\.[\w-]+(?:\.[\w\.\-\/]*)?)\b/i

export async function before(m, {isAdmin, isBotAdmin}) {
  if (m.isBaileys && m.fromMe) return true;
  if (!m.isGroup) return false;

  const chat = global.db.data.chats[m.chat];
  const bot = global.db.data.settings[this.user.jid] || {};
  const delet = m.key.participant;
  const bang = m.key.id;
  const isGroupLink = linkRegex.exec(m.text);

  if (!chat.antiLink2 || !isGroupLink) return true; // No hay antilink o no es link

  // Permitir links del grupo o YouTube
  const groupLink = `https://chat.whatsapp.com/${await this.groupInviteCode(m.chat)}`;
  const exceptions = [`https://www.youtube.com/`, `https://youtu.be/`];
  if (m.text.includes(groupLink)) return true;
  if (exceptions.some(e => m.text.includes(e))) return true;

  // Solo borrar mensaje si bot es admin
  if (isBotAdmin) {
    await this.sendMessage(m.chat, {
      delete: { remoteJid: m.chat, fromMe: false, id: bang, participant: delet }
    });
  }

  // Si no es admin y restrict activo, expulsar
  if (!isAdmin && bot.restrict && isBotAdmin) {
    try {
      await this.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
    } catch (e) {
      console.log(`No se pudo expulsar a ${m.sender}: ${e.message}`);
    }
  }

  return false; // Bloquea el mensaje
}
