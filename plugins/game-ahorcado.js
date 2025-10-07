const palabras = [
    "gato","perro","pájaro","elefante","tigre","ballena","mariposa","tortuga","conejo","rana",
    "pulpo","ardilla","jirafa","cocodrilo","pingüino","delfín","serpiente","hámster","mosquito",
    "abeja","Porno","negro","television","computadora","botsito","reggaeton","economía","electrónica",
    "facebook","WhatsApp","Instagram","tiktok","milanesa","presidente","bot","películas"
];

const intentosMaximos = 6;
const gam = new Map();

function elegirPalabraAleatoria() {
    return palabras[Math.floor(Math.random() * palabras.length)];
}

function ocultarPalabra(palabra, letrasAdivinadas) {
    return palabra.split('').map(l => letrasAdivinadas.includes(l.toLowerCase()) ? l : "_").join(' ');
}

function mostrarAhorcado(intentos) {
    const stages = [
        "🎩 Cabeza: O",
        "👕 Cuerpo: |",
        "👖 Piernas: / \\",
        "👀 Ojos: x_x",
        "💀 Cráneo"
    ];
    return stages.slice(0, intentosMaximos - intentos).join('\n') || "😀";
}

function juegoTerminado(sender, mensaje, palabra, letrasAdivinadas, intentos) {
    if (intentos <= 0) {
        gam.delete(sender);
        return `💀 ¡Perdiste! La palabra correcta era: *${palabra}*\n\n${mostrarAhorcado(intentos)}`;
    } else if (!mensaje.includes("_")) {
        let expGanada = Math.floor(Math.random() * 300);
        if (palabra.length >= 8) expGanada = Math.floor(Math.random() * 3500);
        global.db.data.users[sender].exp += expGanada;
        gam.delete(sender);
        return `🎉 ¡Ganaste! Adivinaste la palabra: *${palabra}* 🥳\n💰 Experiencia ganada: ${expGanada} exp`;
    } else {
        return `${mostrarAhorcado(intentos)}\n\n${mensaje}`;
    }
}

let handler = async (m, { conn }) => {
    const chatSettings = global.db.data.chats[m.chat] || {};
    if (chatSettings.games === false) {
        return conn.sendMessage(m.chat, { text: '⚠️ Los juegos están desactivados en este chat. Usa .juegos para activarlos.' }, { quoted: m });
    }

    if (gam.has(m.sender)) return conn.reply(m.chat, "⚠️ Ya tienes un juego en curso. ¡Termina ese primero!", m);

    let palabra = elegirPalabraAleatoria();
    let letrasAdivinadas = [];
    let intentos = intentosMaximos;
    gam.set(m.sender, { palabra, letrasAdivinadas, intentos });

    let mensaje = ocultarPalabra(palabra, letrasAdivinadas);
    let text = `🎯 *¡Adivina la palabra!*\n\n${mensaje}\n\n🕹️ Intentos restantes: ${intentos}`;
    conn.reply(m.chat, text, m);
};

handler.before = async (m, { conn }) => {
    const juego = gam.get(m.sender);
    if (!juego) return;

    const { palabra, letrasAdivinadas } = juego;
    let intentos = juego.intentos;

    // Solo letra
    if (m.text.length === 1 && m.text.match(/[a-zA-Z]/)) {
        let letra = m.text.toLowerCase();
        if (!letrasAdivinadas.includes(letra)) {
            letrasAdivinadas.push(letra);
            if (!palabra.toLowerCase().includes(letra)) intentos--;
        }
        let mensaje = ocultarPalabra(palabra, letrasAdivinadas);
        let respuesta = juegoTerminado(m.sender, mensaje, palabra, letrasAdivinadas, intentos);
        if (respuesta.includes("¡Perdiste!") || respuesta.includes("¡Ganaste!")) {
            conn.reply(m.chat, respuesta, m);
        } else {
            gam.set(m.sender, { palabra, letrasAdivinadas, intentos });
            conn.reply(m.chat, `🔤 ${respuesta}\n\n🕹️ Intentos restantes: ${intentos}`, m);
        }
    } else {
        // Si no es letra, mostrar estado actual
        let mensaje = ocultarPalabra(palabra, letrasAdivinadas);
        let respuesta = juegoTerminado(m.sender, mensaje, palabra, letrasAdivinadas, intentos);
        conn.reply(m.chat, respuesta, m);
        if (respuesta.includes("¡Perdiste!") || respuesta.includes("¡Ganaste!")) gam.delete(m.sender);
    }
};

handler.help = ['ahorcado'];
handler.tags = ['game'];
handler.command = ['ahorcado'];
handler.group = true;
handler.register = true;

export default handler;
