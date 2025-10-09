// plugins/_ml.js
import axios from 'axios';

const handler = async (m, { conn, args }) => {
  if (!args || args.length === 0) {
    return conn.sendMessage(m.chat, { text: '⚠️ Escribí lo que querés buscar. Ejemplo: *.ml iPhone 14*' });
  }

  // Simulación de 3 productos con detalles
  const productos = [
    {
      title: 'iPhone 14 128GB - Nuevo',
      price: 'USD 1.200',
      condition: 'Nuevo',
      link: 'https://www.mercadolibre.com.uy/iphone-14-128gb-nuevo/p/MLU123456',
      thumbnail: 'https://http2.mlstatic.com/D_123456-MLU1234567890_012023-O.jpg'
    },
    {
      title: 'iPhone 14 Pro Max 256GB - Nuevo',
      price: 'USD 1.600',
      condition: 'Nuevo',
      link: 'https://www.mercadolibre.com.uy/iphone-14-pro-max-256gb/p/MLU654321',
      thumbnail: 'https://http2.mlstatic.com/D_654321-MLU6543210987_012023-O.jpg'
    },
    {
      title: 'iPhone 14 Plus 128GB - Usado',
      price: 'USD 1.000',
      condition: 'Usado',
      link: 'https://www.mercadolibre.com.uy/iphone-14-plus-128gb-usado/p/MLU987654',
      thumbnail: 'https://http2.mlstatic.com/D_987654-MLU9876543210_012023-O.jpg'
    }
  ];

  let message = `🛒 *Resultados de Mercado Libre para:* *${args.join(' ')}*\n\n`;

  for (let prod of productos) {
    message += `🔹 *${prod.title}*\n`;
    message += `💰 Precio: ${prod.price}\n`;
    message += `📦 Estado: ${prod.condition}\n`;
    message += `🔗 [Ver en Mercado Libre](${prod.link})\n\n`;
  }

  await conn.sendMessage(m.chat, { text: message, linksPreview: true });
};

handler.command = ['ml'];
handler.help = ['ml <producto>'];
handler.tags = ['internet'];
handler.group = false;
handler.register = true;

export default handler;
