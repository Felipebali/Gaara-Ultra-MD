const handler = async (m, { conn, command, args, isAdmin, isOwner }) => {
  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {};
  if (!global.db.data.settings[conn.user.jid]) global.db.data.settings[conn.user.jid] = {};

  const chat = global.db.data.chats[m.chat];
  const bot = global.db.data.settings[conn.user.jid];

  // 🔧 Lista de funciones configurables (chat o global)
  const opciones = {
    // 🔹 Módulos de grupo
    welcome: { key: 'welcome', tipo: 'chat', emoji: '🎉', nombre: 'Bienvenida' },
    autoresponder: { key: 'autoresponder', tipo: 'chat', emoji: '🤖', nombre: 'Autoresponder' },
    detect: { key: 'detect', tipo: 'chat', emoji: '⚡️', nombre: 'Avisos' },
    antilink: { key: 'antiLink', tipo: 'chat', emoji: '🔗', nombre: 'Antilink' },
    antilink2: { key: 'antiLink2', tipo: 'chat', emoji: '⛔', nombre: 'Antilink 2' },
    nsfw: { key: 'nsfw', tipo: 'chat', emoji: '🔞', nombre: 'NSFW' },
    autolevelup: { key: 'autolevelup', tipo: 'chat', emoji: '📈', nombre: 'Nivel Automático' },
    autosticker: { key: 'autosticker', tipo: 'chat', emoji: '✨', nombre: 'Autosticker' },
    reaction: { key: 'reaction', tipo: 'chat', emoji: '😎', nombre: 'Reacciones' },
    antitoxic: { key: 'antitoxic', tipo: 'chat', emoji: '🛡', nombre: 'Antitóxico' },
    audios: { key: 'audios', tipo: 'chat', emoji: '🎵', nombre: 'Audios' },
    modoadmin: { key: 'modoadmin', tipo: 'chat', emoji: '👑', nombre: 'Modo Admin' },
    antifake: { key: 'antifake', tipo: 'chat', emoji: '🚫', nombre: 'Antifake' },
    antibot: { key: 'antiBot', tipo: 'chat', emoji: '🤖', nombre: 'Antibot' },
    games: { key: 'games', tipo: 'chat', emoji: '🎮', nombre: 'Juegos' },
    simi: { key: 'simi', tipo: 'chat', emoji: '💬', nombre: 'ChatBot' },
    autoaceptar: { key: 'autoAceptar', tipo: 'chat', emoji: '✅', nombre: 'Autoaceptar' },
    autorechazar: { key: 'autoRechazar', tipo: 'chat', emoji: '❌', nombre: 'Autorechazar' },
    autofrase: { key: 'autoFrase', tipo: 'chat', emoji: '📝', nombre: 'Autofrase' },
    antidelete: { key: 'delete', tipo: 'chat', emoji: '🗑', nombre: 'Antieliminar' },

    // 🔹 Módulos de bot
    frases: { key: 'frases', tipo: 'bot', emoji: '💡', nombre: 'Frases' },
    autobio: { key: 'autobio', tipo: 'bot', emoji: '📃', nombre: 'Autobiografía' },
    antispam: { key: 'antiSpam', tipo: 'bot', emoji: '🚫', nombre: 'Antispam' },
    antiprivado: { key: 'antiPrivate', tipo: 'bot', emoji: '🔒', nombre: 'Antiprivado' },
  };

  // ✅ Mostrar panel de configuración si solo ponen .config
  if (!command || command === 'config') {
    let msg = '📌 *Panel de Configuración del Grupo*\n\n';

    msg += '╭─〔 *Funciones del Grupo* 〕\n';
    for (let [nombre, info] of Object.entries(opciones)) {
      if (info.tipo === 'chat') {
        const estado = chat[info.key] === true ? '✅' : '❌';
        msg += `│ ${info.emoji} ${info.nombre}: ${estado}\n`;
      }
    }
    msg += '╰────────────────────\n\n';

    msg += '╭─〔 *Funciones del Bot* 〕\n';
    for (let [nombre, info] of Object.entries(opciones)) {
      if (info.tipo === 'bot') {
        const estado = bot[info.key] === true ? '✅' : '❌';
        msg += `│ ${info.emoji} ${info.nombre}: ${estado}\n`;
      }
    }
    msg += '╰────────────────────\n\n';

    msg += `⚙️ Usa *.nombre* para activar o desactivar (ej: *.welcome*).`;

    return conn.sendMessage(m.chat, { text: msg }, { quoted: m });
  }

  // ⚡ Si el comando coincide con una opción, alternar estado
  const key = opciones[command]?.key;
  const tipo = opciones[command]?.tipo;
  if (!key) return;

  // Solo admin o dueño puede modificar
  if (!isAdmin && !isOwner)
    return m.reply('🚫 Solo los administradores o el dueño pueden cambiar la configuración.');

  if (tipo === 'chat') {
    chat[key] = !chat[key];
  } else {
    bot[key] = !bot[key];
  }

  const estado = tipo === 'chat' ? chat[key] : bot[key];
  return m.reply(`🛠 *${opciones[command].nombre}* fue ${estado ? '✅ activado' : '❌ desactivado'}.`);
};

// 🔹 Comandos
handler.command = [
  'config',
  ...Object.keys({
    welcome: 0,
    autoresponder: 0,
    detect: 0,
    antilink: 0,
    antilink2: 0,
    nsfw: 0,
    autolevelup: 0,
    autosticker: 0,
    reaction: 0,
    antitoxic: 0,
    audios: 0,
    modoadmin: 0,
    antifake: 0,
    antibot: 0,
    games: 0,
    simi: 0,
    autoaceptar: 0,
    autorechazar: 0,
    autofrase: 0,
    antidelete: 0,
    frases: 0,
    autobio: 0,
    antispam: 0,
    antiprivado: 0
  })
];

handler.help = ['config'];
handler.tags = ['config'];
handler.group = true;
handler.register = true;

export default handler;
