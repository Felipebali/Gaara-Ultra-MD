let handler = async function (m, { conn, groupMetadata }) {
  if (!m.isGroup) return m.reply('🚫 Este comando solo funciona en grupos.');

  // Solo owners
  const owners = global.owner.map(o => o[0]);
  if (!owners.includes(m.sender.replace(/[^0-9]/g, ''))) return;

  let who;

  // 1️⃣ Si citan mensaje
  if (m.quoted) {
    who = m.quoted.sender;
  }
  // 2️⃣ Si escriben un número o mención
  else if (m.text && m.text.split(' ')[1]) {
    let number = m.text.split(' ')[1];
    who = number.includes('@') ? number : `${number}@s.whatsapp.net`;
  }
  // 3️⃣ Si nada → su propio LID
  else {
    who = m.sender;
  }

  // Buscar participante en el grupo
  const participante = groupMetadata.participants.find(p => p.id === who);

  if (!participante) return m.reply('❌ Usuario no encontrado en el grupo.');

  const username = '@' + who.split('@')[0]; // mención visible
  const estado = participante.admin === 'superadmin' ? '👑 Superadmin' :
                 participante.admin === 'admin' ? '🛡️ Admin' : '👤 Miembro';

  const mensajeFinal = `✨┏━〔 🕵️‍♂️ Información de Usuario 〕━┓✨
┃ 🌱 Nombre: ${username}
┃ 🔹 LID/JID: ${who}
┃ 🏷️ Estado: ${estado}
┗━━━━━━━━━━━━━━━━━━━┛
💬 Aquí está la info de ${username} visible para todos.`;

  // Enviar mensaje con mención visible
  await conn.sendMessage(m.chat, { text: mensajeFinal, mentions: [who] });
}

handler.help = ['user'];
handler.tags = ['group'];
handler.command = ['user'];
handler.owner = true;
handler.group = true;

export default handler;
