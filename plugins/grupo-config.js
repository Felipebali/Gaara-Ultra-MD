let handler = async (m, { conn }) => {
    // Asegurarse de que exista la configuración del chat
    if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {};

    const chatConfig = global.db.data.chats[m.chat];

    // Lista de módulos disponibles incluyendo autofrase
    const modulos = {
        Juegos: chatConfig.games !== false,
        Antilink: chatConfig.antilink !== false,
        Antimención: chatConfig.antimencion !== false,
        Bienvenida: chatConfig.welcome !== false,
        NSFW: chatConfig.nsfw !== false,
        modoadmin: chatConfig.modoadmin !== false,
        Autofrase: chatConfig.autoFrase === true // Nuevo módulo agregado
    };

    // Crear mensaje visual
    let mensaje = '📌 *Configuración del chat*\n\n';
    for (let key in modulos) {
        mensaje += `• ${key}: ${modulos[key] ? '✅ Activado' : '❌ Desactivado'}\n`;
    }

    mensaje += `\n⚙️ Para cambiar la configuración, usa los comandos específicos de cada módulo.`;

    await conn.sendMessage(m.chat, { text: mensaje }, { quoted: m });
};

handler.help = ['config'];
handler.tags = ['info'];
handler.command = ['config'];
handler.group = true;
handler.register = true;
handler.admin = true; // Solo admins pueden usarlo

export default handler;
