const handler = async (m, { conn, text, command, isAdmin, isOwner }) => {
  const chat = global.db.data.chats[m.chat] || (global.db.data.chats[m.chat] = {});
  const bot  = global.db.data.settings[conn.user.jid] || (global.db.data.settings[conn.user.jid] = {});

  const opciones = {
    welcome: ['🎉', 'Bienvenida', 'chat'],
    autoresponder: ['🤖', 'Autoresponder', 'chat'],
    detect: ['⚡️', 'Avisos', 'chat'],
    antilink: ['🔗', 'Antilink', 'chat'],
    antilink2: ['⛔', 'Antilink 2', 'chat'],
    nsfw: ['🔞', 'NSFW', 'chat'],
    autolevelup: ['📈', 'Nivel Automático', 'chat'],
    autosticker: ['✨', 'Autosticker', 'chat'],
    reaction: ['😎', 'Reacciones', 'chat'],
    antitoxic: ['🛡', 'Antitóxico', 'chat'],
    audios: ['🎵', 'Audios', 'chat'],
    modoadmin: ['👑', 'Modo Admin', 'chat'],
    antifake: ['🚫', 'Antifake', 'chat'],
    antibot: ['🤖', 'Antibot', 'chat'],
    games: ['🎮', 'Juegos', 'chat'],
    simi: ['💬', 'ChatBot', 'chat'],
    autoaceptar: ['✅', 'Autoaceptar', 'chat'],
    autorechazar: ['❌', 'Autorechazar', 'chat'],
    autofrase: ['📝', 'Autofrase', 'chat'],
    antidelete: ['🗑', 'Antieliminar', 'chat'],

    frases: ['💡', 'Frases', 'bot'],
    autobio: ['📃', 'Autobiografía', 'bot'],
    antispam: ['🚫', 'Antispam', 'bot'],
    antiprivado: ['🔒', 'Antiprivado', 'bot'],
  };

  // Mostrar panel si no hay texto después del comando
  if (!text) {
    const buildPanel = tipo => {
      let msg = `╭─〔 *Funciones ${tipo === 'chat' ? 'del Grupo' : 'del Bot'}* 〕\n`;
      for (const [cmd, [emoji, nombre, t]] of Object.entries(opciones)) {
        if (t !== tipo) continue;
        const estado = (tipo === 'chat' ? chat[cmd] : bot[cmd]) ? '✅ Activado' : '❌ Desactivado';
        msg += `│ ${emoji} ${nombre}: ${estado}\n`;
      }
      msg += '╰────────────────────\n\n';
      return msg;
    };
    return conn.sendMessage(m.chat, { text: `📌 *Panel de Configuración*\n\n${buildPanel('chat')}${buildPanel('bot')}⚙️ Usa *.config nombre1 nombre2 ...* para activar/desactivar.` });
  }

  if (!isAdmin && !isOwner) return conn.sendMessage(m.chat, { text: '🚫 Solo administradores o el dueño pueden cambiar la configuración.' });

  const args = text.trim().split(/\s+/); // separar palabras después del comando
  let resultados = [];

  for (let arg of args) {
    if (!opciones[arg]) continue;
    const [emoji, nombre, tipo] = opciones[arg];
    if (tipo === 'chat') chat[arg] = !chat[arg];
    else bot[arg] = !bot[arg];
    resultados.push(`${chat[arg] || bot[arg] ? '✅' : '🛑'} ${nombre} ${chat[arg] || bot[arg] ? 'activado' : 'desactivado'}`);
  }

  if (!resultados.length) return conn.sendMessage(m.chat, { text: '❌ No se reconocieron funciones para modificar.' });
  return conn.sendMessage(m.chat, { text: `📌 Configuración actualizada:\n\n${resultados.join('\n')}` });
};

handler.command = ['config'];
handler.help = ['config'];
handler.tags = ['config'];
handler.group = true;
handler.register = true;

export default handler;
