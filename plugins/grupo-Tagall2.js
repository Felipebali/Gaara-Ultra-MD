// plugins/tagallT.js
// Activador: letra "T" o "t" (sin prefijo)
// Solo ADMIN o OWNER puede activarlo
// Mención visible a un usuario al azar + mención oculta a todos los demás

let handler = async (m, { conn, groupMetadata, isAdmin, isOwner }) => {
  try {
    if (!m.isGroup) return; // Solo en grupos
    if (!isAdmin && !isOwner) return; // Solo admin u owner

    const texto = (m.text || '').trim();
    if (!texto || texto.toLowerCase() !== 't') return; // Solo "T" o "t"

    const participantes = (groupMetadata?.participants || []).map(p =>
      conn.decodeJid ? conn.decodeJid(p.id) : p.id
    ).filter(Boolean);

    if (participantes.length < 2) {
      return conn.sendMessage(m.chat, { text: '❌ No hay suficientes miembros detectables.' });
    }

    // Elegir usuario visible
    const usuarioAzar = participantes[Math.floor(Math.random() * participantes.length)];
    const mencionesOcultas = participantes.filter(u => u !== usuarioAzar);

    // Frases con mención visible al usuario random
    const frases = [
      `💣 @${usuarioAzar.split('@')[0]} detonó el protocolo T global 💥`,
      `🚨 @${usuarioAzar.split('@')[0]} invocó a todos los presentes 😳`,
      `🔥 @${usuarioAzar.split('@')[0]} desató el CAOS en el grupo ⚡`,
      `😼 @${usuarioAzar.split('@')[0]} dijo “¡Que se enteren todos!” 📢`,
      `🎯 @${usuarioAzar.split('@')[0]} fue el elegido para romper el silencio 😎`,
      `👀 @${usuarioAzar.split('@')[0]} pulsó la tecla prohibida: T 🔥`,
      `😂 @${usuarioAzar.split('@')[0]} acaba de mencionar al universo entero 🌍`,
      `💀 @${usuarioAzar.split('@')[0]} abrió las puertas del TAGALL supremo 🌀`,
      `🪄 @${usuarioAzar.split('@')[0]} activó el hechizo T de convocatoria mágica ✨`,
      `⚔️ @${usuarioAzar.split('@')[0]} invocó la reunión de los grandes guerreros 🛡️`,
      `☠️ @${usuarioAzar.split('@')[0]} rompió el código del silencio global 😱`,
      `🐾 @${usuarioAzar.split('@')[0]} invocó al clan FelixCat 🐈‍⬛`,
      `🚨 ALERTA: @${usuarioAzar.split('@')[0]} activó una llamada grupal sin retorno 📣`,
      `🧨 @${usuarioAzar.split('@')[0]} liberó la energía dormida del grupo 💫`,
      `⚡ @${usuarioAzar.split('@')[0]} desató una tormenta de notificaciones ☁️`,
      `🎭 @${usuarioAzar.split('@')[0]} decidió que el silencio no era opción 🔊`,
      `📣 @${usuarioAzar.split('@')[0]} gritó: "¡TODOS, PRESENTE!" 🔥`,
      `🕹️ @${usuarioAzar.split('@')[0]} presionó el botón rojo sin pensar 💀`,
      `💬 @${usuarioAzar.split('@')[0]} quiso llamar la atención… y lo logró 😏`,
      `👁️‍🗨️ @${usuarioAzar.split('@')[0]} fue marcado como detonante oficial 👑`
    ];

    const mensaje = frases[Math.floor(Math.random() * frases.length)];

    await conn.sendMessage(m.chat, {
      text: mensaje,
      mentions: [usuarioAzar, ...mencionesOcultas]
    });

  } catch (err) {
    console.error('tagallT error:', err);
    conn.sendMessage(m.chat, { text: '❌ Ocurrió un error al ejecutar el comando T.' });
  }
};

// Detecta "T" o "t" sin prefijo
handler.customPrefix = /^\s*t\s*$/i;
handler.command = [''];
handler.group = true;
handler.register = true;

export default handler;
