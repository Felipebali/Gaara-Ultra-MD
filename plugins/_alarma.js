// plugins/alarmaA.js
// Activador: letra "A" sin prefijo (A o a)
// Solo ADMIN o OWNER puede activarlo, sin límite de uso.
// Envía una frase aleatoria (de las 24) visible con mención oculta.

let handler = async (m, { conn, groupMetadata, isAdmin, isOwner }) => {
  try {
    if (!m) return;
    if (!m.isGroup) return; // solo grupos

    // --- SOLO ADMINS o OWNERS ---
    if (!isAdmin && !isOwner) return; // si no es admin ni owner, no hace nada

    const text = (m.text || '').toString().trim();
    if (!text) return;
    if (text.toLowerCase() !== 'a') return; // activador: "A" o "a"

    // participantes del grupo
    const participantes = (groupMetadata && groupMetadata.participants) ? groupMetadata.participants : [];
    const mencionados = participantes
      .map(p => p.id ? (conn.decodeJid ? conn.decodeJid(p.id) : p.id) : null)
      .filter(Boolean);

    if (!mencionados.length) return conn.sendMessage(m.chat, { text: '❌ No hay participantes detectables.' });

    // 24 frases aleatorias
    const mensajes = [
      '☠️ ALERTA: Responda o se procede al borrado.',
      '🚨 5 minutos para presentarse.',
      '🔴 Último aviso: actúe ahora.',
      '⚠️ Riesgo de eliminación inminente.',
      '📌 Responda o será marcado.',
      '💣 PROTOCOLO: Si no hay respuesta en 5 minutos, iniciaremos la depuración del chat.',
      '🚨 ORDEN: Presentarse inmediatamente o afrontar sanciones administrativas.',
      '🛑 CONTROL: Ausentes serán reportados y bloqueados temporalmente.',
      '🔱 ATENCIÓN: Esta sala está en revisión. Responda para evitar cierre.',
      '📛 NOTIFICACIÓN: Falta de reacción = expulsión colectiva condicional.',
      '📋 COMUNICADO OFICIAL: Se requiere respuesta inmediata. El incumplimiento será registrado.',
      '📑 AVISO DEL ESTADO MAYOR: Esta conversación está sujeta a revisión disciplinaria.',
      '📝 CITACIÓN: Presentarse para evitar medidas administrativas y bloqueo de acceso.',
      '🏛️ NOTA: El grupo podría ser desactivado si no se recibe respuesta oportuna.',
      '📌 RESOLUCIÓN: Ausencias reiteradas serán sancionadas según protocolo interno.',
      '🔴 ORDEN FINAL: No responder = borrado y reporte permanente.',
      '⚔️ ADVERTENCIA: La inacción será procesada y registrada en lista negra.',
      '💥 ÚLTIMO AVISO: Quien no responda quedará vetado de futuras salas.',
      '🪖 MANDATO: Responde o enfrentas consecuencias administrativas.',
      '🏴 ALERTA MÁXIMA: Esta es la última llamada antes del cierre forzoso.',
      '👁️ SOMBRA EN LA SALA: El silencio será devorado por la limpieza del grupo.',
      '🕯️ HORA DE LA PURGA: Falta de respuesta = desaparición digital del chat.',
      '🩸 NOMBRE EN LA LISTA: El ausente será registrado en la nómina negra del servidor.',
      '☠️ FIN DE TURNO: Si nadie responde, este lugar será borrado del mapa.'
    ];

    // Elegir una frase aleatoria
    const elegido = mensajes[Math.floor(Math.random() * mensajes.length)];

    // Enviar visible + mención oculta
    await conn.sendMessage(m.chat, {
      text: elegido,
      contextInfo: { mentionedJid: mencionados }
    });

  } catch (err) {
    console.error('alarmaA: excepción', err);
    try { 
      await conn.sendMessage(m.chat, { text: '❌ Ocurrió un error al ejecutar la alarma.' }); 
    } catch {}
  }
};

// Compatibilidad para detección sin prefijo
handler.customPrefix = /^\s*a\s*$/i; // detecta "a" o "A" con/sin espacios
handler.command = [''];
handler.register = true;
handler.group = true;

export default handler;
