// plugins/_link.js
// Comando: .link
// ✅ Compatible con ES Modules (Gaara-Ultra-MD)

const handler = async (m, { conn, isAdmin, isBotAdmin }) => {
  if (!m.isGroup)
    return conn.reply(m.chat, '❗ Este comando sólo funciona dentro de grupos.', m);

  // Si querés que solo los admins puedan usarlo, descomentá esta línea:
  // if (!isAdmin) return conn.reply(m.chat, '❗ Solo administradores pueden usar este comando.', m);

  if (!isBotAdmin)
    return conn.reply(m.chat, '❗ Necesito ser admin del grupo para obtener el enlace.', m);

  try {
    const code = await conn.groupInviteCode(m.chat);
    const link = `https://chat.whatsapp.com/${code}`;
    await conn.sendMessage(
      m.chat,
      { text: `🔗 *Enlace del grupo:*\n${link}` },
      { quoted: m }
    );
  } catch (err) {
    console.error(err);
    await conn.reply(
      m.chat,
      '❗ No pude obtener el enlace. Asegúrate de que el bot sea administrador.',
      m
    );
  }
};

handler.help = ['link'];
handler.tags = ['group'];
handler.command = ['link', 'gruplink', 'glink'];

export default handler;
