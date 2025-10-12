// plugins/reconocer.js
global.db.data.chats = global.db.data.chats || {}
global.groupData = global.groupData || {}

let handler = async (m, { conn, isAdmin, isGroup }) => {
  if (!isGroup) return m.reply('❌ Este comando solo funciona en grupos.')
  if (!isAdmin) return m.reply('❌ Solo *admins* pueden usar este comando.')

  let chat = global.db.data.chats[m.chat]
  chat.reconocer = !chat.reconocer

  await conn.sendMessage(m.chat, { 
    text: chat.reconocer
      ? '✅ El modo *reconocer* fue ACTIVADO.\nAvisaré si cambian el *nombre o la descripción* del grupo.'
      : '❌ El modo *reconocer* fue DESACTIVADO.'
  })
}

handler.help = ['reconocer']
handler.tags = ['group']
handler.command = /^reconocer$/i
handler.group = true

// ---------------- Detectar cambios ----------------
handler.before = async function (m, { conn, isGroup }) {
  if (!isGroup) return
  const chat = global.db.data.chats[m.chat]
  if (!chat.reconocer) return

  try {
    const metadata = await conn.groupMetadata(m.chat)

    if (!global.groupData[m.chat]) {
      global.groupData[m.chat] = {
        name: metadata.subject,
        desc: metadata.desc || ''
      }
    }

    // Detectar cambio de nombre
    if (metadata.subject !== global.groupData[m.chat].name) {
      await conn.sendMessage(m.chat, { 
        text: `📢 *Se cambió el nombre del grupo*\nNuevo: *${metadata.subject}*`
      })
      global.groupData[m.chat].name = metadata.subject
    }

    // Detectar cambio de descripción
    if ((metadata.desc || '') !== global.groupData[m.chat].desc) {
      await conn.sendMessage(m.chat, { 
        text: `📝 *Se cambió la descripción del grupo*\n${metadata.desc || '_Sin descripción_'}`
      })
      global.groupData[m.chat].desc = metadata.desc || ''
    }

  } catch (e) {
    console.log('Error en reconocer:', e)
  }
}

export default handler
