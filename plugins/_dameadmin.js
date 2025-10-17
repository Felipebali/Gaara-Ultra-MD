// plugins/_admin-request.js

let lastIndex = -1;

let handler = async (m, { conn }) => {
  try {
    if (!m.isGroup) return; // Solo grupos

    const texto = m.text ? m.text.trim().toLowerCase() : '';
    if (texto !== 'dame admin' && texto !== 'quiero admin') return;

    const who = m.sender; // JID completo

    const mensajes = [
      `@${who.split("@")[0]}, calma ahí 😎, no puedes pedir admin así 😏`,
      `@${who.split("@")[0]}, sorry amigo/a, admin no se pide, se gana 😅`,
      `@${who.split("@")[0]}, jaja tranquilo/a, hoy no toca admin 😆`
    ];

    // Elegir un índice aleatorio que no se repita
    let index;
    do { index = Math.floor(Math.random() * mensajes.length); } while (index === lastIndex);
    lastIndex = index;

    // Enviar mensaje con mención correcta
    await conn.sendMessage(m.chat, { 
      text: mensajes[index], 
      mentions: [who] 
    });

  } catch (err) {
    console.error('Error en admin-request plugin:', err);
  }
};

// Configuración del plugin
handler.customPrefix = /^(dame admin|quiero admin)$/i; // detecta exactamente esos textos
handler.command = new RegExp(); // no necesita prefijo
export default handler;
