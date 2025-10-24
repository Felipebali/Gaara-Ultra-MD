let handler = async function (m, { conn, groupMetadata }) {
  let userJid = null

  // 🟢 1️⃣ Si hay mención
  if (m.mentionedJid && m.mentionedJid.length > 0) {
    userJid = m.mentionedJid[0]
  } 
  // 🟢 2️⃣ Si cita un mensaje de otro usuario
  else if (m.quoted && m.quoted.sender) {
    userJid = m.quoted.sender
  }

  // 🔵 Si hay usuario (por mención o cita)
  if (userJid) {
    let userName
    try {
      userName = await conn.getName(userJid)
    } catch {
      userName = null
    }
    const number = userJid.split('@')[0]

    const mensaje = `
╭─✿ *ID de Usuario* ✿─╮
│  *Nombre:* ${userName && userName !== number ? userName : 'Sin nombre registrado'}
│  *Número:* +${number}
│  *JID/ID:* ${userJid}
╰─────────────────────╯`.trim()

    return conn.reply(m.chat, mensaje, m, { mentions: [userJid] })
  }

  // 🟣 3️⃣ Si no hay mención ni cita y está en grupo → mostrar ID del grupo
  if (m.isGroup) {
    const mensaje = `
╭─✿ *ID del Grupo* ✿─╮
│  *Nombre:* ${groupMetadata.subject}
│  *JID/ID:* ${m.chat}
│  *Participantes:* ${groupMetadata.participants.length}
╰─────────────────────╯`.trim()

    return conn.reply(m.chat, mensaje, m)
  }

  // ⚪ 4️⃣ Si no hay nada → mostrar ayuda
  const ayuda = `
📋 *Uso del comando ID/LID:*

🏷️ *.id @usuario* — Ver ID del usuario
💬 *.id (citando mensaje)* — Ver ID del autor del mensaje
🏢 *.id* (en grupo) — Ver ID del grupo
📱 *.lid* — Ver lista completa de participantes

💡 *Ejemplos:*
• .id @juan
• .id (en grupo)
• .id (citando mensaje)
• .lid (lista completa)`.trim()

  return conn.reply(m.chat, ayuda, m)
}

// 🧩 Handler para lista completa de participantes (.lid)
let handlerLid = async function (m, { conn, groupMetadata }) {
  if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos.')

  const participantes = groupMetadata?.participants || []

  const tarjetas = await Promise.all(participantes.map(async (p, index) => {
    const jid = p.id || 'N/A'
    let name
    try {
      name = await conn.getName(jid)
    } catch {
      name = null
    }
    const number = jid.split('@')[0]
    const estado = p.admin === 'superadmin' ? '👑 *Propietario*' :
                   p.admin === 'admin' ? '🛡️ *Administrador*' :
                   '👤 *Miembro*'

    return [
      '╭─✿ *Usuario ' + (index + 1) + '* ✿',
      `│  *Nombre:* ${name && name !== number ? name : 'Sin nombre registrado'}`,
      `│  *Número:* +${number}`,
      `│  *JID:* ${jid}`,
      `│  *Rol:* ${estado}`,
      '╰───────────────✿'
    ].join('\n')
  }))

  const contenido = tarjetas.join('\n\n')
  const mencionados = participantes.map(p => p.id).filter(Boolean)

  const mensajeFinal = `╭━━━❖『 *Lista de Participantes* 』❖━━━╮
👥 *Grupo:* ${groupMetadata.subject}
🔢 *Total:* ${participantes.length} miembros
╰━━━━━━━━━━━━━━━━━━━━━━╯

${contenido}`

  return conn.reply(m.chat, mensajeFinal, m, { mentions: mencionados })
}

// Configuración para .id
handler.command = ['id']
handler.help = ['id', 'id @user', 'id (citar mensaje)']
handler.tags = ['info']

// Configuración para .lid 
handlerLid.command = ['lid']
handlerLid.help = ['lid']
handlerLid.tags = ['group']
handlerLid.group = true

// Exportar ambos handlers
export { handler as default, handlerLid }
