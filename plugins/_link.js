// plugins/link.js
// Comando: .link
// Requisitos: que el bot sea admin del grupo para poder obtener el enlace.
// Si querés que solo administradores humanos puedan usarlo, descomenta la verificación isAdmin.

const handler = async (m, { conn, isAdmin, isBotAdmin }) => {
  try {
    // Comprueba que sea un grupo
    if (!m.isGroup) return conn.reply(m.chat, '❗ Este comando sólo funciona dentro de un grupo.', m);

    // Si quieres que sólo admins humanos puedan usarlo, descomenta la siguiente línea:
    // if (!isAdmin) return conn.reply(m.chat, '❗ Solo administradores pueden usar este comando.', m);

    // El bot necesita ser admin para obtener el código de invitación (si no lo es, puede fallar)
    if (!isBotAdmin) return conn.reply(m.chat, '❗ Necesito ser administrador del grupo para obtener el enlace de invitación. Hazme admin y vuelve a intentar.', m);

    // Obtiene el código de invitación del grupo (Baileys)
    const code = await conn.groupInviteCode(m.chat);
    if (!code) return conn.reply(m.chat, '❗ No se pudo obtener el código de invitación. Intenta de nuevo más tarde.', m);

    const link = `https://chat.whatsapp.com/${code}`;

    // Envía el enlace en el chat (con cita al mensaje que pidió el link)
    await conn.sendMessage(m.chat, { text: `🔗 *Enlace del grupo:*\n${link}` }, { quoted: m });

  } catch (err) {
    console.error(err);
    conn.reply(m.chat, '❗ Ocurrió un error al obtener el enlace. Asegúrate de que el bot sea admin y prueba otra vez.', m);
  }
};

handler.help = ['link'];
handler.tags = ['group'];
handler.command = ['link', 'grupo-link', 'glink']; // aliases
handler.exp = 3;

module.exports = handler; 
