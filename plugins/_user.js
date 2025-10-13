let handler = async function (m, { conn }) {
  // Solo owners
  const owners = global.owner.map(o => o[0].replace(/[^0-9]/g, ''));

  let who;

  // 1️⃣ Si citan mensaje
  if (m.quoted) {
    who = m.quoted.sender;
  }
  // 2️⃣ Si escriben un número
  else if (m.text && m.text.split(' ')[1]) {
    let number = m.text.split(' ')[1].replace(/[^0-9]/g, '');
    who = `${number}@s.whatsapp.net`;
  }
  // 3️⃣ Si nada → tu propio LID
  else {
    who = m.sender;
  }

  const userId = who.split("@")[0]; // usar para nombre y mención
  const esOwner = owners.includes(userId) ? '✅ Sí' : '❌ No';

  const mensajeFinal = `
✨┏━〔 🕵️‍♂️ Información de Usuario 〕━┓✨
┃ 🌱 Nombre: @${userId}
┃ 🔹 LID/JID: ${who}
┃ 💠 Propietario: ${esOwner}
┗━━━━━━━━━━━━━━━━━━━┛
💬 Aquí está la info de @${userId} visible para todos.
`;

  // Enviar mensaje **mencionando al usuario correctamente**
  await conn.sendMessage(m.chat, { text: mensajeFinal, mentions: [who] });
};

handler.help = ['user'];
handler.tags = ['owner'];
handler.command = ['user'];
handler.owner = true;
export default handler;
