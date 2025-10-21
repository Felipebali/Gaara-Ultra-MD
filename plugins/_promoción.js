// plugins/autopromoIG.js
let handler = async (m, { conn }) => {
    if (!m.isGroup) return; // Solo grupos

    const igRegex = /(https?:\/\/)?(www\.)?instagram\.com\/[^\s]+/i;
    if (!m.text || !igRegex.test(m.text)) return; // No hay IG, se sale

    let who = m.sender;
    let userName = who.split("@")[0];

    // Detectar rol
    let isOwner = global.owner.includes(who); // tu lista de owners
    let isAdmin = m.isGroup ? m.admin : false;

    // Frases aleatorias según rol
    let frasesUsuario = [
        `📣 ¡Hey! ${userName} compartió su Instagram. ¡Apoyémoslo con un follow! ✨`,
        `🎉 ${userName} está en Instagram. Dale un vistazo y síguelo 😎`,
        `📢 ¡Nuevo IG de ${userName}! No te lo pierdas 💥`
    ];
    let frasesAdmin = [
        `⭐ Nuestro admin ${userName} publicó su Instagram! Échale un vistazo 😉`,
        `👑 ${userName}, admin, comparte su perfil IG. ¡Síguelo! 🔥`,
        `✨ Atención, ${userName} (admin) ha compartido su IG. Dale follow!`
    ];
    let frasesOwner = [
        `👑 ¡El owner ${userName} comparte su Instagram! No te pierdas su perfil 🔥`,
        `🔥 ${userName}, nuestro owner, publicó su IG. Échale un vistazo!`,
        `✨ Owner ${userName} compartió su Instagram. Síguelo sin falta!`
    ];

    // Elegir frase aleatoria según rol
    let mensaje;
    if (isOwner) {
        mensaje = frasesOwner[Math.floor(Math.random() * frasesOwner.length)];
    } else if (isAdmin) {
        mensaje = frasesAdmin[Math.floor(Math.random() * frasesAdmin.length)];
    } else {
        mensaje = frasesUsuario[Math.floor(Math.random() * frasesUsuario.length)];
    }

    // Enviar mensaje con mención oculta
    const mentionedJid = [who];
    await conn.sendMessage(m.chat, {
        text: mensaje,
        contextInfo: { mentionedJid }
    }, { quoted: m });
};

// Este plugin no necesita comando, se ejecuta automáticamente
handler.customPrefix = () => true; // captura todos los mensajes
handler.group = true;
handler.limit = false; // sin límite
handler.tags = ['fun', 'promocion'];
handler.help = ['autopromoIG'];

export default handler;
