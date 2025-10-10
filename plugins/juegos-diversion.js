// plugins/diversion.js

let handler = async (m, { conn, text }) => {
    const chat = global.db.data.chats[m.chat] || {};

    if (!chat.games) {
        return await conn.sendMessage(m.chat, { text: '❌ Los juegos están desactivados. Usa el comando .juegos para activarlos.' });
    }

    const command = m.text.split(' ')[0].toLowerCase();

    // ====== CONSEJO ======
    if (command === '.consejo') {
        const consejos = [
            "💡 Recuerda tomar agua durante el día.",
            "😼 No confíes en gatos que hablan mucho.",
            "📚 Dedica al menos 30 minutos a aprender algo nuevo.",
            "🌿 Respira profundo y relájate un momento.",
            "🎵 Escucha tu canción favorita para levantar el ánimo.",
            "☕ A veces un café ayuda a pensar mejor.",
            "📝 Haz una lista de cosas por hacer y marca lo que completes.",
            "🏃‍♂️ Un poco de ejercicio ayuda a despejar la mente.",
            "😴 Dormir bien es parte de ser productivo.",
            "🌞 Sal a tomar un poco de sol, ¡tu cuerpo lo agradecerá!"
        ];
        const consejo = consejos[Math.floor(Math.random() * consejos.length)];
        await conn.sendMessage(m.chat, { text: `📌 Consejo: ${consejo}` });
    }

    // ====== PENSAR ======
    if (command === '.pensar') {
        const respuestas = [
            "Sí, definitivamente 😼",
            "No, no lo creo 🐾",
            "Tal vez… 🤔",
            "Pregunta de nuevo más tarde ⏳",
            "¡Claro que sí! 🎉",
            "No estoy seguro, intenta de nuevo 🌀"
        ];
        const respuesta = respuestas[Math.floor(Math.random() * respuestas.length)];
        const pregunta = text ? text.replace('.pensar','').trim() : 'Tu pregunta';
        await conn.sendMessage(m.chat, { text: `❓ ${pregunta}\n💭 Respuesta: ${respuesta}` });
    }

    // ====== NÚMERO DE LA SUERTE ======
    if (command === '.numero') {
        const numero = Math.floor(Math.random() * 100) + 1;
        await conn.sendMessage(m.chat, { text: `🍀 ${m.pushName}, tu número de la suerte es: *${numero}*` });
    }
};

handler.command = ['diversion'];
handler.group = true;
handler.admin = false;
handler.rowner = false;

export default handler;
