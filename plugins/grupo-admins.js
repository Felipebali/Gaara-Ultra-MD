// plugins/admins.js
const handler = async (m, { conn, participants, args }) => {
  try {
    // Bloquear temporalmente el plugin _admin-request
    global.blockAdminRequest = true;

    // Administradores del grupo
    const groupAdmins = participants.filter(p => p.admin || p.admin === 'superadmin');

    // Lista de admins
    const listAdmin = groupAdmins
      .map((v, i) => `🔹 @${v.id.split('@')[0]}`)
      .join('\n') || '❌ No hay admins.';

    // Mensaje opcional
    const msg = args.length ? args.join(' ') : '🖕🏻 Putos.';

    // Texto final con estilo fuerte y grotesco
    const text = `🫎🖕🏻 *HAGAN ALGO HIJOS DE PUTA* 🖕🏻🫎
💌 Mensaje: ${msg}

${listAdmin}
🖕🏻━━━Si lees esto sos cornudo/a━━━🖕🏻`;

    // Enviar mensaje con menciones de los admins
    await conn.sendMessage(m.chat, {
      text,
      mentions: groupAdmins.map(v => v.id)
    });

    // Desbloquear _admin-request
    global.blockAdminRequest = false;

  } catch (e) {
    console.error(e);
    global.blockAdminRequest = false;
    m.reply('❌ Ocurrió un error al mostrar los admins.');
  }
};

handler.help = ['admin <texto>'];
handler.tags = ['grupo'];
handler.command = /^(admin|admins)$/i;
handler.group = true;

export default handler;
