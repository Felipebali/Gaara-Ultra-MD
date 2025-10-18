// plugins/_autokick-te-elimino.js
// Autokick "Sorpresa B" - Bardo + Humillación
// Detecta absolutamente cualquier variante de "te eliminó"/"te elimino"

let lastCommonIndex = -1;
let lastOwnerIndex = -1;
let lastProtectedIndex = -1;
let lastActionTime = 0; // para evitar dobles acciones rápidas
const ACTION_COOLDOWN_MS = 3000; // evita re-ejecuciones inmediatas

let handler = async (m, { conn }) => {
  try {
    if (!m.isGroup) return; // Solo grupos
    const texto = m.text ? m.text.trim() : '';
    if (!texto) return;

    // Evitar acciones dobles
    const now = Date.now();
    if (now - lastActionTime < ACTION_COOLDOWN_MS) return;

    const who = m.sender;
    const shortWho = who.split('@')[0];

    // Owners y protegida
    const owners = ['59898719147','59896026646'];
    const protegida = '59892975182';

    const frasesComunes = [
      `JAJA @${shortWho}, afuera pa, sos malísimo 😹`,
      `@${shortWho} te sacaron la entrada — pa afuera 😆`,
      `No da, @${shortWho}. Fuera del grupo y aprendé. 🤡`,
      `@${shortWho}, partido finito — afuera con estilo.`
    ];

    const frasesOwners = [
      `Dueño/a, jaja no te hagas el vivo 😏`,
      `Dueño/a, no puedo expulsarte, pero te mereces un tirón de orejas 😈`,
      `Comando recibido, señor. (No puedo expulsarlo).`
    ];

    const frasesProtegida = [
      `@${shortWho}, 🌸 eres muy especial y no puedo expulsarte 😇💕`,
      `@${shortWho}, 💖 que linda eres, tranquila 😘`,
      `@${shortWho}, ✨ no te puedo tocar, eres protegida 😍`
    ];

    // Metadata
    let groupMetadata;
    try {
      groupMetadata = await conn.groupMetadata(m.chat);
    } catch (e) {
      console.error('No pude obtener groupMetadata:', e);
      groupMetadata = null;
    }
    const participant = groupMetadata?.participants?.find(p => p.id === who);
    const isAdmin = !!participant?.admin;

    // ------------------------
    // PROTECCIONES PRIMARIAS
    if (shortWho === protegida) {
      let idx;
      do { idx = Math.floor(Math.random() * frasesProtegida.length); } while (idx === lastProtectedIndex);
      lastProtectedIndex = idx;
      await conn.sendMessage(m.chat, { text: frasesProtegida[idx], mentions: [who] });
      return;
    }

    if (owners.includes(shortWho)) {
      let idx;
      do { idx = Math.floor(Math.random() * frasesOwners.length); } while (idx === lastOwnerIndex);
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

    // Regex para detectar "te eliminó"/"te elimino" tras normalizar
    const normTrigger = /te.*elimin[aoó]/i;
    if (!normTrigger.test(normalized)) return;

    // Cooldown activado
    lastActionTime = now;

    // ADMIN (degrada + expulsa)
    if (isAdmin) {
      await conn.sendMessage(m.chat, {
        text: `@${shortWho}, ⚠️ se te quitó el admin por mandar "${texto}" 😅`,
        mentions: [who]
      });

      try { await conn.groupParticipantsUpdate(m.chat, [who], 'demote'); } catch (err) { console.error('Demote error:', err); }
      await delay(3000);
      try { await conn.groupParticipantsUpdate(m.chat, [who], 'remove'); } catch (err) { console.error('Remove admin error:', err); }

      await conn.sendMessage(m.chat, { text: `Otro payaso que no aguantó 😹` });
      return;
    }

    // USUARIO COMÚN (humillación)
    let idx;
    do { idx = Math.floor(Math.random() * frasesComunes.length); } while (idx === lastCommonIndex);
    lastCommonIndex = idx;

    const replyTo = m.quoted?.sender || null;

    const humillaText = replyTo
      ? `@${shortWho}, dijiste eso respondiendo a @${(replyTo.split('@')[0])} — mala idea 😹`
      : frasesComunes[idx];

    await conn.sendMessage(m.chat, {
      text: humillaText,
      mentions: replyTo ? [who, replyTo] : [who]
    });

    await delay(3000);

    try { await conn.groupParticipantsUpdate(m.chat, [who], 'remove'); } catch (err) { console.error('Remove common error:', err); }

    await conn.sendMessage(m.chat, { text: `Otro payaso que no aguantó 😹` });

  } catch (err) {
    console.error('Error en autokick Te eliminó (Sorpresa B Ultra):', err);
  }
};

// Delay helper
function delay(ms) { return new Promise(res => setTimeout(res, ms)); }

// HANDLER: internal trigger detecta todas las variantes
handler.customPrefix = /^(te[\s\S]{0,40})$/i;
handler.command = new RegExp();

export default handler;
