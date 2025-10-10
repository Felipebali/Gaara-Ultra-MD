const handler = async (m, { conn, isAdmin, isOwner }) => {
  const emoji = '🔪';

  if (!isAdmin && !isOwner)
    return conn.reply(m.chat, '❌ Solo admins del grupo o dueños del bot pueden usar este comando.', m);

  // Detectar usuario a expulsar
  let user = m.mentionedJid?.[0] || m.quoted?.sender;
  if (!user) return conn.reply(m.chat, '📌 Debes mencionar o citar un mensaje para expulsar.', m);

  // Normalizar JID a minúsculas y sin '+'
  const normalize = jid => String(jid || '').replace(/\+/g, '').toLowerCase();
  const userNormalized = normalize(user);
  const botNormalized = normalize(conn.user?.jid);

  // Metadata del grupo
  const groupInfo = await conn.groupMetadata(m.chat);
  const ownerGroupNormalized = normalize(groupInfo.owner || m.chat.split`-`[0]);

  // ---------- LID: lista de IDs protegidos ----------
  // Formato: [ID, Nombre, isOwner]
  const lid = [
    ['59898719147', 'Feli', true],
    ['59896026646', 'G', true],
    ['119069730668723', 'FeliLID', true],
    ['262573496758272', 'GerLID', true]
  ];

  // Normalizar solo los IDs y guardarlos en un array
  const protectedList = [
    botNormalized,
    ownerGroupNormalized,
    ...lid.map(x => normalize(x[0]))
  ];

  // Verificar si el usuario a expulsar está protegido
  const isProtected = protectedList.some(p => userNormalized.endsWith(p));
  if (isProtected) return conn.reply(m.chat, 'Es imposible eliminar a alguien protegido. 😎', m);

  // Comprobar si el objetivo es admin del grupo
  const participant = groupInfo.participants.find(p => normalize(p.jid) === userNormalized) || {};
  const targetIsAdmin = !!participant.admin;

  if (targetIsAdmin && !isOwner) {
    return conn.reply(m.chat, '❌ No puedes expulsar a otro administrador. Solo los dueños del bot pueden hacerlo.', m);
  }

  // Expulsar y limpiar chat
  try {
    await conn.groupParticipantsUpdate(m.chat, [user], 'remove');
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
handler.admin = true;
handler.group = true;
handler.register = true;
handler.botAdmin = true;

export default handler;
