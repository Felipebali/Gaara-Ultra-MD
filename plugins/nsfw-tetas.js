let handler = async (m, { conn }) => {
    let chat = global.db.data.chats[m.chat];
    if (!chat?.nsfw) return; // ⚠️ Sale si NSFW está desactivado

    let img = 'https://delirius-apiofc.vercel.app/nsfw/boobs';
    let text = '*🫨 TETAS*';

    conn.sendMessage(m.chat, { image: { url: img }, caption: text }, { quoted: m });
    m.react('✅');
};

handler.help = ['tetas'];
handler.command = ['tetas'];
handler.tags = ['nsfw'];
export default handler;
