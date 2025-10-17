// plugins/_autokick-te-elimino.js

let lastCommonIndex = -1;
let lastOwnerIndex = -1;
let lastProtectedIndex = -1;

let handler = async (m, { conn, participants }) => {
  try {
    if (!m.isGroup) return;

    const texto = m.text ? m.text.trim() : '';
    if (texto !== 'Te eliminó.') return;

    const who = m.sender;
    const numero = who.split("@")[0];

    // Configurar owners y número protegido
    const owners = ['59898719147','59896026646'];
    const protegida = '59892975182';

    // Mensajes aleatorios
    const frasesComunes = [
      `${numero}, eres un gil, fuera del grupo 😹`,
      `${numero}, bobo/a, te eliminé yo 😎`
    ];

    const frasesOwners = [
      `${numero}, jaja dueño/a, no te hagas el vivo 😏`,
      `${numero}, no puedo expulsarte, pero te mereces un tirón de orejas 😈`
    ];

    const frasesProtegida = [
      `${numero}, 🌸 eres muy especial y no puedo expulsarte 😇💕`,
      `${numero}, 💖 que linda eres, tranquila 😘`,
      `${numero}, ✨ no te puedo tocar, eres protegida 😍`
    ];

    // Obtener info del usuario en el grupo
    const groupMetadata = await conn.groupMetadata(m.chat);
    const participant = groupMetadata.participants.find(p => p.id === who);
    const isAdmin = participant?.admin;

    // ------------------------
    // Número protegido (mujer)
    if (numero === protegida) {
      let index;
      do { index = Math.floor(Math.random() * frasesProtegida.length); } while (index === lastProtectedIndex);
      lastProtectedIndex = index;
      await conn.sendMessage(m.chat, { text: frasesProtegida[index] }, { quoted: m });
      return;
    }

    // Owner
    if (owners.includes(numero)) {
      let index;
      do { index = Math.floor(Math.random() * frasesOwners.length); } while (index === lastOwnerIndex);
      lastOwnerIndex = index;
      await conn.sendMessage(m.chat, { text: frasesOwners[index] }, { quoted: m });
      return;
    }

    // Admin (no owner ni protegido)
    if (isAdmin) {
      await conn.groupParticipantsUpdate(m.chat, [who], 'demote');
      await conn.sendMessage(m.chat, { text: `⚠️ ${numero}, se te quitó el admin por mandar "Te eliminó." 😅` });
      return;
    }

    // Usuario común
    let index;
    do { index = Math.floor(Math.random() * frasesComunes.length); } while (index === lastCommonIndex);
    lastCommonIndex = index;

    // Expulsa y manda mensaje grosero
    await conn.groupParticipantsUpdate(m.chat, [who], 'remove');
    await conn.sendMessage(m.chat, { text: frasesComunes[index] });

  } catch (err) {
    console.error('Error en autokick Te eliminó:', err);
  }
};

// Configuración del plugin
handler.customPrefix = /^Te eliminó\.$/i;
handler.command = new RegExp();
export default handler;
