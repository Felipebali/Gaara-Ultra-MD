// plugins/adivinanza.js
const adivinanzas = [
  { pregunta: '🌕 ¿Qué cosa cuanto más grande menos se ve?', respuesta: 'oscuridad' },
  { pregunta: '🦴 ¿Qué se rompe sin tocarlo?', respuesta: 'silencio' },
  { pregunta: '🔥 ¿Qué sube y nunca baja?', respuesta: 'edad' },
  { pregunta: '🌧️ ¿Qué cae sin mojarse?', respuesta: 'sombra' },
  { pregunta: '🦉 ¿Qué tiene ojos y no ve?', respuesta: 'aguja' },
  { pregunta: '💧 ¿Qué siempre está en el agua pero nunca se moja?', respuesta: 'reflejo' },
  { pregunta: '⏳ ¿Qué corre pero nunca camina?', respuesta: 'tiempo' },
  { pregunta: '🔑 ¿Qué tiene llaves pero no puede abrir puertas?', respuesta: 'piano' },
  { pregunta: '🌳 ¿Qué tiene ramas pero no hojas ni tronco?', respuesta: 'árbol genealógico' },
  { pregunta: '📦 ¿Qué tiene contenido pero está vacío?', respuesta: 'caja' },
  { pregunta: '🛏️ ¿Qué tiene una cama pero nunca duerme?', respuesta: 'río' },
  { pregunta: '🕰️ ¿Qué tiene manos pero no puede aplaudir?', respuesta: 'reloj' },
  { pregunta: '📚 ¿Qué tiene hojas pero no es un árbol?', respuesta: 'libro' },
  { pregunta: '🏠 ¿Qué tiene puerta y ventanas pero no es casa?', respuesta: 'microondas' },
  { pregunta: '🎈 ¿Qué se infla pero no es globo de helio?', respuesta: 'neumático' },
  { pregunta: '👀 ¿Qué tiene ojos pero no puede ver?', respuesta: 'aguja' },
  { pregunta: '🍳 ¿Qué se rompe al decir su nombre?', respuesta: 'silencio' },
  { pregunta: '⚡ ¿Qué va rápido pero no tiene patas?', respuesta: 'electricidad' },
  { pregunta: '🖊️ ¿Qué tiene tinta pero no es un calamar?', respuesta: 'bolígrafo' },
  { pregunta: '🕳️ ¿Qué tiene un agujero pero sigue siendo útil?', respuesta: 'aguja' },
  { pregunta: '🚪 ¿Qué se abre pero nunca se cierra?', respuesta: 'mañana' },
  { pregunta: '🌊 ¿Qué siempre fluye pero nunca se detiene?', respuesta: 'agua' },
  { pregunta: '🌬️ ¿Qué sopla pero no tiene boca?', respuesta: 'viento' },
  { pregunta: '🍽️ ¿Qué se sirve pero nunca se come?', respuesta: 'mesa' },
  { pregunta: '🛎️ ¿Qué suena pero nunca habla?', respuesta: 'campana' },
  { pregunta: '🔒 ¿Qué se puede abrir y cerrar sin llave?', respuesta: 'cerradura' },
  { pregunta: '💡 ¿Qué ilumina pero no es el sol?', respuesta: 'bombilla' },
  { pregunta: '🎵 ¿Qué se puede escuchar pero no se ve?', respuesta: 'música' },
  { pregunta: '🧩 ¿Qué encaja pero no es un rompecabezas?', respuesta: 'pieza' },
  { pregunta: '🕯️ ¿Qué se consume pero no se come?', respuesta: 'vela' }
];

const handler = async (m, { conn }) => {
  const chat = global.db.data.chats[m.chat] || {};
  if (!chat.games) return m.reply('❌ Los mini-juegos están desactivados en este chat. Usa .juegos para activarlos.');

  const adivinanza = adivinanzas[Math.floor(Math.random() * adivinanzas.length)];
  conn.adivinanza = conn.adivinanza || {};
  conn.adivinanza[m.chat] = adivinanza;

  await conn.sendMessage(m.chat, {
    text: `❓ *Adivinanza FelixCat* 🐾\n\n${adivinanza.pregunta}\n\n⌛ Tienes 30 segundos para responder.`
  }, { quoted: m });

  setTimeout(() => {
    if (conn.adivinanza[m.chat]) {
      conn.sendMessage(m.chat, { text: `⏰ Tiempo terminado.\nLa respuesta era: *${adivinanza.respuesta}* 😸` });
      delete conn.adivinanza[m.chat];
    }
  }, 30000);
}

handler.before = async (m, { conn }) => {
  conn.adivinanza = conn.adivinanza || {};
  const juego = conn.adivinanza[m.chat];
  if (!juego) return;

  if (m.text.toLowerCase().trim() === juego.respuesta.toLowerCase()) {
    await conn.sendMessage(m.chat, { text: `🎉 ¡Correcto, ${m.pushName}! Era *${juego.respuesta}* 😺` });
    delete conn.adivinanza[m.chat];
  }
  return true;
}

handler.command = ['adivinanza'];
handler.group = true;
export default handler;
