// plugins/menugp.js
let handler = async (m, { conn, isAdmin, chat }) => {
    try {
        const chatData = global.db.data.chats[chat] || {};
        const autoFraseEstado = chatData.autoFrase ? '🟢 Activado' : '🔴 Desactivado';

        let menuText = `
╭━━━〔 🐾 MENÚ PARA ADMINS 🐾 〕━━━⬣

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
┃ 🐾 .ruletaban - Expulsar un usuario al azar 🎯
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
┃ 🐾 .ht - Mención oculta 👻
┃ 🐾 .tagall2 - Ultra operativo x2 🚨⚔️
╰━━━━━━━━━━━━━━━━━━━━⬣

╭━━━〔 🗑️ BORRAR MENSAJE 〕━━━⬣
┃ 🐾 .del - Elimina el mensaje respondido ✖️
╰━━━━━━━━━━━━━━━━━━━━⬣

╭━━━〔 ⚠️ ADVERTENCIAS 〕━━━⬣
┃ 🐾 .warn @user - Dar advertencia ⚠️
┃ 🐾 .unwarn @user - Quitar advertencia 🟢
┃ 🐾 .listadv - Lista de usuarios advertidos 📋
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

export default handler;
