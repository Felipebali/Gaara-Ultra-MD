// plugins/mencion-epica.js
let handler = async (m, { conn }) => {
    if (!m.isGroup) return; // Solo grupos

    const myNumber = '59898719147'; // tu número de dueño sin el +

    // Revisamos si alguien te mencionó
    if (m.mentionedJid && m.mentionedJid.includes(myNumber + '@s.whatsapp.net')) {
        const frasesEpicas = [
            "💥 ¡Ahí estás, ${who.split('@')[0]}! Justo cuando la acción se ponía intensa.",
            "😏 ${who.split('@')[0]} me mencionó… esperaba algo épico de ti.",
            "🌀 ${who.split('@')[0]}, has activado mi modo leyenda.",
            "🎬 Esto se siente como película, ${who.split('@')[0]}. ¡Tú eres el extra!",
            "😎 Misión cumplida: ${who.split('@')[0]} me hizo aparecer.",
            "⚡ ¡Bum! Como un rayo, aparecí justo a tiempo, ${who.split('@')[0]}.",
            "👻 ¡Sorpresa! ${who.split('@')[0]}, te estaba espiando… en secreto.",
            "🔥 Prepárate, ${who.split('@')[0]}, la diversión acaba de comenzar.",
            "🎉 ¡Felicidades ${who.split('@')[0]}! Activaste el Easter Egg del grupo.",
            "🛡️ Solo los valientes me mencionan… y ${who.split('@')[0]} sobrevivió para contarlo."
        ];

        // Elegir una frase al azar
        const respuesta = frasesEpicas[Math.floor(Math.random() * frasesEpicas.length)];

        // Enviar mensaje mencionando al que te escribió
        await conn.sendMessage(m.chat, { 
            text: respuesta.replace(/\$\{who\.split\("@'\)\[0\]\}/g, m.sender.split("@")[0]), 
            mentions: [m.sender] 
        });
    }
};

export default handler;
