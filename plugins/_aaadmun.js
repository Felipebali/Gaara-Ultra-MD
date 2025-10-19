// plugins/_admin-request.js

let lastIndex = -1;

let handler = async (m, { conn }) => {
  try {
    if (!m.isGroup) return; // Solo grupos

    const texto = m.text ? m.text.toLowerCase() : '';
    if (!texto.includes('admin')) return; // Solo mensajes que tengan "admin"
    if (texto.includes('modoadmin')) return; // ❗ Ignorar comando .modoadmin

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

    // Enviar respuesta con mención
    await conn.sendMessage(m.chat, {
      text: mensajes[index],
      mentions: [who]
    });

  } catch (err) {
    console.error('Error en admin-request plugin:', err);
  }
};

// Configuración del plugin
handler.customPrefix = /admin/i;
handler.command = new RegExp();
handler.group = true;
export default handler;
