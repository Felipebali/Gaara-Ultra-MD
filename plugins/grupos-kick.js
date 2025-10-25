const handler = async (m, { conn, isAdmin }) => {
  const emoji = '🔪';
  const sender = m.sender.replace(/\D/g, '');

  const groupInfo = await conn.groupMetadata(m.chat);
  const ownerGroup = groupInfo.owner.replace(/\D/g, '');
  const botJid = conn.user.jid.replace(/\D/g, '');

  const ownersBot = ['59898719147','59896026646']; // dueños del bot

  // ---------- PERMISO ----------
  if (!isAdmin && !ownersBot.includes(sender) && sender !== ownerGroup) {
    return conn.reply(m.chat, '❌ Solo admins, dueño del grupo o dueños del bot pueden usar este comando.', m);
  }

  // ---------- DETECTAR USUARIO ----------
  let user = m.mentionedJid?.[0] || m.quoted?.sender;
  if (!user) return conn.reply(m.chat, '📌 Debes mencionar o citar un mensaje para expulsar.', m);

  const normalize = jid => String(jid || '').replace(/\D/g, '');
  const userNorm = normalize(user);

  const protectedList = [...ownersBot, botJid, ownerGroup];

  // ---------- PROTEGIDOS ----------
  if (!ownersBot.includes(sender) && protectedList.includes(userNorm)) {
    return conn.reply(m.chat, '😎 Es imposible eliminar a alguien protegido.', m);
  }

  // Comprobar si es admin del grupo
  const participant = groupInfo.participants.find(p => normalize(p.jid) === userNorm) || {};
  const targetIsAdmin = !!participant.admin;

  // ---------- LÓGICA DE EXPULSIÓN ----------
  if (!ownersBot.includes(sender)) {
    // Admin normal: solo puede eliminar usuarios que NO sean admins
    if (targetIsAdmin) {
      return conn.reply(m.chat, '❌ No puedes expulsar a otro administrador. Solo los dueños del bot pueden hacerlo.', m);
    }
  }
  // Owners del bot pueden eliminar a todos (usuarios y admins)

  // ---------- EXPULSAR ----------
  try {
    await conn.groupParticipantsUpdate(m.chat, [participant.jid || user], 'remove');

    // Reacción
    try { await m.react(emoji); } catch {}

    // Borrar mensaje original
    try { await conn.deleteMessage(m.chat, m.key); } catch {}

    // ---------- MENSAJE CLICKEABLE ----------
    const userName = '@' + (participant.jid || user).split('@')[0];
    await conn.sendMessage(m.chat, {
      text: `🚫 ${userName} fue expulsado.`,
      mentions: [participant.jid || user]
    });

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
