// plugins/_autokick-me-eliminaste.js
// Plugin divertido "Me eliminaste" - solo frases, sin expulsar

let lastCommonIndex = -1;
let lastOwnerIndex = -1;
let lastProtectedIndex = -1;

let handler = async (m, { conn }) => {
  try {
    if (!m.isGroup) return;
    const texto = m.text ? m.text.trim() : '';
    if (!texto) return;

    const who = m.sender;
    const shortWho = who.split('@')[0];

    // Owners y protegida
    const owners = ['59898719147','59896026646'];
    const protegida = '59892975182';

    const frasesComunes = [
      `@${shortWho}, jajaja qué gracioso 😹`,
      `@${shortWho}, te pasaste 😆`,
      `@${shortWho}, mala idea 😏`,
      `@${shortWho}, jajaja me hiciste reír 🤡`
    ];

    const frasesOwners = [
      `Dueño/a, tranquilo 😎, no puedo tocarte 😏`,
      `Comando recibido, señor 😇`,
      `Dueño/a, jaja no te hagas el vivo 😹`
    ];

    const frasesProtegida = [
      `@${shortWho}, 🌸 eres muy especial 😇💕`,
      `@${shortWho}, 💖 qué linda eres 😘`,
      `@${shortWho}, ✨ no te puedo tocar 😍`
    ];

    // ------------------------
    // PROTECCIONES
    if (shortWho === protegida) {
      let idx; do { idx = Math.floor(Math.random() * frasesProtegida.length); } while (idx === lastProtectedIndex);
      lastProtectedIndex = idx;
      await conn.sendMessage(m.chat, { text: frasesProtegida[idx], mentions: [who] });
      return;
    }

    if (owners.includes(shortWho)) {
      let idx; do { idx = Math.floor(Math.random() * frasesOwners.length); } while (idx === lastOwnerIndex);
      lastOwnerIndex = idx;
      await conn.sendMessage(m.chat, { text: frasesOwners[idx] });
      return;
    }

    // ------------------------
    // NORMALIZACIÓN ULTRA ROBUSTA
    const normalized = texto
      .toLowerCase()
      .replace(/0/g, 'o')
      .replace(/[1!|¡IŁ]/g, 'l')
      .replace(/[^a-záéíóúñ\s]/g, '')
      .replace(/\s+/g, '');

    // Regex para detectar "me eliminaste"
    const normTrigger = /me.*elimin[aoó]s?te/i;
    if (!normTrigger.test(normalized)) return;

    // USUARIO COMÚN (humillación divertida)
    let idx; do { idx = Math.floor(Math.random() * frasesComunes.length); } while (idx === lastCommonIndex);
    lastCommonIndex = idx;

    const replyTo = m.quoted?.sender || null;
    const textoFinal = replyTo
      ? `@${shortWho}, dijiste eso respondiendo a @${(replyTo.split('@')[0])} — mala idea 😹`
      : frasesComunes[idx];

    await conn.sendMessage(m.chat, {
      text: textoFinal,
      mentions: replyTo ? [who, replyTo] : [who]
    });

  } catch (err) {
    console.error('Error en autokick Me eliminaste (solo frases):', err);
  }
};

// ------------------------
// Handler: detecta todas las variantes locas de "me eliminaste"
handler.customPrefix = /^(me[\s\S]{0,40})$/i;
handler.command = new RegExp();

export default handler; 
