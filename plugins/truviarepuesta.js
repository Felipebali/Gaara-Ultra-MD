// plugins/triviaRespuesta.js
let handler = async (m, { conn }) => {
    // Verifica si hay una pregunta activa en el chat
    if (!global.triviaAnswers || !global.triviaAnswers[m.chat]) return;

    const correcta = global.triviaAnswers[m.chat].toUpperCase();
    const respuesta = m.text.trim().toUpperCase();

    // Solo valida letras A-D
    if (["A","B","C","D"].includes(respuesta)) {
        if (respuesta === correcta) {
            await conn.sendMessage(m.chat, { text: `✅ ¡Correcto!` }, { quoted: m });
        } else {
            await conn.sendMessage(m.chat, { text: `❌ Incorrecto. La respuesta correcta era *${correcta}*.` }, { quoted: m });
        }
        // Borra la pregunta actual
        delete global.triviaAnswers[m.chat];
    }
};

handler.all = true;
export default handler;
