import fetch from 'node-fetch';

let handler = async (m, { conn, usedPrefix, command }) => {
    let chat = global.db.data.chats[m.chat] || {};

    if (m.isGroup && !chat.nsfw) {
        return m.reply(`🔞 *Contenido NSFW desactivado*\nUn administrador puede activarlo con:\n\`${usedPrefix}nsfw on\``);
    }

    try {
        let api = await fetch(`https://api.waifu.pics/nsfw/waifu`); // Cambiá esta API si querés reales
        let res = await api.json();

        let texto = `🔥 Aquí tenés tu pedido degenerado 😏`;

        await conn.sendMessage(m.chat, {
            image: { url: res.url },
            caption: texto
        }, { quoted: m });

    } catch (error) {
        console.error(error);
        m.reply("❌ Error al obtener contenido NSFW. Intenta de nuevo más tarde.");
    }
};

handler.help = ['pene'];
handler.tags = ['nsfw'];
handler.command = /^pene$/i;

export default handler;
