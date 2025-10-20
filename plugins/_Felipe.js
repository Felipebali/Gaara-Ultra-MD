// plugins/mencion-epica.js
let handler = async (m, { conn }) => {
    if (!m.isGroup) return; // Solo grupos

    const myNumber = '59898719147'; // tu número de dueño sin el +

    // Revisamos si alguien te mencionó
    if (m.mentionedJid && m.mentionedJid.includes(myNumber + '@s.whatsapp.net')) {

        const who = m.sender.split("@")[0]; // quien te escribió

        const frasesEpicas = [
            `💥 ¡Ahí estás, ${who}! Justo cuando la acción se ponía intensa.`,
            `😏 ${who} me mencionó… esperaba algo épico de ti.`,
            `🌀 ${who}, has activado mi modo leyenda.`,
            `🎬 Esto se siente como película, ${who}. ¡Tú eres el extra!`,
            `😎 Misión cumplida: ${who} me hizo aparecer.`,
            `⚡ ¡Bum! Como un rayo, aparecí justo a tiempo, ${who}.`,
            `👻 ¡Sorpresa! ${who}, te estaba espiando… en secreto.`,
            `🔥 Prepárate, ${who}, la diversión acaba de comenzar.`,
            `🎉 ¡Felicidades ${who}! Activaste el Easter Egg del grupo.`,
            `🛡️ Solo los valientes me mencionan… y ${who} sobrevivió para contarlo.`
        ];

        // Elegir una frase al azar
        const respuesta = frasesEpicas[Math.floor(Math.random() * frasesEpicas.length)];

        // Enviar mensaje mencionando al usuario
        await conn.sendMessage(m.chat, { 
            text: respuesta, 
            mentions: [m.sender] 
        });
    }
};

export default handler;
