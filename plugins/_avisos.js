// plugins/reconocer.js
global.db.data.chats = global.db.data.chats || {}
global.groupData = global.groupData || {}

let handler = async (m, { conn, isAdmin, isGroup }) => {
  if (!isGroup) return conn.sendMessage(m.chat, { 
    text: '❌ Este comando solo funciona en grupos.\n\n⚡ Cuando me agregues a un grupo, podré reconocer cambios automáticamente.' 
  })

  if (!isAdmin) return conn.sendMessage(m.chat, { text: '❌ Solo *admins* pueden activar o desactivar el modo reconocer.' })

  let chat = global.db.data.chats[m.chat]
  chat.reconocer = !chat.reconocer

  return conn.sendMessage(m.chat, { 
    text: chat.reconocer
      ? '✅ Modo *reconocer* ACTIVADO\nAvisaré cuando cambien el *nombre* o la *descripción* del grupo.'
      : '❌ Modo *reconocer* DESACTIVADO'
  })
}

handler.help = ['reconocer']
handler.tags = ['group']
handler.command = /^reconocer$/i
handler.group = true
export default handler

// ---------------- Detector automático ----------------
handler.before = async function (m, { conn, isGroup }) {
  if (!isGroup) return
  const chat = global.db.data.chats[m.chat]
  if (!chat?.reconocer) return

  try {
    const metadata = await conn.groupMetadata(m.chat)

    // Inicializar datos si no existen
    if (!global.groupData[m.chat]) {
      global.groupData[m.chat] = {
        name: metadata.subject,
        desc: metadata.desc || ''
      }
    }

    // Detectar cambio de nombre
    if (metadata.subject !== global.groupData[m.chat].name) {
      await conn.sendMessage(m.chat, { 
        text: `🔧 *El nombre del grupo ha cambiado*\n🆕 Nuevo nombre: *${metadata.subject}*`
      })
      global.groupData[m.chat].name = metadata.subject
    }

    // Detectar cambio de descripción
    if ((metadata.desc || '') !== global.groupData[m.chat].desc) {
      await conn.sendMessage(m.chat, { 
        text: `📝 *La descripción del grupo ha cambiado*\n${metadata.desc || '_Sin descripción_'}`
      })
      global.groupData[m.chat].desc = metadata.desc || ''
    }

  } catch (err) {
    console.log('Error en reconocer:', err)
  }
}
