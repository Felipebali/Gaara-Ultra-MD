let handler = async function (m, { conn }) {
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

  const username = '@' + who.split('@')[0]; // mención visible

  const mensajeFinal = `✨┏━〔 🕵️‍♂️ Información de Usuario 〕━┓✨
┃ 🌱 Nombre: ${username}
┃ 🔹 LID/JID: ${who}
┗━━━━━━━━━━━━━━━━━━━┛
💬 Aquí está la info de ${username} visible para todos.`;

  await conn.sendMessage(m.chat, { text: mensajeFinal, mentions: [who] });
}

handler.help = ['user'];
handler.tags = ['owner'];
handler.command = ['user'];
handler.owner = true;

export default handler;
