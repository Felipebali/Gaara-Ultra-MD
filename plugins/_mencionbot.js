// plugins/mentionBotTono.js
let handler = async (m, { conn }) => {
    if (!m.isGroup) return; // Solo en grupos
    const mentioned = m.mentionedJid || [];

    // Revisamos si mencionaron al bot
    if (!mentioned.includes(conn.user.jid)) return;

    const contenido = m.text || "";
    
    // Detectar tono según contenido
    let tipoElegido;

    // 1. Furioso si escribe todo en mayúsculas
    if (contenido === contenido.toUpperCase() && contenido.length > 3) {
        tipoElegido = "furioso";
    } 
    // 2. Joda si hay emojis de risa
    else if (contenido.match(/😂|🤣|😹|😆/)) {
        tipoElegido = "joda";
    }
    // 3. Enojado si hay palabras ofensivas (puedes expandir la lista)
    else if (contenido.match(/tonto|idiota|feo|burro/i)) {
        tipoElegido = "enojado";
    }
    // 4. Serio si hay palabras formales
    else if (contenido.match(/por favor|ayuda|necesito|explica/i)) {
        tipoElegido = "serio";
    }
    // 5. Aleatorio si no cumple ninguna condición
    else {
        const tipos = ["joda", "serio", "enojado", "furioso", "insulto"];
        tipoElegido = tipos[Math.floor(Math.random() * tipos.length)];
    }

    const respuestas = {
        joda: [
            "😹 ¡Ey @usuario! No me molestes tanto.",
            "😂 @usuario otra vez mencionándome...",
            "😎 @usuario estoy ocupado mirando memes."
        ],
        serio: [
            "📌 @usuario Sí, te escucho.",
            "⚠️ @usuario Por favor, habla con claridad.",
            "🧐 @usuario Estoy aquí para ayudarte."
        ],
        enojado: [
            "😤 @usuario ¿Otra vez tú?",
            "🙄 @usuario Ya basta, ¿sí?",
            "😒 @usuario No me hagas perder la paciencia."
        ],
        furioso: [
            "😡 @usuario ¡Estoy harto!",
            "🔥 @usuario ¡No me hagas enojar más!",
            "💢 @usuario ¡Esto es el colmo!"
        ],
        insulto: [
            "😅 @usuario Vaya, qué pesado eres...",
            "😏 @usuario ¿En serio me mencionas otra vez?",
            "😬 @usuario Pareces un dolor de cabeza ambulante."
        ]
    };

    // Elegir respuesta aleatoria dentro del tipo detectado
    let msg = respuestas[tipoElegido][Math.floor(Math.random() * respuestas[tipoElegido].length)];

    // Sustituir @usuario por la mención real
    msg = msg.replace("@usuario", `@${m.sender.split("@")[0]}`);

    // Enviar mensaje mencionando al usuario
    await conn.sendMessage(
        m.chat,
        {
            text: msg,
            mentions: [m.sender]
        }
    );
};

handler.command = new RegExp('^$'); // Sin prefijo
handler.group = true;

export default handler; 
