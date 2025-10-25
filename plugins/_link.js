// plugins/_link.js
// 🔗 Comando: .link (solo para owners)
// 💥 Si alguien no autorizado lo usa, será eliminado del grupo

const owners = ['59898719147@s.whatsapp.net', '59896026646@s.whatsapp.net']; // ✅ dueños autorizados

const handler = async (m, { conn, isBotAdmin, participants }) => {
  if (!m.isGroup)
    return conn.reply(m.chat, '❗ Este comando solo puede usarse dentro de grupos.', m);

  // Verifica si el usuario es dueño
  const isOwner = owners.includes(m.sender);

  if (!isOwner) {
    // Si el bot no es admin, no puede expulsar
    if (!isBotAdmin) return conn.reply(m.chat, '😼 No sos mi dueño... y encima no soy admin.', m);

    // Mensaje divertido antes de expulsar
    await conn.reply(m.chat, `💀 *${m.pushName || 'Usuario'}*, no sos mi dueño.\nTe voy a descansar un rato...`, m);

    // Espera 1 segundo y lo expulsa
    await new Promise(resolve => setTimeout(resolve, 1000));
    await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
    return;
  }

  // Solo los dueños llegan acá 👇
  if (!isBotAdmin)
    return conn.reply(m.chat, '❗ Necesito ser *administrador del grupo* para obtener el enlace.', m);

  try {
    await conn.sendMessage(m.chat, { react: { text: '🔗', key: m.key } });

    const code = await conn.groupInviteCode(m.chat);
    const link = `https://chat.whatsapp.com/${code}`;
    const metadata = await conn.groupMetadata(m.chat);

    const texto = `
╭━━━〔 *🌐 Enlace del grupo* 〕━━━⬣
┃ 📛 *Nombre:* ${metadata.subject}
┃ 👥 *Miembros:* ${metadata.participants.length}
┃ 🔗 *Invitación:* 
┃ ${link}
╰━━━━━━━━━━━━━━━━━━━━━━⬣
🐾 Solo los dueños pueden usar este comando.
`.trim();

    await conn.sendMessage(
      m.chat,
      {
        text: texto,
        footer: '🐾 FelixCat_Bot — Conectando Garras y Grupos',
        buttons: [
          {
            buttonId: link,
            buttonText: { displayText: '🔗 Abrir grupo' },
            type: 1,
          },
        ],
        headerType: 1,
      },
      { quoted: m }
    );
  } catch (err) {
    console.error(err);
    await conn.reply(m.chat, '❗ No pude obtener el enlace. Asegúrate de que el bot sea administrador.', m);
  }
};

handler.help = ['link'];
handler.tags = ['owner'];
handler.command = ['link', 'glink'];
handler.group = true;

export default handler;
