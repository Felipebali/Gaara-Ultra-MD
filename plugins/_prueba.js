const handler = async (m, { conn }) => {
  const emoji = '🔪';
  const sender = m.sender.replace(/\D/g, '');

  // Info del grupo
  const groupInfo = await conn.groupMetadata(m.chat);
  const ownerGroup = groupInfo.owner.replace(/\D/g, '');
  const botJid = conn.user.jid.replace(/\D/g, '');

  // Owners del bot
  const ownersBot = ['59898719147','59896026646'];
  const protectedList = [...ownersBot, botJid, ownerGroup];

  // Usuario a expulsar
  let user = m.mentionedJid?.[0] || m.quoted?.sender;
  if (!user) return;

  const normalize = jid => String(jid || '').replace(/\D/g, '');
  const userNorm = normalize(user);

  // Bloquear protegidos
  if (protectedList.includes(userNorm)) return;

  // Comprobar participante a expulsar
  const participant = groupInfo.participants.find(p => normalize(p.jid) === userNorm) || {};
  const targetIsAdmin = !!participant.admin;

  // ---------- VERIFICAR PERMISOS DEL REMITENTE ----------
  const senderParticipant = groupInfo.participants.find(p => normalize(p.jid) === sender) || {};
  const senderIsAdmin = !!senderParticipant.admin;
  const senderIsOwner = ownersBot.includes(sender);

  if (!senderIsOwner && !senderIsAdmin) return; // participante común no puede

  // Solo owner del bot puede expulsar admins
  if (targetIsAdmin && !senderIsOwner) return;

  // Expulsar
  try {
    await conn.groupParticipantsUpdate(m.chat, [participant.jid || user], 'remove');
    try { await m.react(emoji); } catch {}
  } catch (err) {
    console.log('Error expulsando en .chao:', err);
  }
};

handler.help = ['chao'];
handler.tags = ['grupo'];
handler.command = ['chao'];
handler.group = true;
handler.botAdmin = true;

export default handler;
