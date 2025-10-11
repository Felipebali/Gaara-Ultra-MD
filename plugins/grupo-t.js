// plugins/t.js
import { randomInt } from 'crypto';

// Lista completa de mensajes sorpresa
let mensajesDivertidos = [
    "🎉 ¡Hey! Todos deberían leer esto 😏",
    "👀 Atención, atención… algo raro está pasando",
    "😈 No puedo decir mucho, pero todos tienen que verlo",
    "🔥 Sorpresa misteriosa para todos ustedes",
    "🤖 El bot dice: ¡Hola a todos sin que lo sepan!",
    "😜 Alguien tiene que reaccionar primero…",
    "👹 Esto es un mensaje secreto solo para ustedes",
    "😏 ¿Quién se atreve a contestar primero?",
    "⚡ Algo está por pasar… atentos todos",
    "🎭 Veamos quién está prestando atención…",
    "🩸 Nadie se lo espera, pero todos lo recibirán",
    "💀 Cuidado, esto podría cambiar el juego",
    "👁️ Todos están siendo observados…",
    "🔥 Esto es solo el comienzo de la diversión",
    "🤫 Misterio activado, lean con cuidado"
];

// Guardar historial por chat para evitar repetidos
let historialMensajes = {};

let handler = async (m, { conn, participants, isOwner }) => {
    if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos.');
    if (!isOwner) return m.reply('❌ Solo los dueños del bot pueden usar este comando.');

    // Inicializar historial del chat si no existe
    if (!historialMensajes[m.chat]) historialMensajes[m.chat] = [];

    // Filtrar mensajes que ya se usaron
    let disponibles = mensajesDivertidos.filter(msg => !historialMensajes[m.chat].includes(msg));

    // Si se acabaron los mensajes, resetear historial
    if (disponibles.length === 0) {
        historialMensajes[m.chat] = [];
        disponibles = [...mensajesDivertidos];
    }

    // Elegir mensaje aleatorio de los disponibles
    let index = randomInt(0, disponibles.length);
    let mensaje = disponibles[index];

    // Guardar en historial para no repetir
    historialMensajes[m.chat].push(mensaje);

    // Generar mentions ocultas
    let mentions = participants.map(u => u.id);

    // Enviar mensaje con mención oculta
    await conn.sendMessage(m.chat, {
        text: mensaje,
        mentions: mentions
    });
};

handler.help = ['t'];
handler.tags = ['fun', 'grupo'];
handler.command = ['t', 'hola']; // Comando .t

export default handler;
