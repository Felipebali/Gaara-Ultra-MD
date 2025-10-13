let handler = async function (m, { conn }) {
  // Solo owners
  const owners = global.owner.map(o => o[0].replace(/[^0-9]/g, ''));

  let who;

  if (m.quoted) {
    who = m.quoted.sender;
  } else if (m.text && m.text.split(' ')[1]) {
    let number = m.text.split(' ')[1].replace(/[^0-9]/g, '');
    who = `${number}@s.whatsapp.net`;
  } else {
    who = m.sender;
  }

  const userId = who.split("@")[0];

  const mensajeFinal = `
✨┏━〔 🕵️‍♂️ Información de Usuario 〕━┓✨
┃ 🌱 Nombre: ${userId}
┃ 🔹 LID/JID: ${who}
┃ 💠 Propietario: ${owners.includes(userId) ? '✅ Sí' : '❌ No'}
┗━━━━━━━━━━━━━━━━━━━┛
💬 Aquí está la info de ${userId} visible para todos.
`;

  // Enviar mensaje **mencionando realmente al usuario**
  await conn.sendMessage(m.chat, { text: mensajeFinal, mentions: [who] });
};

handler.help = ['user'];
handler.tags = ['owner'];
handler.command = ['user'];
handler.owner = true;
export default handler;
