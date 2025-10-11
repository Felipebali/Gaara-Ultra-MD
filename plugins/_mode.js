// plugins/mode.js
// .mode — Modo operativo creativo del bot
// Owners: +59898719147, +59896026646

const OWNERS = ['59898719147','59896026646'];

const ANSI = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m"
};

// Modos internos del bot
let BOT_MODE = 'normal'; // normal, stealth, loud, fun, omega

let handler = async (m, { conn, args, isOwner }) => {
  try {
    const sender = (m.sender||'').replace(/[^0-9]/g,'');
    if (!(isOwner || OWNERS.includes(sender))) {
      return conn.sendMessage(m.chat, { text: "🚫 ACCESO DENEGADO — Solo owners." }, { quoted: null });
    }

    const action = args[0] ? args[0].toLowerCase() : 'status';
    const validModes = ['normal','stealth','loud','fun','omega'];

    if (action === 'status') {
      // Estilo visual según el modo activo
      let prefix = '';
      let suffix = '';
      let color = ANSI.cyan;

      switch(BOT_MODE){
        case 'stealth':
          prefix = "🕵️‍♂️ Sigilo activado 🕵️‍♀️";
          suffix = "🔎 Todo se monitorea silenciosamente...";
          color = ANSI.yellow;
          break;
        case 'loud':
          prefix = "💥 ALERTA MÁXIMA 💥";
          suffix = "⚡ Respuestas extra cargadas!";
          color = ANSI.red;
          break;
        case 'fun':
          prefix = "😂 MODO DIVERSIÓN 😂";
          suffix = "🎉 Mensajes con humor activado!";
          color = ANSI.magenta;
          break;
        case 'omega':
          prefix = "🪖 NIVEL OMEGA ACTIVADO 🪖";
          suffix = "⚔️ Todo táctico y militar!";
          color = ANSI.green;
          break;
        default:
          prefix = "⚙️ MODO NORMAL ⚙️";
          suffix = "ℹ️ Operación estándar";
      }

      const lines = [];
      lines.push(color+prefix+ANSI.reset);
      lines.push(`👤 Owner: ${sender}`);
      lines.push(`✅ Modo activo: *${BOT_MODE}*`);
      lines.push(suffix);
      await conn.sendMessage(m.chat, { text: lines.join("\n") }, { quoted: null });
      console.log(ANSI.cyan+"[MODE] Status consultado por owner:"+ANSI.reset, sender);
      return;
    }

    if (action === 'set') {
      const newMode = args[1] ? args[1].toLowerCase() : null;
      if (!newMode || !validModes.includes(newMode)) {
        return conn.sendMessage(m.chat, {
          text: `❗ Modo inválido.\nModos válidos: ${validModes.join(", ")}\nUso: .mode set <modo>`
        }, { quoted: null });
      }
      BOT_MODE = newMode;

      let announce = '';
      switch(BOT_MODE){
        case 'stealth': announce = "🕵️ Bot entrando en modo sigiloso..."; break;
        case 'loud': announce = "💥 Bot ahora en modo ALTO VOLTAJE!"; break;
        case 'fun': announce = "🎉 Bot activando humor y diversión!"; break;
        case 'omega': announce = "🪖 Bot nivel OMEGA — máxima táctica!"; break;
        default: announce = "⚙️ Bot en modo normal.";
      }

      const lines = [];
      lines.push("⚙️ *MODE — MODO CAMBIADO* ⚙️");
      lines.push(`👤 Ejecutado por: ${sender}`);
      lines.push(`✅ Nuevo modo activo: *${BOT_MODE}*`);
      lines.push(announce);
      lines.push("ℹ️ Este cambio solo afecta estilo y logs internos, nada externo.");
      await conn.sendMessage(m.chat, { text: lines.join("\n") }, { quoted: null });
      console.log(ANSI.green+"[MODE] Modo cambiado por owner:"+ANSI.reset, sender, "->", BOT_MODE);
      return;
    }

    // Acción inválida
    await conn.sendMessage(m.chat, { text: "❗ Comando inválido.\nOpciones: status, set <modo>" }, { quoted: null });

  } catch(err) {
    console.error(ANSI.red+"Error plugin .mode:"+ANSI.reset, err);
    try { await conn.sendMessage(m.chat, { text: "⚠️ Error ejecutando .mode." }, { quoted: null }); } catch{}
  }
};

handler.command = ['mode'];
handler.owner = true;

export default handler;
