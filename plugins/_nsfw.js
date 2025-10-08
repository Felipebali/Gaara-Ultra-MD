const handler = async (m, { conn, isOwner }) => {
    let chat = global.db.data.chats[m.chat];

    // Inicializamos NSFW si no existe
    if (chat.nsfw === undefined) chat.nsfw = false;

    // Solo owners pueden cambiarlo
    if (!isOwner) {
        return conn.reply(m.chat, '❌ Solo los dueños del bot pueden activar o desactivar NSFW.', m);
    }

    // Alternar estado NSFW
    chat.nsfw = !chat.nsfw;

    // Mensaje de confirmación
    conn.reply(m.chat, `⚡️ La función *NSFW* se *${chat.nsfw ? 'activó' : 'desactivó'}* para este chat.`, m);
};

// Función global para bloquear plugins NSFW si NSFW está desactivado
export async function before(m, { conn }) {
    let chat = global.db.data.chats[m.chat];

    // Inicializamos NSFW si no existe
    if (chat.nsfw === undefined) chat.nsfw = false;

    // Lista de comandos NSFW
    const nsfwCommands = [
        'sixnine', '69',
        'anal', 'culiar',
        'blowjob', 'mamada',
        'follar',
        'grabboobs', 'agarrartetas',
        'searchhentai',
        'hentaisearch',
        'penetrar',
        'sexo', 'sex',
        'tetas'
    ];

    if (!chat.nsfw && nsfwCommands.includes(m.command?.toLowerCase())) {
        return conn.reply(m.chat, '❌ Los comandos NSFW están desactivados en este chat.', m);
    }

    return true; // Permite los demás comandos
}

handler.help = ['nsfw'];
handler.tags = ['owner'];
handler.command = ['nsfw'];

export default handler;
