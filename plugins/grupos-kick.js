const handler = async (m, { conn, participants }) => {
  // Detectar usuario a expulsar: mención o mensaje citado
  let user = m.mentionedJid?.[0] || m.quoted?.sender;
  if (!user) return;

  const groupInfo = await conn.groupMetadata(m.chat);
  const ownerGroup = groupInfo.owner || m.chat.split`-`[0] + '@s.whatsapp.net';
  const ownerBot = (global.owner[0]?.[0] || '') + '@s.whatsapp.net';
  const creador = '59898719147@s.whatsapp.net'; // Tu número protegido
  const bot = conn.user.jid;

  // Protecciones
  if (user === creador) {
    return conn.reply(m.chat, `Estas loco? como voy a eliminar a mi creador.`, m);
  }
  if (user === bot) {
    return conn.reply(m.chat, `No puedo eliminarme a mi mismo.`, m);
  }
  if (user === ownerGroup) {
    return conn.reply(m.chat, `Ese es el dueño del grupo.`, m);
  }
  if (user === ownerBot) {
    return conn.reply(m.chat, `No puedo eliminar a mi dueño.`, m);
  }

  // Eliminar usuario
  try {
    await conn.groupParticipantsUpdate(m.chat, [user], 'remove');
    await m.react('✅');
  } catch {
    await m.react('✖️');
  }
};

handler.help = ['k'];
handler.tags = ['grupo'];
handler.command = ['k','echar','sacar','ban'];
handler.admin = true;
handler.group = true;
handler.botAdmin = true;

export default handler;
