let handler = async (m, { conn, isOwner }) => {
  const hermanaID = '59892975182' // Número autorizado SIN el '+'
  
  // Permitir solo a ella o a owners
  if (m.sender.split('@')[0] !== hermanaID && !isOwner) {
    return conn.reply(m.chat, '❌ Este comando es privado y solo puede usarlo mi hermana 💞', m)
  }

  let mensajes = [
    "Ser tu hermano/a es uno de los mejores regalos que me dio la vida 💞.",
    "Gracias por existir y por ser parte de mi historia, hermana hermosa ✨.",
    "No importa lo que pase, siempre voy a estar para vos, porque sos mi familia y mi corazón 🤍.",
    "Hermana, tu luz hace más brillante cada momento de mi vida 🌟.",
    "Dios me bendijo con muchas cosas, pero tenerte como hermana fue la más grande de todas 🙏💗.",
    "Hermana, gracias por tu amor, tu apoyo y por ser única en este mundo 💖.",
    "Sos mi persona favorita en esta vida, y no importa lo que pase, siempre te voy a cuidar 💫.",
    "Tu corazón es tan hermoso que hace que todo a tu alrededor sea mejor 💜.",
    "Sos más que una hermana, sos mi amiga, mi cómplice y mi hogar 🏡💞.",
    "Si la vida fuera un viaje, vos serías mi destino favorito 🚀❤️."
  ]

  let texto = mensajes[Math.floor(Math.random() * mensajes.length)]
  conn.reply(m.chat, texto, m)
}

handler.command = /^hermana$/i
handler.tags = ['frases']
handler.help = ['hermana']
export default handler
