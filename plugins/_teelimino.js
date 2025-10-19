// plugins/_autokick-te-elimino.js

let lastCommonIndex = -1;
let lastOwnerIndex = -1;
let lastProtectedIndex = -1;

// Sistema de advertencias para admins
let adminWarnings = {}; // { "numero": cantidad }

let handler = async (m, { conn }) => {
  try {
    if (!m.isGroup) return;

    const texto = m.text ? m.text.trim() : '';
    const who = m.sender;

    const owners = ['59898719147','59896026646']; // dueños
    const protegida = '59892975182'; // protegida

    // Frases
    const frasesComunes = [
      `@${who.split("@")[0]}, sos terrible ganso, afuera 😹`,
      `@${who.split("@")[0]}, payaso detectado, andá a dormir 😎`
    ];

    const frasesOwners = [
      `Tranquilo capo, vos mandás acá 😎`,
      `Dueño supremo detectado, siga nomás 😏`
    ];

    const frasesProtegida = [
      `@${who.split("@")[0]}, 🌸 tú no preciosa 😍`,
      `@${who.split("@")[0]}, 💖 contigo todo bien ✨`,
      `@${who.split("@")[0]}, 😘 jamás te tocaría`
    ];

    const groupMetadata = await conn.groupMetadata(m.chat);
    const participant = groupMetadata.participants.find(p => p.id === who);
    const isAdmin = participant?.admin;

    // PROTEGIDA
    if (who.split("@")[0] === protegida) {
      let index;
      do index = Math.floor(Math.random() * frasesProtegida.length);
      while (index === lastProtectedIndex);
      lastProtectedIndex = index;
      return conn.sendMessage(m.chat, { 
        text: frasesProtegida[index], 
        mentions: [who] 
      });
    }

    // OWNER
    if (owners.includes(who.split("@")[0])) {
      let index;
      do index = Math.floor(Math.random() * frasesOwners.length);
      while (index === lastOwnerIndex);
      lastOwnerIndex = index;
      return conn.sendMessage(m.chat, { 
        text: frasesOwners[index]
      });
    }

    // ADMIN (2 advertencias)
    if (isAdmin) {
      const num = who.split("@")[0];
      adminWarnings[num] = (adminWarnings[num] || 0) + 1;

      if (adminWarnings[num] === 1) {
        await conn.groupParticipantsUpdate(m.chat, [who], 'demote');
        await conn.sendMessage(m.chat, {
          text: `⚠️ @${who.split("@")[0]}, primera advertencia.\nNo mandes "te eliminó" de vuelta o te vas.`,
          mentions: [who]
        });
        return;
      }

      if (adminWarnings[num] >= 2) {
        await conn.groupParticipantsUpdate(m.chat, [who], 'remove');
        await conn.sendMessage(m.chat, {
          text: `🚫 @${who.split("@")[0]} fue expulsado por insistir.`,
          mentions: [who]
        });
        return;
      }
    }

    // USUARIO COMÚN
    let index;
    do index = Math.floor(Math.random() * frasesComunes.length);
    while (index === lastCommonIndex);
    lastCommonIndex = index;

    await conn.groupParticipantsUpdate(m.chat, [who], 'remove');
    await conn.sendMessage(m.chat, { 
      text: frasesComunes[index], 
      mentions: [who] 
    });

  } catch (e) {
    console.error('Error en autokick Te eliminó:', e);
  }
};

handler.customPrefix = /^(te eliminó\.?|te elimino\.?|te eliminaron\.?|te echaron\.?|fuera|rajá|andate)$/i;
handler.command = new RegExp;
export default handler;
