const handler = async (m, { conn, participants, isOwner }) => {
  let user = m.mentionedJid?.[0] || m.quoted?.sender;
  if (!user) return;

  const creador = '59898719147@s.whatsapp.net'; // Tu número protegido
  const bot = conn.user.jid;

  // Nadie puede eliminar al creador, excepto él mismo
  if (user === creador) {
    return conn.reply(m.chat, `Estas loco? Como voy a eliminar a mi creador.`, m);
  }

  // Nadie toca al bot
  if (user === bot) {
    return conn.reply(m.chat, `No puedo eliminarme a mi mismo.`, m);
  }

  // Si NO es owner, solo puede eliminar si es admin
  if (!isOwner && !participants.find(p => p.id === m.sender && p.admin)) {
    return; // silencioso
  }

  // El owner puede eliminar a cualquiera
  try {
    await conn.groupParticipantsUpdate(m.chat, [user], 'remove');
    await m.react('✅');
  } catch {
    await m.react('✖️');
  }
};

handler.help = ['k'];
handler.tags = ['grupo'];
handler.command = ['k','echar','sacar','ban'];
handler.group = true;
handler.botAdmin = true;

export default handler;
