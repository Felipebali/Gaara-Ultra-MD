const handler = async (m, { conn, groupMetadata, isOwner }) => {
  const user = m.mentionedJid?.[0] || m.quoted?.sender;
  if (!user) return;

  const creador = '59898719147@s.whatsapp.net';
  const bot = conn.user.jid;

  if (user === creador) return conn.reply(m.chat, `Sos 🫎? Como voy a eliminar a mi creador.`, m);
  if (user === bot) return conn.reply(m.chat, `No puedo eliminarme a mi mismo.`, m);

  const sender = groupMetadata.participants.find(p => p.id === m.sender);
  const target = groupMetadata.participants.find(p => p.id === user);

  const isSenderAdmin = sender?.admin === 'admin' || sender?.admin === 'superadmin';
  const isTargetAdmin = target?.admin === 'admin' || target?.admin === 'superadmin';

  // Solo owner puede expulsar admins
  if (!isOwner && isTargetAdmin) {
    return conn.reply(m.chat, '❌ Solo el owner puede expulsar a otro admin.', m);
  }

  // Solo admins o owner pueden expulsar
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
handler.command = ['k', 'echar', 'sacar', 'ban'];
handler.group = true;
handler.botAdmin = true;

export default handler;
