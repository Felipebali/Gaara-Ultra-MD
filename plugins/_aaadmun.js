// plugins/_admin-request.js

let lastIndex = -1;

let handler = async (m, { conn }) => {
  try {
    if (!m.isGroup) return; // Solo grupos

    const texto = m.text ? m.text.toLowerCase() : '';
    if (!texto.includes('admin')) return; // cualquier mensaje que tenga "admin"

    const who = m.sender; // JID completo

    const mensajes = [
      `@${who.split("@")[0]}, calma ahí 😎, no puedes pedir admin así 😏`,
      `@${who.split("@")[0]}, sorry amigo/a, admin no se pide, se gana 😅`,
      `@${who.split("@")[0]}, jaja tranquilo/a, hoy no toca admin 😆`,
      `@${who.split("@")[0]}, admin no se da, se gana con estilo 😎`,
      `@${who.split("@")[0]}, hoy no hay admin para nadie 😜`
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
handler.customPrefix = /admin/i; // detecta cualquier mensaje que contenga "admin"
handler.command = new RegExp(); // no necesita prefijo
export default handler; 
