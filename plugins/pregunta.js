// plugins/pregunta.js
import { randomInt } from 'crypto';

let preguntasHeavy = [
    "👿 Confesá, ¿cuál fue tu acto más prohibido?",
    "😈 Dime, ¿alguna vez hiciste algo que juraste no contar?",
    "🔥 ¿Cuál es tu fantasía más oscura?",
    "👹 Si pudieras romper una regla sin consecuencias, ¿cuál sería?",
    "😈 ¿Qué secreto vergonzoso guardas que nadie sabe?",
    "🔥 ¿Alguna vez sedujiste a alguien solo por diversión?",
    "👿 ¿Has sentido placer al hacer algo prohibido?",
    "😈 Si tuvieras que elegir entre dinero o deseo, ¿qué escogerías?",
    "🔥 ¿Qué pensamiento culpable no puedes evitar tener?",
    "👹 ¿Cuál ha sido tu impulso más salvaje y prohibido?"
];

let handler = async (m, { conn }) => {
    let chat = global.db.data.chats[m.chat];

    // Inicializamos NSFW si no existe
    if (chat.nsfw === undefined) chat.nsfw = false;

    // Validar NSFW activado
    if (!chat.nsfw) {
        await conn.sendMessage(m.chat, { text: '❌ Los comandos NSFW están desactivados en este chat.' });
        return;
    }

    // Elegir pregunta aleatoria
    let index = randomInt(0, preguntasHeavy.length);
    let pregunta = preguntasHeavy[index];

    // Botones interactivos
    let buttons = [
        { buttonId: '.pregunta', buttonText: { displayText: 'Otra pregunta 😈' }, type: 1 }
    ];

    let buttonMessage = {
        text: pregunta,
        footer: 'Roleplay Demonio 🔥 Nivel 3',
        buttons: buttons,
        headerType: 1
    };

    await conn.sendMessage(m.chat, buttonMessage);
};

handler.help = ['pregunta'];
handler.tags = ['fun', 'nsfw'];
handler.command = ['pregunta'];

export default handler;
