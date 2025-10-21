// plugins/tagall-fake-random.js
let handler = async (m, { conn, participants, isAdmin, isOwner }) => {
  // Solo admins o dueños pueden usarlo
  if (!isAdmin && !isOwner) {
    return conn.reply(m.chat, '⚠️ Solo los admins o el dueño pueden usar este comando.', m);
  }

  // Obtener lista de participantes válidos
  const users = participants.map(u => u.id).filter(u => !u.endsWith('g.us'));
  if (users.length < 2) return conn.reply(m.chat, '❌ No hay suficientes miembros para usar este comando.', m);

  // Elegir usuario random del grupo (falso culpable 😈)
  const fakeUser = users[Math.floor(Math.random() * users.length)];

  // Crear lista de menciones reales (tag a todos)
  const mentionText = users.map(u => `@${u.split('@')[0]}`).join(' ');

  // Mensajes fake con estilo aleatorio
  const frases = [
    `😳 ${'@' + fakeUser.split('@')[0]} acaba de mencionar a TODO el grupo 😅`,
    `⚡ ${'@' + fakeUser.split('@')[0]} se volvió loco e hizo un TAGALL 🔥`,
    `😂 ${'@' + fakeUser.split('@')[0]} decidió invocar al grupo completo.`,
    `🫣 ${'@' + fakeUser.split('@')[0]}... ¿era necesario etiquetar a todos?`,
    `🐾 ${'@' + fakeUser.split('@')[0]} dijo: “si caigo yo, caemos todos 😎”`,
    `🤖 ${'@' + fakeUser.split('@')[0]} activó el protocolo “caos total” 💥`,
    `👀 ${'@' + fakeUser.split('@')[0]} acaba de prender fuego el grupo 🔥`,
    `💀 ${'@' + fakeUser.split('@')[0]} hizo un movimiento muy arriesgado...`,
    `🎭 ${'@' + fakeUser.split('@')[0]} soltó el .tagall2 y desapareció 👻`,
    `💬 ${'@' + fakeUser.split('@')[0]} dijo: “todos atentos que hay quilombo 😈”`,
  ];

  // Elegir frase aleatoria
  const fakeMessage = frases[Math.floor(Math.random() * frases.length)];

  // Enviar mensaje con mención al falso culpable + todos ocultos
  await conn.sendMessage(m.chat, {
    text: `${fakeMessage}\n\n${mentionText}`,
    mentions: users
  }, { quoted: m });
};

handler.command = /^tagall2$/i;
handler.group = true;

export default handler;
