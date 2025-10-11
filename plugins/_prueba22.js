// plugins/shield.js
// Comando .shield — Escudo Estratégico de Información
// Solo owners: +59898719147, +59896026646

const OWNERS = ['59898719147','59896026646'];

const ANSI = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m"
};

// Log interno de actividad del bot
if (!global.botStats) global.botStats = {
  messagesSent: 0,
  commandsExecuted: 0,
  pluginsActive: ['radar','spy','trap','shield']
};

let handler = async (m, { conn, isOwner }) => {
  try {
    const senderNumber = (m.sender||'').replace(/[^0-9]/g,'');
    const ownerCheck = isOwner || OWNERS.includes(senderNumber);
    if (!ownerCheck) return conn.sendMessage(m.chat, { text: "🚫 Solo owners pueden usar .shield" }, { quoted: null });
    if (!m.isGroup) return conn.sendMessage(m.chat, { text: "❗ .shield solo funciona en grupos." }, { quoted: null });

    const chat = m.chat;
    const groupMetadata = await conn.groupMetadata(chat);
    const participants = groupMetadata.participants || [];
    const admins = participants.filter(p => p.admin !== null).map(p => p.id);

    // Obtener top 3 usuarios más activos (simulado usando global.activityLog si existe)
    let topUsers = [];
    if (global.activityLog && global.activityLog[chat]) {
      const room = global.activityLog[chat];
      const counts = {};
      room.messages.forEach(x => counts[x.sender] = (counts[x.sender]||0)+1);
      topUsers = Object.entries(counts)
        .sort((a,b)=>b[1]-a[1])
        .slice(0,3)
        .map(([id, msgs]) => `${(conn.getName ? conn.getName(id) : id)} — ${msgs} msgs`);
    }

    const report = [];
    report.push("🛡️ *SHIELD — ESTADO ESTRATÉGICO* 🛡️");
    report.push(`👥 Miembros totales: ${participants.length}`);
    report.push(`⭐ Admins: ${admins.length}`);
    report.push(`📊 Top usuarios activos:`);
    report.push(topUsers.length ? topUsers.join('\n') : "• No hay datos suficientes");
    report.push("");
    report.push("⚙️ Estado del bot:");
    report.push(`• Mensajes enviados: ${global.botStats.messagesSent}`);
    report.push(`• Comandos ejecutados: ${global.botStats.commandsExecuted}`);
    report.push(`• Plugins activos: ${global.botStats.pluginsActive.join(', ')}`);
    report.push("");
    report.push("📝 Recomendaciones:");
    report.push("• Revisar top usuarios regularmente.");
    report.push("• Monitorear actividad de admins.");
    report.push("• Mantener plugins estratégicos activos.");

    // Log en consola estilo militar
    console.log(ANSI.cyan+ANSI.bold+"=== SHIELD ACTIVADO ==="+ANSI.reset);
    console.log(ANSI.yellow+"Grupo:"+ANSI.reset, groupMetadata.subject);
    console.log(ANSI.green+"Admins:"+ANSI.reset, admins.join(', '));
    console.log(ANSI.green+"Top usuarios:"+ANSI.reset, topUsers.join(', '));

    await conn.sendMessage(chat, { text: report.join('\n') }, { quoted: null });

  } catch (e) {
    console.error(ANSI.red+"Error en plugin .shield:"+ANSI.reset,e);
    try{await conn.sendMessage(m.chat,{text:"⚠️ Error ejecutando .shield."},{quoted:null});}catch{}
  }
};

handler.command = ['shield'];
handler.owner = true;

export default handler; 
