// plugins/mentionBotNumeroFix.js
let handler = async (m, { conn }) => {
    if (!m.isGroup) return; // Solo grupos

    // Obtener texto del mensaje de manera segura
    const contenido = (m.message?.conversation ||
                      m.message?.extendedTextMessage?.text ||
                      "").toString();

    if (!contenido) return;

    // Expresión regular flexible para +598 92 682 421
    const numeroRegex = /\+598[\s\-]?92[\s\-]?682[\s\-]?421/;

    if (!numeroRegex.test(contenido)) return;

    // Detectar tono
    let tipoElegido;
    if (contenido === contenido.toUpperCase() && contenido.length > 3) {
        tipoElegido = "furioso";
    } else if (contenido.match(/😂|🤣|😹|😆/)) {
        tipoElegido = "joda";
    } else if (contenido.match(/tonto|idiota|feo|burro/i)) {
        tipoElegido = "enojado";
    } else if (contenido.match(/por favor|ayuda|necesito|explica/i)) {
        tipoElegido = "serio";
    } else {
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

    // Elegir respuesta aleatoria
    let msg = respuestas[tipoElegido][Math.floor(Math.random() * respuestas[tipoElegido].length)];
    msg = msg.replace("@usuario", `@${m.sender.split("@")[0]}`);

    // Enviar mensaje mencionando al usuario
    await conn.sendMessage(
        m.chat,
        { text: msg, mentions: [m.sender] }
    );
};

handler.command = new RegExp('^$'); // Sin prefijo
handler.group = true;

export default handler;
