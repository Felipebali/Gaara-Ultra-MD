// plugins/menuhot.js
export default {
    name: 'menuhot',
    description: 'Menú NSFW con comandos calientes 🔥',
    group: true,
    all: async function (m, { conn }) {
        if (!m.isGroup) return;

        const menuText = `
╭━━━〔 🔞 NSFW 🐾 〕━━━⬣
┃ 🐾 .PeneBrayanOFC/35 @tag 🍆
┃ 🐾 .anal/culiar @tag 🍑
┃ 🐾 .blowjob/mamada @tag 💦
┃ 🐾 .follar @tag 🔥
┃ 🐾 .grabboobs/agarrartetas @tag 👙
┃ 🐾 .searchhentai 🔞
┃ 🐾 .hentaisearch 🔎
┃ 🐾 .penetrar @user 🍑
┃ 🐾 .sexo/sex @tag 🔥
┃ 🐾 .tetas 👙
╰━━━━━━━━━━━━━━━━━━━━⬣
> 👑 Powered by FelixCat 🥷🏽
        `.trim();

        await conn.sendMessage(m.chat, { text: menuText }, { quoted: m });
    }
};
