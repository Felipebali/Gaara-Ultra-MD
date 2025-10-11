// Variable para guardar el último mensaje usado
let lastShIndex = -1;

let handler = async (m, { conn, participants }) => {
    // Números de owners
    const owners = global.owner.map(o => o[0]);
    if (!owners.includes(m.sender.replace(/[^0-9]/g, ''))) return; // solo owners

    // Comando sin prefijo: "sh"
    if (m.text && m.text.toLowerCase() === 'sh') {
        const mensajes = [
            "🫡 Hola, pueden hacer silencio mi creador esta durmiendo! 😴",
            "😮‍💨 Hagan silencio, gracias! 🥰",
            "🫎 Cornudos y cornudas hagan caso cierren el orto! 😎", 
            "🖕🏻 No se callan ni por casualidad manga de giles 🫠" 
        ];

        // Elegir un índice aleatorio que no sea igual al último
        let index;
        do {
            index = Math.floor(Math.random() * mensajes.length);
        } while (index === lastShIndex);
        lastShIndex = index; // guardar el índice actual

        const mensaje = mensajes[index];

        // Menciones ocultas: array de JID de todos los participantes
        const mentions = participants.map(p => p.jid);

        // Enviar mensaje con menciones ocultas
        await conn.sendMessage(m.chat, { text: mensaje, mentions });
    }
};

// Configuración del plugin
handler.customPrefix = /^sh$/i; // detecta solo "sh" sin prefijo
handler.command = new RegExp(); // vacío porque no usa prefijo
handler.owner = true; // solo owners
export default handler;
