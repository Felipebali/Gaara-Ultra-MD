// Creado por Xzzys26 adaptado para Gaara-Ultra-MD
let handler = async (m, { conn, participants, usedPrefix, command, isAdmin, isOwner }) => {
  // Verifica si se mencionó o respondió a alguien
  if (!m.mentionedJid?.length && !m.quoted) {
    return conn.reply(m.chat, `📌 *¿A quién quieres que elimine?*  
No has mencionado ni respondido a nadie...  
No juegues conmigo. ☠️`);
  }

  // Obtener usuario y normalizar JID
  let user = m.mentionedJid?.[0] ? m.mentionedJid[0] : m.quoted.sender;
  user = user.replace('@c.us', '@s.whatsapp.net');

  const groupInfo = await conn.groupMetadata(m.chat);
  const ownerGroup = groupInfo.owner.replace('@c.us', '@s.whatsapp.net') || m.chat.split`-`[0] + '@s.whatsapp.net';
  const ownerBot = global.owner[0] + '@s.whatsapp.net';

  // Protecciones especiales
  if (user === conn.user.jid) return conn.reply(m.chat, `🙃 ¿Quieres que me saque yo mismo? No seas ridículo.`);
  if (user === ownerGroup) return conn.reply(m.chat, `👑 Ese es el dueño del grupo. Ni lo sueñes...`);
  if (user === ownerBot) return conn.reply(m.chat, `🛡️ Ese es mi creador, no lo voy a tocar.`);

  // Verificar que el usuario está en el grupo
  const groupMembers = participants.map(p => p.id.replace('@c.us', '@s.whatsapp.net'));
  if (!groupMembers.includes(user)) {
    return conn.reply(m.chat, `❌ Esa persona ni siquiera está en el grupo.`);
  }

  // Verificación: solo admins o owners del bot pueden usar el comando
  if (!(isAdmin || isOwner)) {
    return conn.reply(m.chat, `❌ Solo administradores o mi dueño pueden usar este comando.`);
  }

  // Ejecuta la expulsión
  try {
    await conn.groupParticipantsUpdate(m.chat, [user], 'remove');
    conn.reply(m.chat, `💥 *Eliminado.*  
He decidido que ya no pertenezcas aquí.`);
  } catch (e) {
    console.error(e);
    conn.reply(m.chat, `❌ No pude sacarlo…  
Seguramente no tengo permisos suficientes.`);
  }
};

handler.help = ['kick'];
handler.tags = ['grupo'];
handler.command = ['k', 'echar', 'sacar', 'ban'];
handler.group = true;
handler.botAdmin = true;
handler.register = true;

export default handler;
