// plugins/t.js
let mensajesDivertidos = [
    "🎉 ¡Hey! Todos deberían leer esto 😏",
    "👀 Atención, atención… algo raro está pasando",
    "😈 No puedo decir mucho, pero todos tienen que verlo",
    "🔥 Sorpresa misteriosa para todos ustedes",
    "🤖 El bot dice: ¡Hola a todos sin que lo sepan!"
];

import { randomInt } from 'crypto';

let handler = async (m, { conn, participants }) => {
    if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos.');

    // Elegir mensaje aleatorio
    let index = randomInt(0, mensajesDivertidos.length);
    let mensaje = mensajesDivertidos[index];

    // Generar mentions ocultas
    let mentions = participants.map(u => u.id);

    // Enviar mensaje divertido con menciones ocultas
    await conn.sendMessage(m.chat, {
        text: mensaje,
        mentions: mentions
    });
};

handler.help = ['t'];
handler.tags = ['fun', 'grupo'];
handler.command = ['t']; // Comando .t

export default handler;
