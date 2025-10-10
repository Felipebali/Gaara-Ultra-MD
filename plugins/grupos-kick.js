const handler = async (m, { conn, isAdmin }) => {
  const emoji = '🔪';
  const sender = m.sender.replace(/\D/g, '');

  const groupInfo = await conn.groupMetadata(m.chat);
  const ownerGroup = groupInfo.owner.replace(/\D/g, '');
  const botJid = conn.user.jid.replace(/\D/g, '');

  // Lista de números owners/protegidos
  const ownersBot = ['59898719147','59896026646']; // dueños del bot

  // ---------- PERMISO ----------
  // Permite: admins del grupo, dueños del bot, dueño del grupo
  if (!isAdmin && !ownersBot.includes(sender) && sender !== ownerGroup) {
    return conn.reply(m.chat, '❌ Solo admins, dueño del grupo o dueños del bot pueden usar este comando.', m);
  }

  // ---------- DETECTAR USUARIO ----------
  let user = m.mentionedJid?.[0] || m.quoted?.sender;
  if (!user) return conn.reply(m.chat, '📌 Debes mencionar o citar un mensaje para expulsar.', m);

  const normalize = jid => String(jid || '').replace(/\D/g, '');
  const userNorm = normalize(user);

  // ---------- PROTEGIDOS ----------
  const protectedList = [...ownersBot, botJid, ownerGroup];
  if (protectedList.includes(userNorm)) {
    return conn.reply(m.chat, '😎 Es imposible eliminar a alguien protegido.', m);
  }

  // Comprobar si es admin del grupo
  const participant = groupInfo.participants.find(p => normalize(p.jid) === userNorm) || {};
  const targetIsAdmin = !!participant.admin;

  // Bloquear expulsión de otros admins si no sos owner del bot
  if (targetIsAdmin && !ownersBot.includes(sender)) {
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
handler.admin = true;    
handler.group = true;
handler.register = true;
handler.botAdmin = true;

export default handler;
