let handler = async (m, { conn, isAdmin }) => {
  try {
    if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos.');

    const groupMetadata = await conn.groupMetadata(m.chat);
    const participants = groupMetadata.participants;

    const botNumber = conn.user?.id?.split(':')[0] + '@s.whatsapp.net';
    const botIsAdmin = participants.some(p => p.id === botNumber && p.admin);

    if (!botIsAdmin) return m.reply('❌ Necesito ser *ADMIN* para expulsar.');
    if (!isAdmin) return m.reply('❌ Solo administradores pueden usar este comando.');

    let victimas = participants.filter(p => !p.admin && p.id !== botNumber);
    if (!victimas.length) return m.reply('😐 No hay víctimas disponibles (todos son admins).');

    let elegido = victimas[Math.floor(Math.random() * victimas.length)];
    let user = elegido.id;

    await m.reply('🎯 Girando la ruleta... 🔫');
    await delay(1200);

    await conn.groupParticipantsUpdate(m.chat, [user], 'remove')
      .then(() => {
        conn.sendMessage(m.chat, {
          text: `💀 Mala suerte @${user.split('@')[0]}, afuera del grupo 🚪😂`,
          mentions: [user]
        });
      })
      .catch(() => {
        conn.sendMessage(m.chat, {
          text: `⚠️ No pude expulsar a @${user.split('@')[0]} (capaz tiene protección o WhatsApp bloqueó el kick)`,
          mentions: [user]
        });
      });

  } catch (e) {
    console.log(e);
    m.reply('⚠️ Error en la ruleta ban.');
  }
};

handler.command = ['ruletaban', 'rban'];
handler.group = true;
handler.admin = true;

export default handler;

function delay(ms) {
  return new Promise(res => setTimeout(res, ms));
}
