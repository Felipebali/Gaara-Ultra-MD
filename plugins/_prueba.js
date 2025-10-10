const handler = async (m, { conn }) => {
  const emoji = '🔪';
  const sender = m.sender.replace(/\D/g, '');

  // ---------- OBTENER INFO DEL GRUPO ----------
  const groupInfo = await conn.groupMetadata(m.chat);
  const ownerGroup = groupInfo.owner.replace(/\D/g, '');
  const botJid = conn.user.jid.replace(/\D/g, '');

  // ---------- LISTA DE PROTEGIDOS ----------
  const ownersBot = ['59898719147','59896026646']; // dueños del bot
  const protectedList = [...ownersBot, botJid, ownerGroup];

  // ---------- DETECTAR USUARIO A EXPULSAR ----------
  let user = m.mentionedJid?.[0] || m.quoted?.sender;

  if (!user) {
    // ---------- MENSAJE CUANDO NO SE MENCIONA NI SE CITA ----------
    return conn.sendMessage(
      m.chat,
      { text: 'Difícil sino mencionas o citas un mensaje, pelotudo. 😌', mentions: [sender] },
      { quoted: m }
    );
  }

  const normalize = jid => String(jid || '').replace(/\D/g, '');
  const userNorm = normalize(user);

  // ---------- BLOQUEAR PROTEGIDOS ----------
  if (protectedList.includes(userNorm)) {
    return conn.sendMessage(
      m.chat,
      { text: '😎 Es imposible eliminar a alguien protegido.', mentions: [sender] },
      { quoted: m }
    );
  }

  // ---------- COMPROBAR PARTICIPANTE ----------
  const participant = groupInfo.participants.find(p => normalize(p.jid) === userNorm) || {};
  const targetIsAdmin = !!participant.admin;

  // ---------- REGLAS DE EXPULSIÓN ----------
  // solo owner del bot puede expulsar admins
  if (targetIsAdmin && !ownersBot.includes(sender)) {
    return conn.sendMessage(
      m.chat,
      { text: '❌ No puedes expulsar a otro administrador. Solo los dueños del bot pueden hacerlo.', mentions: [sender] },
      { quoted: m }
    );
  }

  // ---------- EXPULSAR ----------
  try {
    await conn.groupParticipantsUpdate(m.chat, [participant.jid || user], 'remove');

    // reacción opcional
    try { await m.react(emoji); } catch {}

    // mensaje opcional al grupo
    await conn.sendMessage(
      m.chat,
      { text: `⚡ Usuario eliminado: @${participant.jid.split('@')[0]}`, mentions: [participant.jid] },
      { quoted: m }
    );

  } catch (err) {
    console.log('Error expulsando en .chao:', err);
    await conn.sendMessage(
      m.chat,
      { text: '❌ Ocurrió un error al intentar expulsar.' },
      { quoted: m }
    );
  }
};

handler.help = ['chao'];
handler.tags = ['grupo'];
handler.command = ['chao'];
handler.group = true;
handler.botAdmin = true;

export default handler;
