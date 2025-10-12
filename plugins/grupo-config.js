// 📌 Handler compacto para configurar funciones del grupo y del bot
const handler = async (m, { conn, command, isAdmin, isOwner }) => {
  // 🔹 Inicializar datos
  const chat = global.db.data.chats[m.chat] ??= {};
  const bot = global.db.data.settings[conn.user.jid] ??= {};

  // 🔹 Funciones configurables
  const opciones = {
    // ▸ Grupo
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

    // ▸ Bot
    frases: ['💡', 'Frases', 'bot'],
    autobio: ['📃', 'Autobiografía', 'bot'],
    antispam: ['🚫', 'Antispam', 'bot'],
    antiprivado: ['🔒', 'Antiprivado', 'bot'],
  };

  // 🔹 Mostrar panel si solo ponen .config
  if (!command || command === 'config') {
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

    const msg = `📌 *Panel de Configuración*\n\n${buildPanel('chat')}${buildPanel('bot')}⚙️ Usa *.nombre* para activar o desactivar (ej: *.welcome*).`;
    return conn.sendMessage(m.chat, { text: msg });
  }

  // 🔹 Alternar función
  if (!opciones[command]) return;
  if (!isAdmin && !isOwner) return conn.sendMessage(m.chat, { text: '🚫 Solo administradores o el dueño pueden cambiar la configuración.' });

  const [emoji, nombre, tipo] = opciones[command];
  if (tipo === 'chat') chat[command] = !chat[command];
  else bot[command] = !bot[command];

  const estado = tipo === 'chat' ? chat[command] : bot[command];
  return conn.sendMessage(m.chat, { text: estado ? `🎊 ¡Listo! *${nombre}* ahora está activo.` : `🛑 Oops… *${nombre}* ha sido desactivado.` });
};

// 🔹 Comandos
handler.command = ['config', ...Object.keys({
  welcome: 0, autoresponder: 0, detect: 0, antilink: 0, antilink2: 0,
  nsfw: 0, autolevelup: 0, autosticker: 0, reaction: 0, antitoxic: 0,
  audios: 0, modoadmin: 0, antifake: 0, antibot: 0, games: 0,
  simi: 0, autoaceptar: 0, autorechazar: 0, autofrase: 0, antidelete: 0,
  frases: 0, autobio: 0, antispam: 0, antiprivado: 0
})];

handler.help = ['config'];
handler.tags = ['config'];
handler.group = true;
handler.register = true;

export default handler;
