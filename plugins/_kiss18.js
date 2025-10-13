let handler = async (m, { conn }) => {
  let chat = global.db.data.chats[m.chat];
  if (chat.nsfw === undefined) chat.nsfw = false;

  // Verificar si NSFW está activado
  if (!chat.nsfw) {
    await conn.sendMessage(m.chat, { text: '❌ Este comando +18 está desactivado en este chat. Pide a un dueño activar NSFW.' });
    return;
  }

  let who = m.sender;
  let targetJid = m.quoted ? m.quoted.sender : (m.mentionedJid && m.mentionedJid[0]);

  let senderName = '@' + who.split('@')[0];
  let targetName = targetJid ? '@' + targetJid.split('@')[0] : null;

  // Mensajes sexuales +18 🔥😈
  const mensajes18 = [
    `💋 ${senderName} se acercó lentamente a ${targetName} y dejó un beso ardiente en sus labios 😈🔥`,
    `💋 ${senderName} besó a ${targetName} con deseo y un toque travieso, imposible de resistir 😏🔥`,
    `💋 ${senderName} mordisqueó suavemente los labios de ${targetName} mientras lo abrazaba 🔥😳`,
    `💋 ${senderName} se dio un beso provocativo a sí mismo, imaginando a ${targetName} 😈🔥`,
    `💋 ${senderName} y ${targetName} compartieron un beso intenso y cargado de pasión 🔥😏`,
    `💋 ${senderName} rozó sus labios con los de ${targetName} de manera atrevida y sensual 🔥😈`
  ];

  let textMessage;
  if (!targetJid || targetJid === who) {
    textMessage = mensajes18[3]; // beso a sí mismo
  } else {
    textMessage = mensajes18[Math.floor(Math.random() * 5)]; // beso a otro
  }

  let mentions = targetJid ? [who, targetJid] : [who];

  // Enviar mensaje +18 sexual
  await conn.sendMessage(m.chat, { text: textMessage, mentions });
};

handler.command = ['kiss18'];
handler.help = ['kiss18 @usuario'];
handler.tags = ['fun', 'nsfw'];

export default handler;
