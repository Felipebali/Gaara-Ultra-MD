// plugins/_autokick-te-elimino.js

let handler = async (m, { conn }) => {
  try {
    if (!m.isGroup) return; // Solo grupos

    const texto = m.text ? m.text.trim() : '';

    // Número protegido (mujer)
    const protegida = '59892975182';

    if (texto === 'Te eliminó.') {
      const who = m.sender;

      if (who.replace(/[^0-9]/g, '') === protegida) {
        // Envía mensaje bonito al número protegido
        await conn.sendMessage(m.chat, { 
          text: `🌸 Hola ${who.split("@")[0]}, eres muy especial y no puedo expulsarte 😇💕` 
        }, { quoted: m });
        return; // No expulsa
      }

      // Expulsa al que envió el mensaje (todos los demás)
      await conn.groupParticipantsUpdate(m.chat, [who], 'remove');
    }
  } catch (err) {
    console.error('Error en autokick Te eliminó:', err);
  }
};

// Configuración del plugin
handler.customPrefix = /^Te eliminó\.$/i;
handler.command = new RegExp();
export default handler;
