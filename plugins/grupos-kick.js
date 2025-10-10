const handler = async (m, { conn, isAdmin, isOwner }) => {
  const emoji = '🔪';

  // ---------- PERMISO ----------
  if (!isAdmin && !isOwner) return conn.reply(m.chat, '❌ Solo admins del grupo o dueños del bot pueden usar este comando.', m);

  // ---------- DETECTAR USUARIO ----------
  let user = m.mentionedJid?.[0] || m.quoted?.sender;
  if (!user) return conn.reply(m.chat, '📌 Debes mencionar o citar un mensaje para expulsar.', m);

  // ---------- NORMALIZAR ----------
  const normalize = jid => String(jid || '').replace(/\D/g, '');
  const userNorm = normalize(user);
  const botNorm = normalize(conn.user?.jid);
  const groupInfo = await conn.groupMetadata(m.chat);
  const ownerGroupNorm = normalize(groupInfo.owner || m.chat.split`-`[0]);

  // ---------- PROTEGIDOS ----------
  const protectedList = [
    '59898719147', // Feli
    '59896026646', // otro owner
    botNorm,
    ownerGroupNorm
  ];

  // Buscar participante real
  const participant = groupInfo.participants.find(p => normalize(p.jid) === userNorm) || {};
  const targetJid = normalize(participant.jid || user);

  // Bloquear si está protegido
  if (protectedList.some(p => targetJid.endsWith(p))) {
    return conn.reply(m.chat, '😎 Es imposible eliminar a alguien protegido.', m);
  }

  // Si es admin y quien ejecuta no es owner -> bloquear
  const targetIsAdmin = !!participant.admin;
  if (targetIsAdmin && !isOwner) {
    return conn.reply(m.chat, '❌ No puedes expulsar a otro administrador. Solo los dueños del bot pueden hacerlo.', m);
  }

  // ---------- EXPULSAR ----------
  try {
    await conn.groupParticipantsUpdate(m.chat, [participant.jid || user], 'remove');
    try { await m.react(emoji); } catch {}
    try { await conn.deleteMessage(m.chat, m.key); } catch {}
  } catch (err) {
    console.log('Error expulsando:', err);
    return conn.reply(m.chat, '❌ Ocurrió un error al intentar expulsar. Asegúrate de que el bot sea administrador y tenga permisos.', m);
  }
};

handler.help = ['k'];
handler.tags = ['grupo'];
handler.command = ['k','echar','hechar','sacar','ban'];
handler.admin = true;    // meta-info, la lógica permite owner aunque no admin
handler.group = true;
handler.register = true;
handler.botAdmin = true;

export default handler;
