// 🪖 Grupo y Bot Config Militar
const handler = async (m, { conn, command, args, isAdmin, isOwner }) => {
  // Inicializar datos
  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {};
  if (!global.db.data.settings[conn.user.jid]) global.db.data.settings[conn.user.jid] = {};

  const chat = global.db.data.chats[m.chat];
  const bot  = global.db.data.settings[conn.user.jid];

  // 🔧 Funciones configurables
  const opciones = {
    welcome: { key:'welcome', tipo:'chat', emoji:'🎉', nombre:'Bienvenida' },
    despedida: { key:'despedida', tipo:'chat', emoji:'👋', nombre:'Despedida' },
    antilink: { key:'antiLink', tipo:'chat', emoji:'🔗', nombre:'Antilink' },
    antilink2: { key:'antiLink2', tipo:'chat', emoji:'⛔', nombre:'Antilink 2' },
    nsfw: { key:'nsfw', tipo:'chat', emoji:'🔞', nombre:'NSFW' },
    modoadmin: { key:'modoadmin', tipo:'chat', emoji:'👑', nombre:'Modo Admin' },
    antifake: { key:'antifake', tipo:'chat', emoji:'🚫', nombre:'Antifake' },
    antibot: { key:'antibot', tipo:'chat', emoji:'🤖', nombre:'Antibot' },
    juegos: { key:'games', tipo:'chat', emoji:'🎮', nombre:'Juegos' },
    simi: { key:'simi', tipo:'chat', emoji:'💬', nombre:'ChatBot' },
    autoaceptar: { key:'autoAceptar', tipo:'chat', emoji:'✅', nombre:'Autoaceptar' },
    autorechazar: { key:'autoRechazar', tipo:'chat', emoji:'❌', nombre:'Autorechazar' },
  };

  // Mostrar panel si solo ponen .config
  if (!command || command === 'config') {
    let msg = '📌 *Panel de Configuración*\n\n';
    msg += '╭─〔 *Funciones del Grupo* 〕\n';
    for (let [_, info] of Object.entries(opciones)) {
      if (info.tipo === 'chat') {
        const estado = chat[info.key] === true ? '✅ Activado' : '❌ Desactivado';
        msg += `│ ${info.emoji} ${info.nombre}: ${estado}\n`;
      }
    }
    msg += '╰────────────────────\n\n';
    msg += '⚙️ Usa *.config nombre1 nombre2 ...* para activar/desactivar varias funciones.\n';
    msg += '⚙️ O usa directamente el comando (ej: *.antilink*).';
    return conn.sendMessage(m.chat, { text: msg });
  }

  // Solo admins o dueño pueden modificar
  if (!isAdmin && !isOwner) 
    return conn.sendMessage(m.chat, { text: '🚫 Solo administradores o el dueño pueden cambiar la configuración.' });

  // Si es comando directo o con argumentos
  const procesar = arr => {
    let resultados = [];
    for (let arg of arr) {
      const key = opciones[arg]?.key;
      const tipo = opciones[arg]?.tipo;
      const nombre = opciones[arg]?.nombre;
      if (!key) continue;
      if (tipo === 'chat') chat[key] = !chat[key];
      else bot[key] = !bot[key];
      const estado = tipo === 'chat' ? chat[key] : bot[key];
      resultados.push(`${estado ? '✅' : '🛑'} ${nombre} ${estado ? 'activado' : 'desactivado'}`);
    }
    return resultados;
  };

  let comandos = args.length ? args : [command];
  let resultados = procesar(comandos);

  if (!resultados.length) return conn.sendMessage(m.chat, { text: '❌ No se reconocieron funciones para modificar.' });
  return conn.sendMessage(m.chat, { text: `📌 Configuración actualizada:\n\n${resultados.join('\n')}` });
};

// 🔹 Comandos
handler.command = [
  'config',
  ...Object.keys({
    welcome:0, despedida:0, antilink:0, antilink2:0, nsfw:0, modoadmin:0,
    antifake:0, antibot:0, juegos:0, simi:0, autoaceptar:0, autorechazar:0
  })
];

handler.help = ['config'];
handler.tags = ['config'];
handler.group = true;
handler.register = true;

export default handler;
