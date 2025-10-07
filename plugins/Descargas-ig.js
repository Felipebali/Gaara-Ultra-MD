import fetch from 'node-fetch';

let handler = async (m, { conn, args, usedPrefix }) => {
  if (!args[0]) return m.reply(`⚠️ Ingresa el usuario de Instagram.\nEjemplo: ${usedPrefix}ig feli_bali`);

  const username = args[0].replace('@', '').trim();
  await m.react('⌛');

  try {
    const res = await fetch(`https://api.sylphy.xyz/instagram?username=${username}&apikey=sylphy-fbb9`);
    const text = await res.text(); // obtenemos como texto para revisar si es JSON

    let data;
    try {
      data = JSON.parse(text); // intentamos parsear JSON
    } catch {
      throw new Error('La API no respondió JSON válido. Puede estar caída o la clave API es incorrecta.');
    }

    if (!data.status) throw new Error('Usuario no encontrado o privado');

    const user = data.result;

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

    if (user.profile_pic) {
      await conn.sendMessage(m.chat, { image: { url: user.profile_pic }, caption: mensaje });
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
