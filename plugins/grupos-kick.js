const handler = async (m, { conn, isOwner }) => {
  const user = m.mentionedJid?.[0] || m.quoted?.sender;
  if (!user) return conn.reply(m.chat, '❌ Mencioná o respondé a alguien para expulsarlo.', m);

  const creador = '59898719147@s.whatsapp.net';
  const bot = conn.user.jid;

  if (user === creador) return conn.reply(m.chat, '🫎 No puedo expulsar a mi creador.', m);
  if (user === bot) return conn.reply(m.chat, '🤖 No puedo expulsarme a mí mismo.', m);

  // Refrescar metadata del grupo
  const groupMetadata = await conn.groupMetadata(m.chat);
  const participants = groupMetadata.participants;

  const sender = participants.find(p => p.id === m.sender);
  const target = participants.find(p => p.id === user);
  const botParticipant = participants.find(p => p.id === bot);

  const isSenderAdmin = sender?.admin === 'admin' || sender?.admin === 'superadmin';
  const isTargetAdmin = target?.admin === 'admin' || target?.admin === 'superadmin';
  const isBotAdmin = botParticipant?.admin === 'admin' || botParticipant?.admin === 'superadmin';

  if (!isBotAdmin) return conn.reply(m.chat, '❌ No soy admin, no puedo expulsar a nadie.', m);
  if (!isOwner && isTargetAdmin) return;
  if (!isOwner && !isSenderAdmin) return;

  try {
    await conn.groupParticipantsUpdate(m.chat, [user], 'remove');
    await m.react('✅');
  } catch (e) {
    console.log(e);
    await m.react('✖️');
  }
};

handler.help = ['k'];
handler.tags = ['grupo'];
handler.command = ['k','echar','sacar','ban'];
handler.group = true;
handler.botAdmin = true;

export default handler;
