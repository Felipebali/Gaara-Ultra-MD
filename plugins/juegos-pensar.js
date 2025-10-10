// plugins/pensar.js
let usados = {}; // Registro de respuestas usadas por chat

let handler = async (m, { conn, text }) => {
    try {
        const chat = global.db.data.chats[m.chat] || {};
        if (!chat.games) {
            return await conn.sendMessage(m.chat, { text: '❌ Los juegos están desactivados. Usa .juegos para activarlos.' });
        }

        const respuestas = [
            "Sí, definitivamente 😼",
            "No, no lo creo 🐾",
            "Tal vez… 🤔",
            "Pregunta de nuevo más tarde ⏳",
            "¡Claro que sí! 🎉",
            "No estoy seguro, intenta de nuevo 🌀",
            "Absolutamente sí 🐱",
            "No lo hagas 😹",
            "Todo apunta a que sí ✔️",
            "Mejor espera un poco ⏰",
            "La respuesta es incierta 🤷",
            "Confía en tu instinto 🧠",
            "Es posible, pero con cuidado ⚠️",
            "No lo hagas ahora ❌",
            "Todo indica que sí 👍"
        ];

        if (!usados[m.chat]) usados[m.chat] = [];
        const disponibles = respuestas.filter(r => !usados[m.chat].includes(r));

        let respuesta;
        if (disponibles.length === 0) {
            // Todas usadas, reiniciar
            usados[m.chat] = [];
            respuesta = respuestas[Math.floor(Math.random() * respuestas.length)];
        } else {
            respuesta = disponibles[Math.floor(Math.random() * disponibles.length)];
        }

        usados[m.chat].push(respuesta);

        const pregunta = text ? text.replace('.pensar','').trim() : 'Tu pregunta';
        await conn.sendMessage(m.chat, { text: `❓ ${pregunta}\n💭 Respuesta: ${respuesta}` });

    } catch (e) {
        console.error(e);
        await m.reply('✖️ Error al pensar la respuesta.');
    }
};

handler.command = ['pensar'];
handler.group = true;
handler.admin = false;
handler.rowner = false;

export default handler; 
