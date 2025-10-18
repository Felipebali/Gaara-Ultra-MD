// plugins/_autokick-te-elimino.js
// Autokick "Sorpresa B" - Bardo + Humillación
// Compatible con Baileys-style conn.sendMessage / conn.groupParticipantsUpdate

let lastCommonIndex = -1;
let lastOwnerIndex = -1;
let lastProtectedIndex = -1;
let lastActionTime = 0; // para evitar dobles acciones rápidas
const ACTION_COOLDOWN_MS = 3000; // evita re-ejecuciones inmediatas

let handler = async (m, { conn }) => {
  try {
    if (!m.isGroup) return; // Solo grupos

    // Solo texto (no procesamos stickers/imagenes)
    const texto = m.text ? m.text.trim() : '';
    if (!texto) return;

    // Evitar acciones dobles en ventanas muy cortas
    const now = Date.now();
    if (now - lastActionTime < ACTION_COOLDOWN_MS) return;
    // NOTA: se actualizará cuando realmente hagamos una acción.

    const who = m.sender; // JID completo
    const shortWho = who.split('@')[0];

    // Configurar owners y número protegido
    const owners = ['59898719147','59896026646']; // owners (no tocar)
    const protegida = '59892975182'; // mujer protegida

    // Mensajes aleatorios (Bardo inteligente)
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

    // Obtener info del usuario en el grupo (metadata)
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
    // PROTECCIONES PRIMARIAS: protegida / owners
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
    // DETECCIÓN ULTRA-ROBUSTA DE "te eliminó" (solo texto)
    // Esta regex tolera múltiples espacios, símbolos, sustituciones (1,!,|,I,l), sin/ con acento,
    // letras repetidas y texto extra al final.
    const trigger = /t[\W_]*e[\W_]*[eêé3]?[\W_]*[il1!|łILI]{1,2}[\W_]*i{0,2}m{0,2}i?n{0,2}[oóu]?s?[\W_]*o{0,5}(\b|\.|$)/i;

    // También admite casos donde hay "te elimino" con texto adicional (ej: "te elimino gil")
    // y variantes deformadas como "te eIimino", "te e1imino", "t e - e l i m i n o", etc.
    if (!trigger.test(texto)) return;

    // Si llegamos acá, el texto coincide con la activación
    // Actualizamos cooldown para evitar doble ejecución en bucle
    lastActionTime = now;

    // Si es admin (y no owner ni protegida) -> primero degradamos, humillamos, y luego expulsamos
    if (isAdmin) {
      // Humillación: respondemos enseguida y luego demote + remove
      await conn.sendMessage(m.chat, {
        text: `@${shortWho}, ⚠️ se te quitó el admin por mandar "${texto}" 😅`,
        mentions: [who]
      });

      // degradar admin
      try {
        await conn.groupParticipantsUpdate(m.chat, [who], 'demote');
      } catch (err) {
        console.error('Error al demotear admin:', err);
      }

      // Delay humillación (3 segundos) antes de expulsar
      await delay(3000);

      try {
        await conn.groupParticipantsUpdate(m.chat, [who], 'remove');
      } catch (err) {
        console.error('Error al expulsar admin:', err);
      }

      // Frase final (opción B - Humillación)
      await conn.sendMessage(m.chat, { text: `Otro payaso que no aguantó 😹` });
      return;
    }

    // Usuario común: modo Humillación (responde + delay + expulsa + frase B)
    // Respuesta inmediata humillante (bardo inteligente)
    let idx;
    do { idx = Math.floor(Math.random() * frasesComunes.length); } while (idx === lastCommonIndex);
    lastCommonIndex = idx;

    // Si el mensaje fue en reply a otro usuario, humillación se orienta al emisor
    const replyTo = m.quoted?.sender || null;

    // Mensaje inicial de humillación
    const humillaText = replyTo
      ? `@${shortWho}, dijiste eso respondiendo a @${(replyTo.split('@')[0])} — mala idea 😹`
      : frasesComunes[idx];

    await conn.sendMessage(m.chat, {
      text: humillaText,
      mentions: replyTo ? [who, replyTo] : [who]
    });

    // Espera corta para plus de humillación
    await delay(3000);

    // Expulsar
    try {
      await conn.groupParticipantsUpdate(m.chat, [who], 'remove');
    } catch (err) {
      console.error('Error al expulsar usuario común:', err);
    }

    // Frase final (opción B - Humillación)
    await conn.sendMessage(m.chat, { text: `Otro payaso que no aguantó 😹` });

  } catch (err) {
    console.error('Error en autokick Te eliminó (Sorpresa B):', err);
  }
};

// Helper delay
function delay(ms) {
  return new Promise(res => setTimeout(res, ms));
}

// HANDLER: regex que dispara el plugin cuando el mensaje EXACTO trate de coincidir con variantes.
// Dejamos handler.customPrefix simple (Baileys plugin loader usará esto); pero la detección real
// se hace dentro del handler con la regex "trigger" para mayor control (y así no dependemos solo del prefix).
handler.customPrefix = /^(te[\s\S]{0,40})$/i; // permitimos pasar textos cortos; verificación real internamente
handler.command = new RegExp(); // permite que el loader lo registre como plugin activo

export default handler;
