let handler = async function (m, { conn }) {
  // Solo owners
  const owners = global.owner.map(o => o[0]);
  if (!owners.includes(m.sender.replace(/[^0-9]/g, ''))) return;

  let who;

  // 1️⃣ Si citan mensaje
  if (m.quoted) {
    who = m.quoted.sender;
  }
  // 2️⃣ Si escriben un número válido
  else if (m.text && m.text.split(' ')[1]) {
    let number = m.text.split(' ')[1].replace(/[^0-9]/g, '');
    who = `${number}@s.whatsapp.net`;
  }
  // 3️⃣ Si nada → tu propio LID
  else {
    who = m.sender;
  }

  const displayName = who.split('@')[0]; // Esto es lo que querés mostrar como "mención visible"

  const mensajeFinal = `
✨┏━〔 🕵️‍♂️ Información de Usuario 〕━┓✨
┃ 🌱 Nombre: @${displayName}
┃ 🔹 LID/JID: ${who}
┃ 💠 Propietario: ${owners.includes(displayName) ? '✅ Sí' : '❌ No'}
┗━━━━━━━━━━━━━━━━━━━┛
💬 Aquí está la info de ${displayName} sin mención oculta.
`;

  return conn.sendMessage(m.chat, { text: mensajeFinal });
}

handler.help = ['user']
handler.tags = ['owner']
handler.command = ['user']
handler.owner = true
export default handler;
