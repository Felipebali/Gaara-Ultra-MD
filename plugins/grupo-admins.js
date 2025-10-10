const handler = async (m, { conn, participants, groupMetadata, args }) => {
  try {
    // Administradores del grupo (incluye superadmin)
    const groupAdmins = participants.filter(p => p.admin || p.admin === 'superadmin');
    const listAdmin = groupAdmins.map(v => `🔹 @${v.id.split('@')[0]}`).join('\n') || 'No hay admins.';

    // Dueño del grupo
    const ownerGroup = groupMetadata?.owner || m.chat.split('-')[0] + '@s.whatsapp.net';

    // Owner del bot
    const botOwnerJid = '+59898719147@s.whatsapp.net'; // Cambiar si hay otro
    const botOwnerName = await conn.getName(botOwnerJid);

    // Mensaje opcional
    const msg = args.length ? args.join(' ') : 'Hola a todos 👋';

    // Texto final: mensaje primero, luego admins, luego owner
    const text = `💌 Mensaje: ${msg}

✨ *Admins del Grupo* ✨
${listAdmin}

⚡ Owner del Bot: @${botOwnerJid.split('@')[0]} (${botOwnerName})`;

    // Enviar mensaje con menciones (admins + dueño del grupo + owner)
    await conn.sendMessage(m.chat, {
      text,
      mentions: [...groupAdmins.map(v => v.id), ownerGroup, botOwnerJid]
    });
  } catch (e) {
    console.error(e);
    m.reply('❌ Ocurrió un error al mostrar los admins.');
  }
};

handler.help = ['admins <texto>'];
handler.tags = ['grupo'];
handler.command = /^(admins|@admins|dmins)$/i;
handler.group = true;

export default handler;
