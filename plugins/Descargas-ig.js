import fetch from 'node-fetch';

let handler = async (m, { conn, args, usedPrefix }) => {
    if (!args[0]) return m.reply(`⚠️ Ingresa el nombre de usuario de Instagram.\n\nEjemplo: *${usedPrefix}ig* felixcat`);

    const username = args[0].replace('@', '').trim();
    await m.react('⌛');

    try {
        const apiURL = `https://api.siputzx.my.id/api/instagram/profile?username=${username}`;
        const res = await fetch(apiURL);
        const data = await res.json();

        if (!data || !data.user) throw new Error('Usuario no encontrado');

        const user = data.user;

        const mensaje = `
╭━━〔 ⚡ FelixCat-Bot ⚡ 〕━━⬣
┃ 📌 *Perfil de Instagram*
┃
┃ 👤 Usuario: @${user.username}
┃ 📝 Nombre: ${user.full_name || 'No disponible'}
┃ 💬 Biografía: ${user.biography || 'No disponible'}
┃ 👥 Seguidores: ${user.followers || 'No disponible'}
┃ 👣 Siguiendo: ${user.following || 'No disponible'}
┃ 🔗 Link: https://www.instagram.com/${user.username}/
╰━━━━━━━━━━━━━━━━⬣
`.trim();

        await conn.sendMessage(m.chat, {
            image: { url: user.profile_pic_url },
            caption: mensaje,
            contextInfo: { mentionedJid: [m.sender] }
        }, { quoted: m });

        await m.react('✅');
    } catch (err) {
        console.error(err);
        await m.reply(`❌ Error: No se pudo obtener la información de Instagram.`, m);
        await m.react('❌');
    }
};

handler.help = ['ig <usuario>'];
handler.tags = ['descargas'];
handler.command = /^(ig|instagram)$/i;
handler.register = true;

export default handler;
