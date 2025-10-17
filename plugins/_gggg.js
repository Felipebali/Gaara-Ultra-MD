// plugins/_autokick-te-elimino.js

let handler = async (m, { conn }) => {
  if (!m.isGroup) return;

  // Solo dispara si el mensaje es exactamente "Te eliminó."
  if (m.text && m.text.trim().toLowerCase() === 'te eliminó.'.toLowerCase()) {
    try {
      await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
      await conn.sendMessage(m.chat, { text: `👢 Adiós *${m.pushName}*, dijiste "Te eliminó." 😹` });
    } catch (e) {
      console.error('No se pudo expulsar:', e);
    }
  }
};

export default handler; 
