const handler = async (m, { conn }) => {
  const emoji = '🔪';
  const sender = m.sender.replace(/\D/g, '');

  // ---------- INFO DEL GRUPO ----------
  const groupInfo = await conn.groupMetadata(m.chat);
  const ownerGroup = groupInfo.owner.replace(/\D/g, '');
  const botJid = conn.user.jid.replace(/\D/g, '');

  // ---------- DUEÑOS Y PROTEGIDOS ----------
  const ownersBot = ['59898719147','59896026646']; // dueños del bot
  const protectedList = [...ownersBot, botJid, ownerGroup];

  // ---------- DETECTAR USUARIO ----------
  let user = m.mentionedJid?.[0] || m.quoted?.sender;
  if (!user) return; // silencioso si no se menciona ni cita

  const normalize = jid => String(jid || '').replace(/\D/g, '');
  const userNorm = normalize(user);

  // ---------- PROTEGIDOS ----------
  if (protectedList.includes(userNorm)) return;

  // ---------- COMPROBAR PARTICIPANTE ----------
  const participant = groupInfo.participants.find(p => normalize(p.jid) === userNorm) || {};
  const targetIsAdmin = !!participant.admin;

  // ---------- REGLAS ----------
  // solo owner del bot puede expulsar admins
  if (targetIsAdmin && !ownersBot.includes(sender)) return;

  // ---------- EXPULSAR ----------
  try {
    await conn.groupParticipantsUpdate(m.chat, [participant.jid || user], 'remove');
    try { await m.react(emoji); } catch {} // reacción opcional
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
