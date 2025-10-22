// plugins/ruletaban.js
// Comando: .ruletaban
// Juego exclusivo para admins y owners.
// Elimina a un usuario aleatorio del grupo (que no sea admin, dueño ni el bot).

let handler = async (m, { conn, isAdmin, isOwner }) => {
  try {
    if (!m.isGroup) {
      await conn.sendMessage(m.chat, { text: '⚠️ Este comando solo funciona en grupos.' }, { quoted: m });
      return;
    }

    if (!isAdmin && !isOwner) {
      await conn.sendMessage(m.chat, { text: '🚫 Solo los administradores pueden usar esta ruleta mortal.' }, { quoted: m });
      return;
    }

    const groupMetadata = await conn.groupMetadata(m.chat);
    const botNumber = conn.user.id || conn.user.jid;
    const ownerNumbers = ['59896026646@s.whatsapp.net', '59898719147@s.whatsapp.net'];

    // Verifica que el bot sea admin
    const botData = groupMetadata.participants.find(p => p.id === botNumber);
    if (!botData?.admin) {
      await conn.sendMessage(m.chat, { text: '⚠️ No puedo eliminar a nadie, no soy administrador del grupo.' }, { quoted: m });
      return;
    }

    // Filtrar candidatos válidos
    const candidates = groupMetadata.participants.filter(p =>
      !p.admin && !ownerNumbers.includes(p.id) && p.id !== botNumber
    );

    if (candidates.length === 0) {
      await conn.sendMessage(m.chat, { text: '😅 No hay nadie que pueda ser eliminado (todos son admins o dueños).' }, { quoted: m });
      return;
    }

    // Elegir al azar
    const unlucky = candidates[Math.floor(Math.random() * candidates.length)];

    const frases = [
      '🎯 La suerte está echada...',
      '🔫 Preparando el destino...',
      '💀 Girando la ruleta...',
      '🎰 ¿Quién será el desafortunado?',
      '☠️ Que empiece el juego...'
    ];

    await conn.sendMessage(m.chat, { text: frases[Math.floor(Math.random() * frases.length)] }, { quoted: m });

    await new Promise(res => setTimeout(res, 2500));

    const unluckyName = await conn.getName(unlucky.id);
    await conn.sendMessage(
      m.chat,
      {
        text: `💥 *${unluckyName}* fue eliminado por la ruleta del destino 😈`,
        mentions: [unlucky.id]
      },
      { quoted: m }
    );

    // Intentar eliminar al usuario
    try {
      await conn.groupParticipantsUpdate(m.chat, [unlucky.id], 'remove');
      console.log(`[RULETABAN] ${unlucky.id} eliminado de ${groupMetadata.subject}`);
    } catch (err) {
      console.log(`[RULETABAN] No se pudo eliminar: ${err.message}`);
      await conn.sendMessage(
        m.chat,
        { text: `⚠️ No pude eliminar a @${unlucky.id.split('@')[0]} (quizás WhatsApp lo bloqueó).`, mentions: [unlucky.id] },
        { quoted: m }
      );
    }

  } catch (err) {
    console.error('[RULETABAN ERROR]', err);
    await conn.sendMessage(m.chat, { text: '❌ Ocurrió un error al ejecutar la ruletaban.' }, { quoted: m });
  }
};

handler.help = ['ruletaban'];
handler.tags = ['game', 'group'];
handler.command = /^ruletaban$/i;
handler.group = true;

export default handler;
