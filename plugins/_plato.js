// plugins/plato.js
let handler = async (m, { conn }) => {
    let chat = global.db?.data?.chats[m.chat];
    if (!chat || !chat.games) {
        return await m.reply('🎮 Los mini-juegos están *desactivados* en este chat.\nActívalos con: *.juegos*');
    }

    const platos = [
        { nombre: '🍕 Pizza napolitana', img: 'https://i.imgur.com/1gXnFye.jpg', rarity: '🟢 Común' },
        { nombre: '🍣 Sushi mixto', img: 'https://i.imgur.com/QKQh5XB.jpg', rarity: '🟢 Común' },
        { nombre: '🥟 Empanadas caseras', img: 'https://i.imgur.com/8oxQGz7.jpg', rarity: '🟢 Común' },
        { nombre: '🍔 Hamburguesa Triple XL', img: 'https://i.imgur.com/9svbQk8.jpg', rarity: '🔵 Especial' },
        { nombre: '☠️ Fideos con gusto a gas', img: 'https://i.imgur.com/3vTlb8R.jpg', rarity: '🔴 Maldito' },
        { nombre: '🐀 Rata frita con papas', img: 'https://i.imgur.com/FB3f9Q5.jpg', rarity: '🔴 Maldito' },
        { nombre: '🦗 Ensalada de grillos', img: 'https://i.imgur.com/nArMvFJ.jpg', rarity: '🟣 Épico' },
        { nombre: '😹 Sándwich de aire', img: 'https://i.imgur.com/WM7H7Me.jpg', rarity: '🟣 Épico' },
        { nombre: '🍜 Sopita para el alma', img: 'https://i.imgur.com/I87i9GR.jpg', rarity: '🟢 Común' },
        { nombre: '🔥 Guiso hecho por tu ex', img: 'https://i.imgur.com/sOykRLP.jpg', rarity: '🔵 Especial' },
        { nombre: '💩 Puré misterioso (no preguntes)', img: 'https://i.imgur.com/IzqU0YF.jpg', rarity: '🔴 Maldito' },
        { nombre: '😈 Pasta con salsa radioactiva', img: 'https://i.imgur.com/6oN1uzG.jpg', rarity: '🔴 Maldito' },
        { nombre: '🧟‍♂️ Carne zombie premium', img: 'https://i.imgur.com/OX0db8S.jpg', rarity: '🔵 Especial' }
    ];

    // Elegir plato al azar
    let random = platos[Math.floor(Math.random() * platos.length)];

    // Enviar mensaje con imagen, nombre y rareza
    await conn.sendMessage(m.chat, {
        image: { url: random.img },
        caption: `🍽️ *Tu plato de hoy es:* ${random.nombre}\n✨ Rareza: ${random.rarity}`
    }, { quoted: m });
}

handler.command = ['plato'];
handler.group = true;

export default handler; 
