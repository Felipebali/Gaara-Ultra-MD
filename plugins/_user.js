let handler = async function (m, { conn }) {
  // Números de owners
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

  const userNumber = who.split("@")[0]; // número puro del usuario
  const mention = '@' + userNumber; // para usar en todo el mensaje

  const mensajeFinal = `
✨┏━〔 🕵️‍♂️ Información de Usuario 〕━┓✨
┃ 🌱 Nombre: ${mention}
┃ 🔹 LID/JID: ${who}
┃ 💠 Propietario: ${owners.includes(userNumber) ? '✅ Sí' : '❌ No'}
┗━━━━━━━━━━━━━━━━━━━┛
💬 Aquí está la info de ${mention} visible para todos.
`;

  // Enviar mensaje y que la mención sea visible
  return conn.sendMessage(m.chat, { text: mensajeFinal });
}

handler.help = ['user']
handler.tags = ['owner']
handler.command = ['user']
handler.owner = true
export default handler;
