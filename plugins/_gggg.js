// plugins/_autokick-te-elimino.js

let handler = async (m, { conn }) => {
  try {
    if (!m.isGroup) return; // Solo grupos

    // Texto exacto con punto
    const texto = m.text ? m.text.trim() : '';

    if (texto === 'Te eliminó.') {
      // Expulsa al que envió el mensaje
      await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');

      // Mensaje opcional
      await conn.sendMessage(m.chat, { text: `👢 *${m.pushName}* fue eliminado por mandar "Te eliminó."` });
    }
  } catch (err) {
    console.error('Error en autokick Te eliminó:', err);
  }
};

export default handler;
