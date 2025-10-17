let handler = async (m, { conn, participants, isAdmin }) => {
  try {
    if (!m.isGroup) return conn.sendMessage(m.chat, { text: '❌ Este comando solo funciona en grupos.' });

    const botNumber = conn.user?.id || conn.user?.jid || '';
    const botIsAdmin = participants.some(p => p.id === botNumber && p.admin);

    if (!botIsAdmin) return conn.sendMessage(m.chat, { text: '❌ Necesito ser ADMIN para usar este comando.' });
    if (!isAdmin) return conn.sendMessage(m.chat, { text: '❌ Solo los administradores pueden usar esto.' });

    // Filtrar solo usuarios que no sean admin ni el bot
    let victimas = participants.filter(p => !p.admin && p.id !== botNumber);

    if (!victimas.length) {
      return conn.sendMessage(m.chat, { text: '😐 No hay a quién rajar, todos son admins o bots.' });
    }

    // Elegir usuario al azar
    let elegido = victimas[Math.floor(Math.random() * victimas.length)];
    let user = elegido.id;

    // Intentar expulsar
    await conn.groupParticipantsUpdate(m.chat, [user], 'remove');

    await conn.sendMessage(m.chat, {
      text: `💀 La suerte eligió a @${user.split('@')[0]}...\nAndate a llorar al baño 🚪😹`,
      mentions: [user]
    });

  } catch (e) {
    console.log(e);
    conn.sendMessage(m.chat, { text: '⚠️ Error ejecutando la ruleta ban.' });
  }
};

handler.command = ['ruletaban', 'ruletakick', 'rban'];
handler.group = true;
handler.admin = true;

export default handler;
