const handler = async (m, { conn, isAdmin, isBotAdmin }) => {
  if (!m.isGroup) return conn.sendMessage(m.chat, { text: '❗ Este comando solo se puede usar en grupos.' });
  if (!isAdmin) return conn.sendMessage(m.chat, { text: '🛡️ Solo los administradores pueden usar este comando.' });
  if (!isBotAdmin) return conn.sendMessage(m.chat, { text: '🤖 Necesito ser administrador para cambiar la configuración del grupo.' });

  try {
    // Obtener información actual del grupo
    const groupInfo = await conn.groupMetadata(m.chat);
    const isAnnouncement = groupInfo.announcement; // true = cerrado, false = abierto
    let text = '';

    if (isAnnouncement) {
      // El grupo está cerrado, abrirlo
      await conn.groupSettingUpdate(m.chat, 'not_announcement');
      text = '🔓 *El grupo ha sido abierto.*\nAhora todos pueden enviar mensajes.';
    } else {
      // El grupo está abierto, cerrarlo
      await conn.groupSettingUpdate(m.chat, 'announcement');
      text = '🔒 *El grupo ha sido cerrado.*\nSolo los administradores pueden enviar mensajes.';
    }

    // Enviar mensaje normal sin citar
    await conn.sendMessage(m.chat, { text });

  } catch (error) {
    console.error('Error al obtener info del grupo:', error);
    return conn.sendMessage(m.chat, { text: '❌ Error al cambiar la configuración del grupo.' });
  }
}

handler.help = ['g'];
handler.tags = ['grupo'];
handler.command = ['g'];
handler.group = true;
handler.botAdmin = true; // debe ser true para poder cerrar/abrir el grupo
handler.admin = true;

export default handler;
