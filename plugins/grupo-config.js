const handler = async (m, { conn, command, args, isAdmin, isOwner, usedPrefix }) => {
  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {};
  if (!global.db.data.settings[conn.user.jid]) global.db.data.settings[conn.user.jid] = {};

  const chat = global.db.data.chats[m.chat];
  const bot = global.db.data.settings[conn.user.jid];
  const type = (args[0] || '').toLowerCase();

  // 🔧 Lista de funciones configurables (chat o global)
  const opciones = {
    welcome: { key: 'welcome', tipo: 'chat' },
    autoresponder: { key: 'autoresponder', tipo: 'chat' },
    detect: { key: 'detect', tipo: 'chat' },
    antilink: { key: 'antiLink', tipo: 'chat' },
    antilink2: { key: 'antiLink2', tipo: 'chat' },
    nsfw: { key: 'nsfw', tipo: 'chat' },
    autolevelup: { key: 'autolevelup', tipo: 'chat' },
    autosticker: { key: 'autosticker', tipo: 'chat' },
    reaction: { key: 'reaction', tipo: 'chat' },
    antitoxic: { key: 'antitoxic', tipo: 'chat' },
    audios: { key: 'audios', tipo: 'chat' },
    modoadmin: { key: 'modoadmin', tipo: 'chat' },
    antifake: { key: 'antifake', tipo: 'chat' },
    antibot: { key: 'antiBot', tipo: 'chat' },
    frases: { key: 'frases', tipo: 'bot' },
    autobio: { key: 'autobio', tipo: 'bot' },
    antispam: { key: 'antiSpam', tipo: 'bot' },
    antiprivado: { key: 'antiPrivate', tipo: 'bot' },
    simi: { key: 'simi', tipo: 'chat' },
    autoaceptar: { key: 'autoAceptar', tipo: 'chat' },
    autorechazar: { key: 'autoRechazar', tipo: 'chat' },
    autofrase: { key: 'autoFrase', tipo: 'chat' },
    antidelete: { key: 'delete', tipo: 'chat' },
  };

  // ✅ Mostrar panel de configuración si solo ponen .config
  if (!command || command === 'config') {
    let msg = `📌 *Configuración del grupo*\n\n`;
    for (let [nombre, info] of Object.entries(opciones)) {
      const valor =
        info.tipo === 'chat'
          ? chat[info.key] === true
          : bot[info.key] === true;
      msg += `• ${nombre.charAt(0).toUpperCase() + nombre.slice(1)}: ${
        valor ? '✅ Activado' : '❌ Desactivado'
      }\n`;
    }
    msg += `\n⚙️ Usa *.nombre* (por ejemplo: *.welcome*) para activar o desactivar.`;
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
  return m.reply(`🛠 *${command.toUpperCase()}* fue ${estado ? '✅ activado' : '❌ desactivado'}.`);
};

// 🔹 Los comandos se crean automáticamente a partir de las claves de opciones
handler.command = [
  'config',
  ...[
    'welcome',
    'autoresponder',
    'detect',
    'antilink',
    'antilink2',
    'nsfw',
    'autolevelup',
    'autosticker',
    'reaction',
    'antitoxic',
    'audios',
    'modoadmin',
    'antifake',
    'antibot',
    'frases',
    'autobio',
    'antispam',
    'antiprivado',
    'simi',
    'autoaceptar',
    'autorechazar',
    'autofrase',
    'antidelete'
  ]
];

handler.help = ['config'];
handler.tags = ['config'];
handler.group = true;
handler.register = true;

export default handler;
