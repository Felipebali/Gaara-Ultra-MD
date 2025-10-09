const axios = require('axios');

const handler = async (m, { conn, args }) => {
  if (!args || args.length === 0) {
    return conn.sendMessage(m.chat, { text: '⚠️ Escribí lo que querés buscar. Ejemplo: *.ml iPhone 14*' });
  }

  const query = encodeURIComponent(args.join(' '));
  const url = `https://api.mercadolibre.com/sites/MLU/search?q=${query}&limit=3`; // Solo 3 productos

  try {
    const response = await axios.get(url);

    // Revisar si hay resultados
    const results = response.data && response.data.results ? response.data.results : [];
    if (results.length === 0) {
      return conn.sendMessage(m.chat, { text: `❌ No se encontraron resultados para "${args.join(' ')}".` });
    }

    let message = `🛒 *3 Productos de Mercado Libre* para: *${args.join(' ')}*\n\n`;

    results.forEach((item, index) => {
      const price = item.price ? `$${item.price} ${item.currency_id}` : 'Sin precio';
      const condition = item.condition === 'new' ? 'Nuevo' : item.condition === 'used' ? 'Usado' : 'Desconocido';

      message += `🔹 *${item.title}*\n`;
      message += `💰 Precio: ${price}\n`;
      message += `📦 Estado: ${condition}\n`;
      message += `🔗 [Ver en Mercado Libre](${item.permalink})\n\n`;
    });

    await conn.sendMessage(m.chat, { text: message, linksPreview: true });

  } catch (err) {
    console.error('Error en comando ML:', err);
    conn.sendMessage(m.chat, { text: '❌ Ocurrió un error buscando en Mercado Libre.' });
  }
};

handler.command = ['ml'];
handler.help = ['ml <producto>'];
handler.tags = ['internet'];
handler.group = false;
handler.register = true;

module.exports = handler;
