// plugins/tagall2-ultra-fake.js
let handler = async (m, { conn, participants, isAdmin, isOwner }) => {
  try {
    if (!m.isGroup) return m.reply('❌ Solo funciona en grupos.');

    // Solo admins o dueños
    if (!(isAdmin || isOwner)) {
      const frasesFail = [
        '⛔ Comando restringido. Necesitás rango de oficial.',
        '⚠️ Solo administradores o dueños pueden ejecutar órdenes de este nivel.',
        '❌ Acceso denegado: no tenés autorización para activar esta función.'
      ];
      return m.reply(frasesFail[Math.floor(Math.random() * frasesFail.length)]);
    }

    // Participantes del grupo
    const users = participants.map(u => u.id).filter(u => !u.endsWith('g.us'));
    if (users.length < 2) return m.reply('❌ No hay suficientes miembros para etiquetar.');

    // Elegir usuario al azar (el "culpable")
    const fakeUser = users[Math.floor(Math.random() * users.length)];

    // Crear lista oculta de menciones (todos menos el fake)
    const hiddenMentions = users.filter(u => u !== fakeUser);

    // Frases épicas randomizadas
    const frases = [
      `😳 @${fakeUser.split('@')[0]} acaba de detonar el TAGALL 💣`,
      `⚡ @${fakeUser.split('@')[0]} activó el protocolo “CAOS TOTAL” ⚡`,
      `😂 @${fakeUser.split('@')[0]} mencionó a todos sin miedo alguno 😎`,
      `🫣 @${fakeUser.split('@')[0]} dijo: “que se entere todo el mundo 🔥”`,
      `💀 @${fakeUser.split('@')[0]} rompió el botón rojo del grupo 💥`,
      `👀 @${fakeUser.split('@')[0]} soltó el hechizo prohibido .tagall2 🪄`,
      `💬 @${fakeUser.split('@')[0]} quiso llamar la atención... y vaya que lo logró 😅`,
      `🎭 @${fakeUser.split('@')[0]} jugó con fuego y ahora todos lo saben 🔥`,
      `🐾 @${fakeUser.split('@')[0]} invocó al clan completo FelixCat 😼`,
      `🚨 @${fakeUser.split('@')[0]} inició una operación de llamada global 📢`
    ];

    const texto = frases[Math.floor(Math.random() * frases.length)];

    // Envío sin quote, con mención visible al fakeUser y oculta al resto
    await conn.sendMessage(m.chat, {
      text: texto,
      mentions: [fakeUser, ...hiddenMentions]
    });

  } catch (err) {
    console.error('tagall2-ultra-fake error:', err);
    m.reply('❌ Ocurrió un error inesperado.');
  }
};

handler.command = /^tagall2$/i;
handler.group = true;

export default handler;
