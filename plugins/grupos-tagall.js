// plugins/tagall.js
let handler = async function (m, { conn, groupMetadata }) {
  if (!m.isGroup) return;

  const participantes = groupMetadata?.participants || [];
  const mencionados = participantes.map(p => p.id).filter(Boolean);

  // Crear lista de usuarios mencionados
  const listaUsuarios = mencionados.map(jid => `@${jid.split('@')[0]}`).join(' ');

  // Mensaje minimalista con hidetag
  const mensaje = `📢 ¡Atención a todos!\n${listaUsuarios}`;

  await conn.sendMessage(m.chat, { 
    text: mensaje,
    mentions: mencionados
  });
};

handler.command = ['tagall', 'invocar', 'tag'];
handler.help = ['tagall'];
handler.tags = ['grupos'];
handler.group = true;
handler.admin = false; // cualquiera puede usarlo
handler.botAdmin = false;

export default handler;
