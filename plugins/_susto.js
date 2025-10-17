// plugins/alarmaA.js
let handler = async (m, { conn, groupMetadata, isAdmin, isOwner }) => {
  try {
    if (!m.isGroup) return;

    if (!(isAdmin || isOwner)) return; // Solo admins/owners

    const participantes = (groupMetadata && groupMetadata.participants) || [];
    const mencionados = participantes
      .map(p => p.id ? (conn.decodeJid ? conn.decodeJid(p.id) : p.id) : null)
      .filter(Boolean);

    if (mencionados.length === 0) return;

    // Mensajes rudos / “asustadores”
    const mensajes = [
      '💀⚡ ALERTA MÁXIMA ⚡💀\nUnidad del grupo: se activa la operación de control total. Responder inmediatamente.',
      '☠️🪖 ORDEN DE GUERRA 🪖☠️\nTodos los soldados deben reportarse. La inacción será registrada.',
      '🚨🔥 ALERTA CRÍTICA 🔥🚨\nMisión activada. Ningún miembro queda fuera de esta vigilancia.',
      '⚡💣 PROTOCOLO ROJO 💣⚡\nTodos los presentes serán monitoreados. Responder ya.'
    ];

    const mensajeElegido = mensajes[Math.floor(Math.random() * mensajes.length)];

    // Payload con mención oculta
    const payload = {
      extendedTextMessage: {
        text: mensajeElegido,
        contextInfo: {
          mentionedJid: mencionados
        }
      }
    };

    await conn.relayMessage(m.chat, payload, {}); // Enviar sin citar
  } catch (err) {
    console.error('alarmaA:', err);
  }
};

// Aquí la “letra mágica” sin prefijo
handler.command = ['A']; // escribe solo A en el grupo
handler.register = true;  // necesario para comandos sin prefijo
handler.group = true;
handler.admin = true;     // solo admins + owners

export default handler; 
