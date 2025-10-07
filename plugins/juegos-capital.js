// plugins/capital.js

let capitales = {
  "Uruguay": "Montevideo",
  "Argentina": "Buenos Aires",
  "Brasil": "Brasilia",
  "Chile": "Santiago",
  "Paraguay": "Asunción",
  "Perú": "Lima",
  "México": "Ciudad de México",
  "España": "Madrid",
  "Francia": "París",
  "Alemania": "Berlín",
  "Italia": "Roma",
  "Japón": "Tokio",
  "China": "Pekín",
  "Rusia": "Moscú",
  "Estados Unidos": "Washington D.C.",
  "Canadá": "Ottawa",
  "Colombia": "Bogotá",
  "Venezuela": "Caracas",
  "Bolivia": "Sucre",
  "Ecuador": "Quito",
  "Portugal": "Lisboa",
  "Reino Unido": "Londres",
  "Egipto": "El Cairo",
  "India": "Nueva Delhi",
  "Australia": "Canberra",
  "Sudáfrica": "Pretoria",
  "Suecia": "Estocolmo",
  "Noruega": "Oslo",
  "Dinamarca": "Copenhague",
  "Grecia": "Atenas"
};

let partidas = {};

let handler = async (m, { conn }) => {
  const chat = global.db.data.chats[m.chat] || {};
  if (!chat.games) return conn.reply(m.chat, '🎮 Los mini-juegos están desactivados en este grupo.\nUsa *.juegos* para activarlos.', m);

  let id = m.chat;
  if (id in partidas) {
    return conn.reply(m.chat, '⚠️ Ya hay una partida en curso. Espera que termine.', m);
  }

  let paises = Object.keys(capitales);
  let pais = paises[Math.floor(Math.random() * paises.length)];
  let capital = capitales[pais];

  conn.reply(m.chat, `🌍 ¿Cuál es la capital de *${pais}*?\nTienes 20 segundos para responder...`, m);

  partidas[id] = { capital, tiempo: setTimeout(() => {
    if (partidas[id]) {
      conn.reply(m.chat, `⏰ Se acabó el tiempo.\nLa capital correcta era *${capital}*.`, m);
      delete partidas[id];
    }
  }, 20000) };
};

handler.before = async (m, { conn }) => {
  const chat = global.db.data.chats[m.chat] || {};
  if (!chat.games) return; // si los juegos están desactivados, no responde nada

  let id = m.chat;
  if (!(id in partidas)) return;

  let respuesta = m.text?.trim().toLowerCase();
  let correcta = partidas[id].capital.toLowerCase();

  if (respuesta === correcta) {
    conn.reply(m.chat, `✅ ¡Correcto! *${partidas[id].capital}* es la capital.`, m);
    clearTimeout(partidas[id].tiempo);
    delete partidas[id];
  } else if (respuesta.length > 1) {
    conn.reply(m.chat, `❌ Incorrecto. Intenta otra vez.`, m);
  }
};

handler.help = ['capital'];
handler.tags = ['juegos'];
handler.command = ['capital'];

export default handler;
