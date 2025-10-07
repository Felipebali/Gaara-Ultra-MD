import fetch from 'node-fetch';

let handler = async (m, { conn, args, usedPrefix }) => {
    if (!args[0]) return m.reply(`⚠️ Ingresa el usuario de Instagram.\nEjemplo: ${usedPrefix}ig felixcat`);

    const username = args[0].replace('@', '').trim();
    await m.react('⌛');

    try {
        const apiURL = `https://api.siputzx.my.id/api/instagram/profile?username=${username}`;
        const res = await fetch(apiURL);

        // Validar que la respuesta sea JSON
        let data;
        try { data = await res.json(); } 
        catch { throw new Error('API no devolvió datos válidos'); }

        if (!data?.user) throw new Error('Usuario no encontrado');

        const user = data.user;
        const profilePic = user.profile_pic_url || '';

        const mensaje = `
╭━━〔 ⚡ FelixCat-Bot ⚡ 〕━━⬣
┃ 👤 Usuario: @${user.username}
┃ 📝 Nombre: ${user.full_name || 'No disponible'}
┃ 💬 Bio: ${user.biography || 'No disponible'}
┃ 👥 Seguidores: ${user.followers || 'No disponible'}
┃ 👣 Siguiendo: ${user.following || 'No disponible'}
┃ 🔗 Link: https://www.instagram.com/${user.username}/
╰━━━━━━━━━━━━━━━━⬣
`.trim();

        if (profilePic) {
            await conn.sendMessage(
                m.chat,
                { image: { url: profilePic }, caption: mensaje },
                { quoted: m }
            );
        } else {
            await conn.sendMessage(m.chat, { text: mensaje }, { quoted: m });
        }

        await m.react('✅');

    } catch (err) {
        console.error(err);
        await m.reply(`❌ Error: ${err.message}`, m);
        await m.react('❌');
    }
};

handler.help = ['ig <usuario>'];
handler.tags = ['descargas'];
handler.command = /^(ig|instagram)$/i;
handler.register = true;

export default handler;
