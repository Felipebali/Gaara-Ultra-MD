const handler = async (m, { conn, participants, groupMetadata, args }) => {
  try {
    // Administradores del grupo (incluye superadmin)
    const groupAdmins = participants.filter(p => p.admin || p.admin === 'superadmin');
    const listAdmin = groupAdmins.map(v => `🔹 @${v.id.split('@')[0]}`).join('\n') || 'No hay admins.';

    // Dueño del grupo
    const ownerGroup = groupMetadata?.owner || m.chat.split('-')[0] + '@s.whatsapp.net';

    // Owner del bot (mencionado siempre)
    const botOwner = '+59898719147@s.whatsapp.net'; // Cambiar si hay otro

    // Mensaje opcional
    const msg = args.length ? args.join(' ') : 'Hola a todos 👋';

    // Texto final
    const text = `✨ *Admins del Grupo* ✨

${listAdmin}

💌 Mensaje: ${msg}

⚡ Owner del Bot: @${botOwner.split('@')[0]}`;

    // Enviar mensaje con menciones
    await conn.sendMessage(m.chat, {
      text,
      mentions: [...groupAdmins.map(v => v.id), ownerGroup, botOwner]
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
