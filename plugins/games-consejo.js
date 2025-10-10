// plugins/consejo.js
let handler = async (m, { conn }) => {
    try {
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
    } catch (e) {
        console.error(e);
        await m.reply('✖️ Error al generar un consejo.');
    }
};

handler.command = ['consejo'];
handler.group = true;
handler.admin = false;
handler.rowner = false;

export default handler; 
