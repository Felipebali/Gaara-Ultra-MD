import fs from 'fs'
import path from 'path'
import P from 'pino'
import { makeWASocket, useSingleFileAuthState, fetchLatestBaileysVersion, DisconnectReason } from '@whiskeysockets/baileys'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const { state, saveState } = useSingleFileAuthState('./session.json')

async function startBot() {
    const { version } = await fetchLatestBaileysVersion()
    console.log(`Conectando con Baileys v${version.join('.')}`)

    const conn = makeWASocket({
        logger: P({ level: 'silent' }),
        printQRInTerminal: true,
        auth: state,
        version
    })

    // Definir pushMessage para que el handler funcione
    conn.pushMessage = async function(messages) {
        return messages
    }

    // Mensajes entrantes
    conn.ev.on('messages.upsert', async (chatUpdate) => {
        if (!chatUpdate.messages || !chatUpdate.messages[0]) return

        // Mostrar mensajes en consola para debug
        try {
            chatUpdate.messages.forEach(m => {
                let sender = m.key.participant || m.key.remoteJid
                let text = m.message?.conversation
                        || m.message?.extendedTextMessage?.text
                        || m.message?.imageMessage ? '[imagen]'
                        : m.message?.videoMessage ? '[video]'
                        : m.message?.stickerMessage ? '[sticker]'
                        : m.message?.buttonsResponseMessage?.selectedButtonId ? `[botón: ${m.message.buttonsResponseMessage.selectedButtonId}]`
                        : '[otro tipo]'
                console.log(`[${sender}]: ${text}`)
            })
        } catch (err) {
            console.error('Error al mostrar mensaje:', err)
        }

        // Pasar el chatUpdate completo al handler
        import('./handler.js')
            .then(mod => mod.handler(chatUpdate))
            .catch(err => console.error('Error en handler:', err))
    })

    conn.ev.on('creds.update', saveState)

    conn.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        if(connection === 'close') {
            if(lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
                console.log('Reconectando...')
                startBot()
            } else {
                console.log('Sesión cerrada. Escaneá el QR de nuevo.')
            }
        } else if(connection === 'open') {
            console.log('✅ Conectado correctamente')
        }
    })

    return conn
}

startBot()
