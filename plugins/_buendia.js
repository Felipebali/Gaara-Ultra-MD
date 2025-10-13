let handler = async (m, { conn, participants }) => {
  const owners = global.owner.map(o => o[0]);
  if (!owners.includes(m.sender.replace(/[^0-9]/g, ''))) return;

  if (!m.text) return;
  const text = m.text.toLowerCase();
  if (!['buendia','tardes','noches'].includes(text)) return;

  const mensajes = {
    buendia: ['Buenos días 😎','Buen día! 😏','🌅 Hola a todos!'],
    tardes: ['Buenas tardes 😏','Tarde tranquila 😎','☀️ Hola grupo!'],
    noches: ['Buenas noches 🌙','Descansen 😴','🌌 Dulces sueños!']
  };

  const index = Math.floor(Math.random() * mensajes[text].length);
  const mensaje = mensajes[text][index];

  const mentions = participants.map(p => p.jid);
  await conn.sendMessage(m.chat, { text: mensaje, mentions });
};

handler.customPrefix = /^(buendia|tardes|noches)$/i;
handler.owner = true; // solo owners
export default handler;
