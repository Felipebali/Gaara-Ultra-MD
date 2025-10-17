// plugins/tagall2-ultra-epico.js
// Versión ULTRA ÉPICA - Nivel 4 (guerra total, texto rudo pero no gráfico)
// No requiere imports problemáticos; usa conn.sendMessage / conn.relayMessage
let handler = async (m, { conn, groupMetadata, args, isAdmin, isOwner }) => {
  try {
    if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos.');

    // Permisos: solo admins + owners
    if (!(isAdmin || isOwner)) {
      const fail = [
        '⛔ ACCESO DENEGADO – RANGO INSUFICIENTE\nEste comando es solo para OFICIALES. Retírate antes de ser marcado.',
        '❌ ALERTA: No tienes rango para ejecutar esta orden. Vuelve a tu puesto ya.',
        '⚠️ ERROR DE RANGO: Solo administradores y owners ejecutan operaciones de nivel operativo.'
      ];
      return m.reply(fail[Math.floor(Math.random() * fail.length)]);
    }

    const participantes = (groupMetadata && groupMetadata.participants) ? groupMetadata.participants : [];
    const mencionados = participantes
      .map(p => p.id ? (conn.decodeJid ? conn.decodeJid(p.id) : p.id) : null)
      .filter(Boolean);

    if (mencionados.length === 0) return m.reply('❌ No pude obtener la lista de participantes.');

    // Componentes variables para máxima imprevisibilidad
    const titulos = [
      '☠️🚨 OPERACIÓN: ANULACIÓN TOTAL 🚨☠️',
      '⚔️🪖 LLAMADO DE GUERRA – FASE ALFA 🪖⚔️',
      '🔴 ALERTA MÁXIMA – ORDEN DE CAMPO 🔴',
      '💣 EJECUCIÓN INMEDIATA – PROTOCOLO ROJO 💣'
    ];

    const cuerpos = [
      '💂 Unidad: movilización inmediata. Esta llamada NO ES OPCIONAL.\nQuien no responda será expulsado y reportado ante los oficiales superiores.',
      '⚡ Orden final: presentar reporte AHORA. La inacción será castigada con aislamiento y sanciones administrativas.',
      '📌 Atención total: operación en marcha. Quien falte será marcado como no fiable y puesto en lista negra del grupo.',
      '🪖 Control absoluto: TODAS las unidades deben contestar. Las consecuencias administrativas serán severas para los ausentes.'
    ];

    const firmas = [
      '🛡 División táctica Felix-Cat',
      '🔱 Comando Alfa – Felix-Cat',
      '⚜️ Estado Mayor Felix-Cat',
      '🏴 Unidad de Operaciones Especiales – Felix-Cat'
    ];

    // Construcción del mensaje (aleatorio)
    const header = titulos[Math.floor(Math.random() * titulos.length)];
    const body = cuerpos[Math.floor(Math.random() * cuerpos.length)];
    const footer = firmas[Math.floor(Math.random() * firmas.length)];

    const cuerpoCompleto = [
      header,
      '════════════════════════════',
      body,
      '',
      '📌 Detalles secretos → 🔒 https://miunicolink.local/tagall-FelixCat',
      '',
      '════════════════════════════',
      footer
    ].join('\n');

    // Payload con mención oculta (contextInfo.mentionedJid)
    const payload = {
      extendedTextMessage: {
        text: cuerpoCompleto,
        contextInfo: {
          mentionedJid: mencionados
        }
      }
    };

    // Envío x2 sin quoted (no citar)
    for (let i = 0; i < 2; i++) {
      try {
        // relayMessage suele evitar que quede como reply; si falla, usamos sendMessage
        await conn.relayMessage(m.chat, payload, {});
      } catch (e) {
        try {
          // Para compatibilidad: algunos entornos prefieren sendMessage(jid, { text: ... }, { ... })
          await conn.sendMessage(m.chat, payload);
        } catch (err) {
          console.error('tagall2-ultra-epico: error al enviar', err);
        }
      }
      // pequeña pausa para evitar detección de spam
      await new Promise(res => setTimeout(res, 700));
    }

  } catch (err) {
    console.error('tagall2-ultra-epico: excepción', err);
    try { m.reply('❌ Ocurrió un error al ejecutar la operación.'); } catch {}
  }
};

handler.help = ['tagall2'];
handler.tags = ['grupos'];
handler.command = ['tagall2', 'ultraepico', 'ordenfinal'];
handler.group = true;
handler.admin = true; // solo admins + owners (isOwner comprobado en runtime)

export default handler;
