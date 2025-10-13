let handler = async function (m, { conn }) {
  const owners = global.owner.map(o => o[0].replace(/[^0-9]/g, ''));

  let who;
  if (m.quoted) who = m.quoted.sender;
  else if (m.text && m.text.split(' ')[1]) {
    let number = m.text.split(' ')[1].replace(/[^0-9]/g, '');
    who = `${number}@s.whatsapp.net`;
  } else who = m.sender;

  const userId = who.split("@")[0]; // esto va como nombre visible
  const esOwner = owners.includes(userId) ? '✅ Sí' : '❌ No';

  const mensajeFinal = `
✨┏━〔 🕵️‍♂️ Información de Usuario 〕━┓✨
┃ 🌱 Nombre: @${userId}
┃ 🔹 LID/JID: ${who}
┃ 💠 Propietario: ${esOwner}
┗━━━━━━━━━━━━━━━━━━━┛
💬 Aquí está la info de @${userId} visible para todos.
`;

  // NOTA: no ponemos 'mentions', para que salga limpio y sin caracteres extraños
  return conn.sendMessage(m.chat, { text: mensajeFinal });
};

handler.help = ['user'];
handler.tags = ['owner'];
handler.command = ['user'];
handler.owner = true;
export default handler;
