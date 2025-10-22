// plugins/ruletaban.js
// Comando: .ruletaban
// Solo admins y owner pueden usarlo. Elimina un miembro aleatorio del grupo.

let handler = async (m, { conn, isAdmin, isOwner, groupMetadata }) => {
  try {
    if (!m.isGroup) return conn.sendMessage(m.chat, { text: '❌ Este comando solo funciona en grupos.' }, { quoted: m });
    if (!isAdmin && !isOwner) return conn.sendMessage(m.chat, { text: '🚫 Solo los administradores o el dueño pueden usar esta ruleta.' }, { quoted: m });

    const participants = groupMetadata.participants;
    const botNumber = conn.user.jid;
    const ownerNumbers = ['59898719147@s.whatsapp.net', '59896026646@s.whatsapp.net']; // Dueños protegidos

    // Filtrar: sin admins, sin el bot, sin dueños
    const candidates = participants.filter(p =>
      !p.admin && p.id !== botNumber && !ownerNumbers.includes(p.id)
    );

    if (candidates.length === 0)
      return conn.sendMessage(m.chat, { text: '😅 No hay usuarios elegibles para la ruleta.' }, { quoted: m });

    // Elegir uno al azar
    const randomUser = candidates[Math.floor(Math.random() * candidates.length)];

    await conn.sendMessage(m.chat, {
      text: `🎯 *Ruleta Ban* 🎯\n\nEl usuario elegido al azar es... *@${randomUser.id.split('@')[0]}* 😈💥\n\n¡Adiós, soldado!`,
      mentions: [randomUser.id]
    });

    // Esperar un poco antes de eliminar
    await new Promise(r => setTimeout(r, 2500));

    await conn.groupParticipantsUpdate(m.chat, [randomUser.id], 'remove');

  } catch (err) {
    console.error('Error en ruletaban:', err);
    conn.sendMessage(m.chat, { text: `⚠️ Error: ${err.message}` }, { quoted: m });
  }
};

handler.help = ['ruletaban'];
handler.tags = ['group', 'fun'];
handler.command = /^ruletaban$/i;
handler.admin = true;
handler.group = true;

export default handler;
