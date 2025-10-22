// plugins/ruletaban.js
// Comando: .ruletaban
// Solo para admins y owners
// Elimina un usuario al azar del grupo (que no sea admin, dueño ni el bot)

let handler = async (m, { conn, isAdmin, isOwner }) => {
  try {
    if (!m.isGroup) return conn.reply(m.chat, '⚠️ Este comando solo funciona en grupos.', m);
    if (!isAdmin && !isOwner)
      return conn.reply(m.chat, '🚫 Solo los administradores o el dueño pueden usar esta ruleta mortal.', m);

    const groupMetadata = await conn.groupMetadata(m.chat);
    const botNumber = conn.user.jid;
    const ownerNumbers = ['59896026646@s.whatsapp.net', '59898719147@s.whatsapp.net'];

    // Asegura que el bot es admin
    const botData = groupMetadata.participants.find(p => p.id === botNumber);
    if (!botData?.admin)
      return conn.reply(m.chat, '⚠️ No puedo eliminar a nadie, no soy administrador del grupo.', m);

    // Filtrar posibles víctimas
    const candidates = groupMetadata.participants.filter(p =>
      !p.admin && !ownerNumbers.includes(p.id) && p.id !== botNumber
    );
    if (candidates.length === 0)
      return conn.reply(m.chat, '😅 No hay nadie que pueda ser eliminado (todos son admins o dueños).', m);

    const unlucky = candidates[Math.floor(Math.random() * candidates.length)];

    const frases = [
      '🎯 La suerte está echada...',
      '🔫 Preparando el destino...',
      '💀 Girando la ruleta...',
      '🎰 ¿Quién será el desafortunado?',
      '☠️ Que empiece el juego...'
    ];

    await conn.reply(m.chat, frases[Math.floor(Math.random() * frases.length)], m);
    await new Promise(res => setTimeout(res, 2500));

    const unluckyName = await conn.getName(unlucky.id);
    await conn.sendMessage(m.chat, {
      text: `💥 *${unluckyName}* fue eliminado por la ruleta del destino 😈`,
      mentions: [unlucky.id]
    });

    // --- 🔥 Eliminación forzada compatible con Gaara-Ultra-MD ---
    try {
      // Intenta método interno si existe
      if (typeof conn.groupRemove === 'function') {
        await conn.groupRemove(m.chat, [unlucky.id]);
      } else {
        // Si no, usa el socket directo
        await conn.query({
          tag: 'iq',
          attrs: { type: 'set', xmlns: 'w:g2', to: m.chat },
          content: [
            {
              tag: 'remove',
              attrs: {},
              content: [{ tag: 'participant', attrs: { jid: unlucky.id } }]
            }
          ]
        });
      }
      console.log(`[RULETABAN] Eliminado: ${unlucky.id}`);
    } catch (err) {
      console.error(`[RULETABAN-ERROR]`, err);
      await conn.reply(
        m.chat,
        `⚠️ No pude eliminar a @${unlucky.id.split('@')[0]} (quizás ya salió o WhatsApp bloqueó la acción).`,
        m,
        { mentions: [unlucky.id] }
      );
    }
  } catch (err) {
    console.error('[RULETABAN-FATAL]', err);
    conn.reply(m.chat, '❌ Ocurrió un error interno al ejecutar la ruletaban.', m);
  }
};

handler.command = /^ruletaban$/i;
handler.group = true;
export default handler;
