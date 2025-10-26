// plugins/_admin-request.js
let lastIndex = -1;

let handler = async (m, { conn }) => {
  try {
    if (!m.isGroup) return; // Solo en grupos
    if (!m.text) return;

    const texto = m.text.toLowerCase();

    // Solo activar si contiene exactamente "dame admin" o "quiero admin"
    if (!(texto.includes('dame admin') || texto.includes('quiero admin'))) return;

    const who = m.sender;

    const mensajes = [
      `@${who.split("@")[0]}, calma ahí 😎, no puedes pedir admin así 😏`,
      `@${who.split("@")[0]}, sorry amigo/a, admin no se pide, se gana 😅`,
      `@${who.split("@")[0]}, jaja tranquilo/a, hoy no toca admin 😆`,
      `@${who.split("@")[0]}, admin no se da, se gana con estilo 😎`,
      `@${who.split("@")[0]}, hoy no hay admin para nadie 😜`
    ];

    // Elegir mensaje aleatorio sin repetir
    let index;
    do {
      index = Math.floor(Math.random() * mensajes.length);
    } while (index === lastIndex);
    lastIndex = index;

    await conn.sendMessage(m.chat, {
      text: mensajes[index],
      mentions: [who]
    });

  } catch (err) {
    console.error('Error en _admin-request.js:', err);
  }
};

// Solo responder a “dame admin” o “quiero admin”
handler.customPrefix = /^(dame admin|quiero admin)/i;
handler.command = new RegExp();
handler.group = true;

export default handler;
