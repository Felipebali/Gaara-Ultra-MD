const handler = async (m, { conn, participants, args }) => {
  try {
    // Administradores del grupo
    const groupAdmins = participants.filter(p => p.admin || p.admin === 'superadmin');

    // Lista de admins con estilo
    const listAdmin = groupAdmins
      .map((v, i) => `✨ ${i + 1}. @${v.id.split('@')[0]}`)
      .join('\n') || '❌ No hay admins.';

    // Mensaje opcional
    const msg = args.length ? args.join(' ') : '👋 ¡Saludos a todos!';

    // Texto final con divisores y emojis
    const text = `┏━━━💠 *Administradores del Grupo* 💠━━━┓
💌 Mensaje: ${msg}

${listAdmin}
┗━━━━━━━━━━━━━━━━━━━━┛`;

    // Enviar mensaje con menciones de los admins
    await conn.sendMessage(m.chat, {
      text,
      mentions: groupAdmins.map(v => v.id)
    });

  } catch (e) {
    console.error(e);
    m.reply('❌ Ocurrió un error al mostrar los admins.');
  }
};

handler.help = ['admin <texto>'];
handler.tags = ['grupo'];
handler.command = /^(admin|admins)$/i;
handler.group = true;

export default handler;
