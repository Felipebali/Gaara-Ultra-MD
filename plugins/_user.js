let lastUserIndex = -1;

let handler = async (m, { conn, participants }) => {
    const owners = global.owner.map(o => o[0]);
    if (!owners.includes(m.sender.replace(/[^0-9]/g, ''))) return; // solo owners

    let who; // variable para guardar el JID a mostrar
    let nombre; // para usar en la mención

    // 1️⃣ Si citan mensaje
    if (m.quoted) {
        who = m.quoted.sender;
        nombre = who.split("@")[0];
    } 
    // 2️⃣ Si ponen número
    else if (m.text && m.text.split(' ')[1]) {
        let number = m.text.split(' ')[1];
        who = number.includes('@') ? number : `${number}@s.whatsapp.net`;
        nombre = who.split("@")[0];
    } 
    // 3️⃣ Si nada → tu propio LID
    else {
        who = m.sender;
        nombre = who.split("@")[0];
    }

    // Frases divertidas/bonitas para “sorpresa”
    const frases = [
        `✨ ¡Miren quién aparece! @${nombre}, su LID está aquí: ${who}`,
        `🔹 Usuario detectado: @${nombre}\nLID/JID: ${who} 😎`,
        `🕵️‍♂️ Identidad descubierta: @${nombre}\nJID secreto: ${who} 🤫`,
        `🎉 Sorpresa, @${nombre}! Aquí tienes tu LID: ${who}`,
        `👑 Atención! @${nombre} está en el chat con este LID: ${who} 🌟`
    ];

    // Elegir frase aleatoria que no se repita inmediatamente
    let index;
    do {
        index = Math.floor(Math.random() * frases.length);
    } while (index === lastUserIndex);
    lastUserIndex = index;

    // Enviar mensaje con mención oculta
    await conn.sendMessage(m.chat, { 
        text: frases[index], 
        mentions: [who] 
    });
};

handler.help = ['user'];
handler.tags = ['owner'];
handler.command = ['user'];
handler.owner = true; // solo owners
export default handler;
