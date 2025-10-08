// plugins/configuracion-general.js
const handler = async (m, { conn, command, args, isAdmin, isOwner, usedPrefix }) => {
  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {};
  if (!global.db.data.settings[conn.user.jid]) global.db.data.settings[conn.user.jid] = {};

  const chat = global.db.data.chats[m.chat];
  const bot = global.db.data.settings[conn.user.jid];
  const type = (args[0] || '').toLowerCase();

  // 📋 Opciones configurables
  const opciones = {
    // Configuración del grupo
    welcome: { key: 'welcome', tipo: 'chat', emoji: '👋', nombre: 'Bienvenida' },
    autoresponder: { key: 'autoresponder', tipo: 'chat', emoji: '🤖', nombre: 'AutoResponder' },
    detect: { key: 'detect', tipo: 'chat', emoji: '👁️', nombre: 'Avisos' },
    antilink: { key: 'antiLink', tipo: 'chat', emoji: '🔗', nombre: 'Antilink' },
    antilink2: { key: 'antiLink2', tipo: 'chat', emoji: '🧷', nombre: 'Antilink 2' },
    nsfw: { key: 'nsfw', tipo: 'chat', emoji: '🔥', nombre: 'NSFW' },
    autolevelup: { key: 'autolevelup', tipo: 'chat', emoji: '📈', nombre: 'Auto Level Up' },
    autosticker: { key: 'autosticker', tipo: 'chat', emoji: '🎭', nombre: 'AutoSticker' },
    reaction: { key: 'reaction', tipo: 'chat', emoji: '💬', nombre: 'Reacciones' },
    antitoxic: { key: 'antitoxic', tipo: 'chat', emoji: '🚫', nombre: 'Anti Tóxico' },
    audios: { key: 'audios', tipo: 'chat', emoji: '🎧', nombre: 'Audios' },
    modoadmin: { key: 'modoadmin', tipo: 'chat', emoji: '🛡️', nombre: 'Modo Admin' },
    antifake: { key: 'antifake', tipo: 'chat', emoji: '🕵️', nombre: 'AntiFake' },
    antibot: { key: 'antiBot', tipo: 'chat', emoji: '🤖', nombre: 'AntiBot' },
    simi: { key: 'simi', tipo: 'chat', emoji: '💬', nombre: 'ChatBot Simi' },
    autoaceptar: { key: 'autoAceptar', tipo: 'chat', emoji: '✅', nombre: 'Auto Aceptar' },
    autorechazar: { key: 'autoRechazar', tipo: 'chat', emoji: '❌', nombre: 'Auto Rechazar' },
    autofrase: { key: 'autoFrase', tipo: 'chat', emoji: '💭', nombre: 'Auto Frase' },
    antidelete: { key: 'delete', tipo: 'chat', emoji: '🗑️', nombre: 'AntiDelete' },

    // Configuración del bot
    frases: { key: 'frases', tipo: 'bot', emoji: '💬', nombre: 'Frases Aleatorias' },
    autobio: { key: 'autobio', tipo: 'bot', emoji: '✏️', nombre: 'Auto Biografía' },
    antispam: { key: 'antiSpam', tipo: 'bot', emoji: '🚷', nombre: 'AntiSpam' },
    antiprivado: { key: 'antiPrivate', tipo: 'bot', emoji: '📵', nombre: 'AntiPrivado' }
  };

  // 🧾 Mostrar panel si solo se usa .config
  if (command === 'config') {
    let grupo = '╭━━━〔 ⚙️ *Configuración del Grupo* ⚙️ 〕━━━╮\n';
    let botcfg = '\n╭━━━〔 🤖 *Configuración del Bot* 🤖 〕━━━╮\n';

    for (let [nombre, info] of Object.entries(opciones)) {
      const valor = info.tipo === 'chat' ? chat[info.key] === true : bot[info.key] === true;
      const estado = valor ? '✅ Activado' : '❌ Desactivado';
      const linea = `┃ ${info.emoji} ${info.nombre}: ${estado}\n`;
      if (info.tipo === 'chat') grupo += linea;
      else botcfg += linea;
    }

    grupo += '╰━━━━━━━━━━━━━━━━━━━━━━━╯';
    botcfg += '╰━━━━━━━━━━━━━━━━━━━━━━━╯';

    const mensaje = `${grupo}\n${botcfg}\n\n💡 Usa *${usedPrefix}nombre* (ej: *${usedPrefix}welcome*) para activar o desactivar.`;

    await conn.sendMessage(m.chat, { text: mensaje }, { quoted: m });
    return;
  }

  // ⚙️ Alternar funciones
  const key = opciones[command]?.key;
  const tipo = opciones[command]?.tipo;
  if (!key) return;

  // Solo admin o dueño
  if (!isAdmin && !isOwner)
    return m.reply('🚫 Solo los administradores o el dueño del bot pueden cambiar configuraciones.');

  if (tipo === 'chat') chat[key] = !chat[key];
  else bot[key] = !bot[key];

  const estado = tipo === 'chat' ? chat[key] : bot[key];
  const emoji = opciones[command]?.emoji || '⚙️';
  const nombre = opciones[command]?.nombre || command.toUpperCase();

  await conn.sendMessage(
    m.chat,
    { text: `${emoji} *${nombre}* fue ${estado ? '✅ activado' : '❌ desactivado'}.` },
    { quoted: m }
  );
};

// 🔹 Generar comandos automáticamente
handler.command = [
  'config',
  ...Object.keys({
    welcome: 1,
    autoresponder: 1,
    detect: 1,
    antilink: 1,
    antilink2: 1,
    nsfw: 1,
    autolevelup: 1,
    autosticker: 1,
    reaction: 1,
    antitoxic: 1,
    audios: 1,
    modoadmin: 1,
    antifake: 1,
    antibot: 1,
    frases: 1,
    autobio: 1,
    antispam: 1,
    antiprivado: 1,
    simi: 1,
    autoaceptar: 1,
    autorechazar: 1,
    autofrase: 1,
    antidelete: 1
  })
];

handler.help = ['config'];
handler.tags = ['config'];
handler.group = true;
handler.register = true;

export default handler;
