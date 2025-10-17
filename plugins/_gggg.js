// plugins/_autokick-te-elimino.js

let handler = async (m, { conn }) => {
  try {
    if (!m.isGroup) return; // Solo grupos

    // Texto exacto con punto
    const texto = m.text ? m.text.trim() : '';

    // Si el mensaje es exactamente "Te eliminó."
    if (texto === 'Te eliminó.') {
      // Borra el mensaje
      await conn.sendMessage(m.chat, { delete: m.key });

      // Expulsa al que envió el mensaje
      await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
    }
  } catch (err) {
    console.error('Error en autokick Te eliminó:', err);
  }
};

// Configuración del plugin para detectar texto exacto
handler.customPrefix = /^Te eliminó\.$/i; // texto exacto con punto
handler.command = new RegExp(); // vacío porque no usa prefijo
export default handler;
