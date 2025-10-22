// plugins/ruletaban.js
// Comando: .ruletaban
// Solo para admins y owners
// Elimina un usuario al azar (que no sea admin, dueño ni bot)

let handler = async (m, { conn, isAdmin, isOwner }) => {
  try {
    if (!m.isGroup) return conn.reply(m.chat, '⚠️ Este comando solo funciona en grupos.', m);
    if (!isAdmin && !isOwner) return conn.reply(m.chat, '🚫 Solo los administradores o el dueño pueden usar esta ruleta mortal.', m);

    const groupMetadata = await conn.groupMetadata(m.chat);
    const botNumber = conn.user.jid;
    const ownerNumbers = ['59896026646@s.whatsapp.net', '59898719147@s.whatsapp.net'];

    // Bot debe ser admin
    const botInGroup = groupMetadata.participants.find(p => p.id === botNumber);
    if (!botInGroup?.admin) return conn.reply(m.chat, '⚠️ No puedo eliminar a nadie, no soy administrador.', m);

    // Candidatos válidos
    const candidates = groupMetadata.participants.filter(p =>
      !p.admin && !ownerNumbers.includes(p.id) && p.id !== botNumber
    );

    if (candidates.length === 0) return conn.reply(m.chat, '😅 No hay nadie que pueda ser eliminado (todos son admins o dueños).', m);

    const unlucky = candidates[Math.floor(Math.random() * candidates.length)];

    // Frases previas
    const frases = [
      '🎯 La suerte está echada...',
      '🔫 Preparando el destino...',
      '💀 Girando la ruleta...',
      '🎰 ¿Quién será el desafortunado?',
      '☠️ Que empiece el juego...'
    ];

    await conn.reply(m.chat, frases[Math.floor(Math.random() * frases.length)], m);
    await new Promise(res => setTimeout(res, 2500));

    // Anuncio final
    await conn.reply(m.chat, `💥 *${await conn.getName(unlucky.id)}* fue eliminado por la ruleta del destino 😈`, m, {
      mentions: [unlucky.id]
    });

    // Intento de expulsión con verificación
    try {
      await conn.groupParticipantsUpdate(m.chat, [unlucky.id], 'remove');
      console.log(`[RULETABAN] Eliminado: ${unlucky.id}`);
    } catch (e) {
      console.error(`[RULETABAN ERROR]`, e);
      await conn.reply(m.chat, `⚠️ No pude eliminar a @${unlucky.id.split('@')[0]} (quizás ya salió o WhatsApp bloqueó la acción).`, m, {
        mentions: [unlucky.id]
      });
    }

  } catch (err) {
    console.error('[RULETABAN FATAL]', err);
    conn.reply(m.chat, '❌ Ocurrió un error interno al ejecutar la ruletaban.', m);
  }
};

handler.command = /^ruletaban$/i;
handler.group = true;

export default handler;
