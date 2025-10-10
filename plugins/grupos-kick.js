const handler = async (m, { conn, groupMetadata, isOwner }) => {
  const user = m.mentionedJid?.[0] || m.quoted?.sender;
  if (!user) return conn.reply(m.chat, '❌ Mencioná o respondé a alguien para expulsarlo.', m);

  const creador = '59898719147@s.whatsapp.net'; // tu número
  const bot = conn.user.jid;

  if (user === creador) return conn.reply(m.chat, '🫎 No puedo expulsar a mi creador.', m);
  if (user === bot) return conn.reply(m.chat, '🤖 No puedo expulsarme a mí mismo.', m);

  const sender = groupMetadata.participants.find(p => p.id === m.sender);
  const target = groupMetadata.participants.find(p => p.id === user);
  const botParticipant = groupMetadata.participants.find(p => p.id === bot);

  const isSenderAdmin = sender?.admin === 'admin' || sender?.admin === 'superadmin';
  const isTargetAdmin = target?.admin === 'admin' || target?.admin === 'superadmin';
  const isBotAdmin = botParticipant?.admin === 'admin' || botParticipant?.admin === 'superadmin';

  // El bot debe ser admin
  if (!isBotAdmin) return conn.reply(m.chat, '❌ No soy admin, no puedo expulsar a nadie.', m);

  // Solo owner puede expulsar admins
  if (!isOwner && isTargetAdmin) return;

  // Solo owner o admin puede expulsar
  if (!isOwner && !isSenderAdmin) return;

  try {
    await conn.groupParticipantsUpdate(m.chat, [user], 'remove');
    await m.react('✅'); // Solo react de confirmación
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
