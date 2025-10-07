let handler = async (m, { conn }) => {
    // Asegurarse de que exista la configuración del chat
    if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {};

    const chatConfig = global.db.data.chats[m.chat];

    // Configuración de comandos/juegos
    const config = {
        Juegos: chatConfig.games !== false,          // true si activado
        Antilink: chatConfig.antilink !== false,
        Bienvenida: chatConfig.welcome !== false,
        Despedida: chatConfig.bye !== false,
        Antipalabras: chatConfig.antipalabras !== false,
        Antispam: chatConfig.antispam !== false,
        Anuncios: chatConfig.anuncios !== false
    };

    // Crear mensaje visual
    let mensaje = '📌 *Configuración del chat*\n\n';
    for (let key in config) {
        mensaje += `• ${key}: ${config[key] ? '✅ Activado' : '❌ Desactivado'}\n`;
    }

    mensaje += `\n⚙️ Para cambiar la configuración, usa los comandos específicos de cada módulo.`;

    await conn.sendMessage(m.chat, { text: mensaje }, { quoted: m });
};

handler.help = ['config'];
handler.tags = ['info'];
handler.command = ['config'];
handler.group = true;
handler.register = true;
handler.admin = true; // <-- Solo admins pueden usarlo

export default handler;
