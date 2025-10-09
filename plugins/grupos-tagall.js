// plugins/tagall.js
let handler = async function (m, { conn, groupMetadata }) {
  if (!m.isGroup) return;

  // Verificar si el bot es administrador
  const botIsAdmin = groupMetadata.participants
    .find(p => p.id === conn.user.jid)
    ?.admin;
  if (!botIsAdmin) {
    return await conn.sendMessage(m.chat, {
      text: 'Sos 🫎 o que? No ves que no soy admin para hacer Tagall.'
    });
  }

  // Verificar si quien ejecuta es administrador
  const senderIsAdmin = groupMetadata.participants
    .find(p => p.id === m.sender)
    ?.admin;
  if (!senderIsAdmin) {
    return await conn.sendMessage(m.chat, {
      text: `❌ @${m.sender.split('@')[0]}, solo los administradores pueden usar TagAll.`,
      mentions: [m.sender]
    });
  }

  // LINK ÚNICO para que el antitagall detecte copias
  const LINK_UNICO_TAGALL = 'https://miunicolink.local/tagall-FelixCat';

  // Verificar si está activado el tagall
  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {};
  const chatSettings = global.db.data.chats[m.chat];

  if (chatSettings.antitagall) {
    return await conn.sendMessage(m.chat, {
      text: `❌ @${m.sender.split('@')[0]}, el TagAll está desactivado en este grupo.`,
      mentions: [m.sender]
    });
  }

  const participantes = groupMetadata?.participants || [];
  const mencionados = participantes.map(p => p.id).filter(Boolean);

  // Mensaje con @all y un toque divertido
  let listaUsuarios = mencionados.map(jid => `┃ ⚡ @${jid.split('@')[0]}`).join('\n');

  const mensaje = [
    '╭━━━〔 𝗙𝗲𝗹𝗶𝘅𝗖𝗮𝘁-𝗕𝗼𝘁 〕━━━⬣',
    `┃ 🔥 ¡Invocación completada por @${m.sender.split('@')[0]}! 🔥`,
    '┃ 📌 Todos los usuarios del chat han sido invocados:',
    listaUsuarios,
    `┃ 🐾 No te escapes, @${m.sender.split('@')[0]} 😏`,
    `┃ 🔗 ${LINK_UNICO_TAGALL}`,
    '╰━━━━━━━━━━━━━━━━━━━━⬣'
  ].join('\n');

  await conn.sendMessage(
    m.chat,
    {
      text: mensaje,
      mentions: mencionados.concat(m.sender) // menciona al admin que activó
    }
  );
};

handler.command = ['invocar', 'tag', 'tagall'];
handler.help = ['invocar', 'tagall'];
handler.tags = ['grupos'];
handler.group = true;
handler.admin = true; // Solo admins pueden usarlo
handler.botAdmin = true; // El bot debe ser admin

export default handler;
