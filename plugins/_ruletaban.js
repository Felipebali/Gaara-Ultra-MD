// plugins/ruletaban.js
// Comando: .ruletaban
// Solo para admins y owners
// Elimina un usuario al azar (que no sea admin ni el bot)

let handler = async (m, { conn, participants, isAdmin, isOwner }) => {
  try {
    if (!m.isGroup) return conn.reply(m.chat, '⚠️ Este comando solo funciona en grupos.', m);
    if (!isAdmin && !isOwner) return conn.reply(m.chat, '🚫 Solo los administradores pueden usar esta ruleta mortal.', m);

    const groupMetadata = await conn.groupMetadata(m.chat);
    const botNumber = conn.user.jid;
    const ownerNumbers = ['59896026646@s.whatsapp.net', '59898719147@s.whatsapp.net']; // Números dueños

    // Filtra usuarios que pueden ser elegidos
    const candidates = groupMetadata.participants.filter(p =>
      !p.admin && !ownerNumbers.includes(p.id) && p.id !== botNumber
    );

    if (candidates.length === 0) return conn.reply(m.chat, '😅 No hay nadie a quien eliminar (todos son admins o dueños).', m);

    // Usuario aleatorio
    const unlucky = candidates[Math.floor(Math.random() * candidates.length)];

    // Mensaje previo divertido
    const frases = [
      '🎯 La suerte está echada...',
      '🔫 Preparando el destino...',
      '💀 Girando la ruleta...',
      '🎰 ¿Quién será el desafortunado?',
      '☠️ Que empiece el juego...'
    ];
    await conn.reply(m.chat, frases[Math.floor(Math.random() * frases.length)], m);

    // Espera 2 segundos antes de eliminar
    await new Promise(res => setTimeout(res, 2000));

    // Anuncia el eliminado
    await conn.reply(m.chat, `💥 *${await conn.getName(unlucky.id)}* fue eliminado por la ruleta del destino 😈`, m, {
      mentions: [unlucky.id]
    });

    // Elimina del grupo
    await conn.groupParticipantsUpdate(m.chat, [unlucky.id], 'remove');

  } catch (err) {
    console.error(err);
    conn.reply(m.chat, '❌ Ocurrió un error al ejecutar la ruletaban.', m);
  }
};

handler.command = /^ruletaban$/i;
handler.group = true;

export default handler;
