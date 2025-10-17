let handler = async (m, { conn, participants, isAdmin }) => {
  try {
    if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos.');

    const botNumber = conn.user?.id || conn.user?.jid || '';
    const botIsAdmin = participants.some(p => p.id === botNumber && p.admin);
    if (!botIsAdmin) return m.reply('❌ Necesito ser *ADMIN* para expulsar gente.');
    if (!isAdmin) return m.reply('❌ Solo los administradores pueden usar este comando.');

    let victimas = participants.filter(p => !p.admin && p.id !== botNumber);
    if (victimas.length === 0) return m.reply('😐 No hay víctimas disponibles (todos son admins).');

    let elegido = victimas[Math.floor(Math.random() * victimas.length)];
    let user = elegido.id;

    await m.reply(`🎯 Girando la ruleta... 🔫`);
    await sleep(1500);

    try {
      await conn.groupParticipantsUpdate(m.chat, [user], 'remove');
      await conn.sendMessage(m.chat, {
        text: `💀 La mala suerte cayó sobre @${user.split('@')[0]}\nAndate pa fuera 🚪😂`,
        mentions: [user]
      });
    } catch {
      await conn.sendMessage(m.chat, {
        text: `⚠️ No pude expulsar a @${user.split('@')[0]} (capaz tiene protección o WhatsApp bloqueó el kick)`,
        mentions: [user]
      });
    }

  } catch (e) {
    console.log(e);
    m.reply('⚠️ Error ejecutando la ruleta ban.');
  }
};

handler.command = ['ruletaban', 'rban'];
handler.group = true;
handler.admin = true;

export default handler;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
