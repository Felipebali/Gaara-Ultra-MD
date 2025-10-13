let handler = async function (m, { conn, groupMetadata }) {
  // Solo owners
  const owners = global.owner.map(o => o[0]);
  if (!owners.includes(m.sender.replace(/[^0-9]/g, ''))) return;

  let who;
  let estado = '👤 Miembro';

  // 1️⃣ Si citan mensaje
  if (m.quoted) {
    who = m.quoted.sender;
    const participante = groupMetadata?.participants.find(p => p.id === who);
    if (participante) {
      estado = participante.admin === 'superadmin' ? '👑 Superadmin' :
               participante.admin === 'admin' ? '🛡️ Admin' : '👤 Miembro';
    }
  }
  // 2️⃣ Si escriben un número o JID
  else if (m.text && m.text.split(' ')[1]) {
    let number = m.text.split(' ')[1];
    who = number.includes('@') ? number : `${number}@s.whatsapp.net`;
  }
  // 3️⃣ Si nada → tu propio LID
  else {
    who = m.sender;
  }

  const username = '@' + who.split("@")[0];

  // Verificar si es owner
  const esOwner = owners.includes(who.replace(/[^0-9]/g, '')) ? '✅ Sí' : '❌ No';

  // Estructura de la tarjeta
  const mensajeFinal = `
╔══════════════════╗
║      🐾 FelixCat-Bot 🐾     ║
╠══════════════════╣
┏━━━━━━━━━━━━━━━🐾
┃ 🌟 *Usuario:*
┃ 🙍‍♂️ ${username}
┃ 🔑 LID: ${who}
┃ 🏷️ Estado: ${estado}
┃ 💠 Propietario: ${esOwner}
┗━━━━━━━━━━━━━━━🐾
╚══════════════════╝
💬 Aquí está la info de ${username} visible para todos.
`;

  // Enviar mensaje como texto plano, sin menciones ocultas
  await conn.sendMessage(m.chat, { text: mensajeFinal });
}

handler.help = ['user'];
handler.tags = ['owner'];
handler.command = ['user'];
handler.owner = true;
export default handler;
