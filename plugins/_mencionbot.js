// plugins/mentionBotTonoFix.js
let handler = async (m, { conn }) => {
    if (!m.isGroup) return; // Solo en grupos

    const botNumber = conn.user.jid.split('@')[0]; // número del bot
    const contenido = m.text || "";

    // Revisamos si el mensaje menciona al bot (por número)
    if (!contenido.includes(botNumber)) return;

    // Detectar tono según contenido
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

    let msg = respuestas[tipoElegido][Math.floor(Math.random() * respuestas[tipoElegido].length)];
    msg = msg.replace("@usuario", `@${m.sender.split("@")[0]}`);

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
