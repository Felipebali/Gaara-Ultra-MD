// plugins/autofrase.js
let autoFrases = {}; // guardará intervalos por chat

const frases = [
  "🌟 ¡Sonríe, hoy puede ser un gran día!",
  "🔥 La actitud positiva atrae cosas buenas.",
  "💪 Nunca subestimes tu poder para cambiar el mundo.",
  "😊 Cada pequeño paso cuenta.",
  "🌈 Hoy es un buen día para empezar algo nuevo.",
  "🚀 No dejes que el miedo te detenga.",
  "💡 La creatividad empieza con una idea.",
  "🌻 Encuentra alegría en las pequeñas cosas.",
  "⚡ Eres más fuerte de lo que crees.",
  "🎯 Establece metas y ve tras ellas.",
  "💌 Comparte una palabra amable hoy.",
  "🏆 Cada esfuerzo suma.",
  "🌊 Fluye con la vida, no luches contra ella.",
  "🌙 Respira y encuentra calma.",
  "🎨 Deja que tu imaginación vuele.",
  "💥 Sé valiente y toma riesgos.",
  "🕊️ La paz comienza contigo.",
  "🍀 Hoy es tu día de suerte, aprovéchalo.",
  "🧠 Aprende algo nuevo hoy.",
  "🌟 Haz que tu sonrisa cambie el mundo.",
  "🌸 La felicidad se encuentra en lo simple.",
  "🎶 Baila aunque nadie te vea.",
  "🐾 A veces lo pequeño es grandioso.",
  "🔥 No te rindas, lo mejor está por venir.",
  "💎 Eres único y especial.",
  "🛤️ Cada camino tiene su belleza.",
  "🌞 Despierta con energía positiva.",
  "🌻 Cree en ti mismo.",
  "💡 Una idea puede cambiarlo todo.",
  "🌊 La serenidad es poderosa.",
  "⚡ Tu fuerza interior es increíble.",
  "🎯 Concéntrate en lo que importa.",
  "💌 Haz un gesto amable a alguien hoy.",
  "🏆 Celebra tus pequeñas victorias.",
  "🌙 Reflexiona y aprende cada día.",
  "🎨 Crea sin miedo.",
  "💥 Rompe tus propias barreras.",
  "🕊️ Lleva calma a los demás.",
  "🍀 La suerte sonríe a los valientes.",
  "🧠 Tu mente es tu mejor herramienta.",
  "🌟 Brilla aunque sea un día gris.",
  "🌸 La gratitud multiplica la felicidad.",
  "🎶 Canta y alegra tu día.",
  "🐾 Deja huella positiva donde vayas.",
  "🔥 Cada día es una nueva oportunidad.",
  "💎 Valora tu esencia.",
  "🛤️ Disfruta el camino, no solo la meta.",
  "🌞 Empieza con una sonrisa.",
  "🌻 Sé luz para alguien hoy.",
  "💡 Inspira a otros con tu creatividad.",
  "🌊 Encuentra paz en la quietud.",
  "⚡ Tu energía puede cambiar el día.",
  "🎯 Mantén tu enfoque y avanzarás.",
  "💌 Da sin esperar recibir.",
  "🏆 Aprende de cada experiencia.",
  "🌙 Encuentra belleza en la noche.",
  "🎨 Expresa tus emociones en arte.",
  "💥 No temas fallar, aprende.",
  "🕊️ Ayuda a quienes lo necesitan.",
  "🍀 La fortuna favorece la acción.",
  "🧠 Reflexiona antes de actuar.",
  "🌟 Haz que tus días cuenten.",
  "🌸 Sé amable contigo mismo.",
  "🎶 La música es terapia para el alma.",
  "🐾 Cada paso importa.",
  "🔥 Mantén la pasión viva.",
  "💎 No te compares, eres único.",
  "🛤️ El viaje es tan importante como el destino.",
  "🌞 Aprecia la luz del día.",
  "🌻 Cultiva la felicidad interior.",
  "💡 Las ideas valen oro.",
  "🌊 Deja fluir lo que no puedes controlar.",
  "⚡ Enciende tu chispa interna.",
  "🎯 Persigue tus sueños con determinación.",
  "💌 Una palabra amable cambia todo.",
  "🏆 Eres capaz de grandes logros.",
  "🌙 Encuentra calma en la oscuridad.",
  "🎨 Deja que tu arte hable por ti.",
  "💥 Cada error es una lección.",
  "🕊️ Propaga paz y amor.",
  "🍀 Confía en la suerte y en ti mismo.",
  "🧠 La sabiduría viene con la práctica.",
  "🌟 Que tu luz ilumine tu camino.",
  "🌸 Aprecia la belleza del presente.",
  "🎶 La alegría se comparte cantando.",
  "🐾 Avanza con seguridad.",
  "🔥 Mantente enfocado en tus objetivos.",
  "💎 Cuida tu esencia y tu corazón.",
  "🛤️ Disfruta cada momento.",
  "🌞 Energízate con pensamientos positivos.",
  "🌻 Deja que la gratitud guíe tu día.",
  "💡 Una mente abierta atrae oportunidades.",
  "🌊 La serenidad es tu aliada.",
  "⚡ Tu actitud determina tu día.",
  "🎯 No pierdas de vista tus metas.",
  "💌 Haz que alguien sonría hoy.",
  "🏆 Cada logro comienza con un paso.",
  "🌙 Reflexiona y sigue adelante.",
  "🎨 La creatividad no tiene límites.",
  "💥 Sé valiente y sigue soñando.",
  "🕊️ La bondad nunca sobra.",
  "🍀 Atrae buenas vibras con tus acciones.",
  "🧠 Aprende algo nuevo cada día.",
  "🌟 Sonríe, inspira, crea.",
  "🌸 Valora los pequeños detalles.",
  "🎶 Llena tu vida de melodías felices.",
  "🐾 Cada acción cuenta.",
  "🔥 Persiste hasta conseguirlo.",
  "💎 Sé auténtico y único.",
  "🛤️ El camino se construye paso a paso.",
  "🌞 Empieza cada día con energía positiva."
];

let handler = async (m, { conn }) => {
  if (!m.isGroup) return m.reply('⚠️ Este comando solo funciona en grupos.')
  if (!m.isAdmin) return m.reply('⚠️ Solo administradores pueden usar este comando.')

  const chatId = m.chat
  const chatData = global.db.data.chats[chatId] || {}
  chatData.autoFrase = chatData.autoFrase || false

  if (!chatData.autoFrase) {
    // Activar
    chatData.autoFrase = true
    global.db.data.chats[chatId] = chatData
    m.reply('✅ Sistema de *frases automáticas* activado. El bot enviará mensajes cada 15 minutos entre las 09:00 y las 23:59.')

    autoFrases[chatId] = setInterval(async () => {
      const now = new Date()
      const hora = now.getHours()
      if (hora >= 9 && hora <= 23 && chatData.autoFrase) {
        const frase = frases[Math.floor(Math.random() * frases.length)]
        try {
          const groupMetadata = await conn.groupMetadata(chatId)
          const mentions = groupMetadata.participants.map(p => p.id)
          await conn.sendMessage(chatId, { text: frase, mentions })
        } catch (err) {
          console.error('Error enviando frase automática:', err)
        }
      }
    }, 15 * 60 * 1000) // 15 minutos
  } else {
    // Desactivar
    chatData.autoFrase = false
    global.db.data.chats[chatId] = chatData
    if (autoFrases[chatId]) clearInterval(autoFrases[chatId])
    m.reply('🛑 Sistema de *frases automáticas* desactivado para este grupo.')
  }
}

handler.command = ['autofrase']
handler.group = true
handler.admin = true
export default handler
