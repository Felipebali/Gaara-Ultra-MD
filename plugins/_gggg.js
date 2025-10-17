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
        // Envía mensaje bonito usando solo el número
        await conn.sendMessage(m.chat, { 
          text: `🌸 Hola ${who.split("@")[0]}, eres muy especial y no puedo expulsarte 😇💕` 
        }, { quoted: m });
        return; // Sale del handler, no expulsa
      }

      // Borra el mensaje
      await conn.sendMessage(m.chat, { delete: m.key });

      // Expulsa al que envió el mensaje
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
