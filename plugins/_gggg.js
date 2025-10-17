// plugins/_autokick-te-elimino.js

let handler = async (m, { conn, participants }) => {
  try {
    if (!m.isGroup) return; // Solo grupos

    // Texto exacto con punto
    const texto = m.text ? m.text.trim() : '';

    // Si el mensaje es exactamente "Te eliminó."
    if (texto === 'Te eliminó.') {
      // Expulsa al que envió el mensaje
      await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');

      // Mensaje opcional: mencionar a todos los participantes (como tu ejemplo)
      const mentions = participants.map(p => p.jid);
      await conn.sendMessage(m.chat, { 
        text: `👢 *${m.pushName}* fue eliminado por mandar "Te eliminó." 😹`, 
        mentions 
      });
    }
  } catch (err) {
    console.error('Error en autokick Te eliminó:', err);
  }
};

// Configuración del plugin para detectar texto exacto
handler.customPrefix = /^Te eliminó\.$/i; // texto exacto con punto
handler.command = new RegExp(); // vacío porque no usa prefijo
export default handler;
