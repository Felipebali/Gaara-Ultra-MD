// plugins/mencion-epica.js
let handler = async (m, { conn }) => {
    if (!m.isGroup) return; // Solo grupos

    const myNumber = '59898719147'; // tu número de dueño sin el +

    // Revisamos si alguien te mencionó
    if (m.mentionedJid && m.mentionedJid.includes(myNumber + '@s.whatsapp.net')) {
        const frasesEpicas = [
            "💥 ¡Ahí estás, ${who}! Justo cuando la acción se ponía intensa.",
            "😏 ${who} me mencionó… esperaba algo épico de ti.",
            "🌀 ${who}, has activado mi modo leyenda.",
            "🎬 Esto se siente como película, ${who}. ¡Tú eres el extra!",
            "😎 Misión cumplida: ${who} me hizo aparecer.",
            "⚡ ¡Bum! Como un rayo, aparecí justo a tiempo, ${who}.",
            "👻 ¡Sorpresa! ${who}, te estaba espiando… en secreto.",
            "🔥 Prepárate, ${who}, la diversión acaba de comenzar.",
            "🎉 ¡Felicidades ${who}! Activaste el Easter Egg del grupo.",
            "🛡️ Solo los valientes me mencionan… y ${who} sobrevivió para contarlo."
        ];

        // Usuario que mencionó
        const who = m.sender.split("@")[0];

        // Elegir una frase al azar y reemplazar ${who} por el nombre
        const respuesta = frasesEpicas[Math.floor(Math.random() * frasesEpicas.length)].replace(/\$\{who\}/g, who);

        // Enviar mensaje mencionando al que escribió
        await conn.sendMessage(m.chat, { 
            text: respuesta, 
            mentions: [m.sender] 
        });
    }
};

export default handler;
