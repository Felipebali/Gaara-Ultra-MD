// plugins/menugp.js
let handler = async (m, { conn }) => {
    try {
        let menuText = `
╭━━━〔 🐾 MENÚ DE GRUPO 𝗙𝗘𝗟𝗜𝗖𝗔𝗧 🐾 〕━━━⬣
┃ ❒ *Comandos de administración de grupo* 🐱
╰━━━━━━━━━━━━━━━━━━━━⬣

╭━━━〔 🐱 PROMOVER / DEGRADAR 〕━━━⬣
┃ 🐾 .p <@user> - Promover a admin 😺
┃ 🐾 .d <@user> - Degradar admin 😿
╰━━━━━━━━━━━━━━━━━━━━⬣

╭━━━〔 🔨 BAN / UNBAN CHAT 〕━━━⬣
┃ 🐾 .banchat - Banear grupo 🚫
┃ 🐾 .unbanchat - Desbanear grupo ✅
╰━━━━━━━━━━━━━━━━━━━━⬣

╭━━━〔 ❌ ELIMINAR USUARIOS 〕━━━⬣
┃ 🐾 .k <@user> - Eliminar usuario ✂️
╰━━━━━━━━━━━━━━━━━━━━⬣

╭━━━〔 🚪 CERRAR / ABRIR GRUPO 〕━━━⬣
┃ 🐾 .g - Cerrar / Abrir grupo 🔒🔓
╰━━━━━━━━━━━━━━━━━━━━⬣

╭━━━〔 🔇 SILENCIAR / DESILENCIAR 〕━━━⬣
┃ 🐾 .mute <@user> - Silenciar usuario 🤫
┃ 🐾 .unmute <@user> - Desilenciar usuario 🗣️
╰━━━━━━━━━━━━━━━━━━━━⬣

╭━━━〔 📢 MENCIÓN GENERAL 〕━━━⬣
┃ 🐾 .tagall - Mencionar a todos 📣
┃ 🐾 .hidetag - Mención oculta 👻
╰━━━━━━━━━━━━━━━━━━━━⬣

╭━━━〔 🗑️ BORRAR MENSAJE 〕━━━⬣
┃ 🐾 .del - Elimina el mensaje respondido ✖️
╰━━━━━━━━━━━━━━━━━━━━⬣

> 👑 Powered by FelixCat 🐾
        `;

        await conn.sendMessage(m.chat, { text: menuText }, { quoted: m });

    } catch (e) {
        console.error(e);
        await m.reply('✖️ Error al mostrar el menú de grupo.');
    }
}

handler.command = ['menugp'];
handler.group = true;
handler.admin = true;

export default handler;
