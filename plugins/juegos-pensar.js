// plugins/pensar.js
let usados = {}; // Registro de respuestas usadas por chat

let handler = async (m, { conn, text }) => {
    try {
        const chat = global.db.data.chats[m.chat] || {};
        if (!chat.games) return await conn.sendMessage(m.chat, { text: '❌ Los juegos están desactivados. Usa .juegos para activarlos.' });

        const respuestas = [
            "😼 Sí, definitivamente",
            "🐾 No, no lo creo",
            "🤔 Tal vez…",
            "⏳ Pregunta de nuevo más tarde",
            "🎉 ¡Claro que sí!",
            "🌀 No estoy seguro, intenta de nuevo",
            "🐱 Absolutamente sí",
            "😹 No lo hagas",
            "✔️ Todo apunta a que sí",
            "⏰ Mejor espera un poco",
            "🤷 La respuesta es incierta",
            "🧠 Confía en tu instinto",
            "⚠️ Es posible, pero con cuidado",
            "❌ No lo hagas ahora",
            "👍 Todo indica que sí"
        ];

        if (!usados[m.chat]) usados[m.chat] = [];
        const disponibles = respuestas.filter(r => !usados[m.chat].includes(r));

        let respuesta;
        if (disponibles.length === 0) {
            usados[m.chat] = [];
            respuesta = respuestas[Math.floor(Math.random() * respuestas.length)];
        } else {
            respuesta = disponibles[Math.floor(Math.random() * disponibles.length)];
        }
        usados[m.chat].push(respuesta);

        const pregunta = text ? text.replace(/\.pensar\s*/i,'').trim() : null;

        let mensaje;
        if (!pregunta) {
            mensaje = `🔮 *Bola Mágica de FelixCat* 🔮\n\n💭 Hazme una pregunta usando:\n*_.pensar <tu pregunta>_*\n✨ y yo te responderé con mi magia.`;
        } else {
            // Mensaje minimalista pero llamativo
            mensaje = `
✨ 🔮 *BOLA MÁGICA FELIXCAT* 🔮 ✨

❓ Pregunta:
> ${pregunta}

💡 Respuesta:
> ${respuesta}

🌟 Que la suerte te acompañe 😼
`;
        }

        await conn.sendMessage(m.chat, { text: mensaje });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { text: '✖️ Ocurrió un error al usar la bola mágica.' });
    }
};

handler.command = ['pensar'];
handler.group = true;
handler.admin = false;
handler.rowner = false;

export default handler;
