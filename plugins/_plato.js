// plugins/plato.js
let handler = async (m, { conn }) => {
    let chat = global.db?.data?.chats[m.chat];
    if (!chat || !chat.games) {
        return await m.reply('🎮 Los mini-juegos están *desactivados* en este chat.\nActívalos con: *.juegos*');
    }

    const platos = [
        { nombre: '🍕 Pizza napolitana', rarity: '🟢 Común' },
        { nombre: '🍣 Sushi mixto', rarity: '🟢 Común' },
        { nombre: '🥟 Empanadas caseras', rarity: '🟢 Común' },
        { nombre: '🍔 Hamburguesa Triple XL', rarity: '🔵 Especial' },
        { nombre: '☠️ Fideos con gusto a gas', rarity: '🔴 Maldito' },
        { nombre: '🐀 Rata frita con papas', rarity: '🔴 Maldito' },
        { nombre: '🦗 Ensalada de grillos', rarity: '🟣 Épico' },
        { nombre: '😹 Sándwich de aire', rarity: '🟣 Épico' },
        { nombre: '🍜 Sopita para el alma', rarity: '🟢 Común' },
        { nombre: '🔥 Guiso hecho por tu ex', rarity: '🔵 Especial' },
        { nombre: '💩 Puré misterioso (no preguntes)', rarity: '🔴 Maldito' },
        { nombre: '😈 Pasta con salsa radioactiva', rarity: '🔴 Maldito' },
        { nombre: '🧟‍♂️ Carne zombie premium', rarity: '🔵 Especial' }
    ];

    // Elegir 3 platos aleatorios
    let opciones = [];
    while(opciones.length < 3){
        let random = platos[Math.floor(Math.random() * platos.length)];
        if(!opciones.includes(random)) opciones.push(random);
    }

    // Mostrar opciones enumeradas
    await m.reply(`🍽️ *Elige tu plato*:\n${opciones.map((p,i)=>`${i+1}. ${p.nombre}`).join('\n')}\n\nResponde con el número de tu elección.`);

    // Guardamos la partida temporal en memoria global
    if(!global.db.data.games) global.db.data.games = {};
    global.db.data.games[m.sender] = { opciones, mId: m.key.id };
};

// Comando para manejar la elección del usuario
let choiceHandler = async (m, { conn }) => {
    if(!global.db.data.games?.[m.sender]) return; // no hay juego activo
    let partida = global.db.data.games[m.sender];

    // Determinar elección
    let eleccion = parseInt(m.text);
    if(isNaN(eleccion) || eleccion < 1 || eleccion > partida.opciones.length) return;

    let plato = partida.opciones[eleccion-1];

    await m.reply(`🍽️ *Elegiste:* ${plato.nombre}\n✨ Rareza: ${plato.rarity}`);

    // Limpiar partida
    delete global.db.data.games[m.sender];
};

handler.command = ['plato'];
handler.group = true;

choiceHandler.command = ['1','2','3']; // los números de las opciones
choiceHandler.group = true;

export default [handler, choiceHandler];
