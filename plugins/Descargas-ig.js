import fetch from 'node-fetch';

let handler = async (m, { conn, args, usedPrefix }) => {
  if (!args[0]) return m.reply(`⚠️ Ingresa el usuario de Instagram.\nEjemplo: ${usedPrefix}ig felixcat`);

  const username = args[0].replace('@', '').trim();
  await m.react('⌛');

  try {
    // Usar endpoint público de Instagram + ?__a=1 para datos JSON
    const res = await fetch(`https://www.instagram.com/${username}/?__a=1&__d=dis`);
    if (!res.ok) throw new Error('Usuario no encontrado o privado');

    const json = await res.json();
    const user = json.graphql.user;

    const profilePic = user.profile_pic_url_hd || user.profile_pic_url;

    const mensaje = `
╭━━〔 ⚡ FelixCat-Bot ⚡ 〕━━⬣
┃ 👤 Usuario: @${user.username}
┃ 📝 Nombre: ${user.full_name || 'No disponible'}
┃ 💬 Bio: ${user.biography || 'No disponible'}
┃ 👥 Seguidores: ${user.edge_followed_by.count || 'No disponible'}
┃ 👣 Siguiendo: ${user.edge_follow.count || 'No disponible'}
┃ 🔗 Link: https://www.instagram.com/${user.username}/
╰━━━━━━━━━━━━━━━━⬣
`.trim();

    if (profilePic) {
      await conn.sendMessage(m.chat, { image: { url: profilePic }, caption: mensaje });
    } else {
      await conn.sendMessage(m.chat, { text: mensaje });
    }

    await m.react('✅');

  } catch (err) {
    console.error(err);
    await m.reply(`❌ Error: ${err.message}`);
    await m.react('❌');
  }
};

handler.help = ['ig <usuario>'];
handler.tags = ['descargas'];
handler.command = /^(ig|instagram)$/i;
handler.register = true;

export default handler;
