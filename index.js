import fs from 'fs'
import chalk from 'chalk'
import readline from 'readline'
import { makeWASocket, Browsers, jidNormalizedUser } from './lib/simple.js'
import { useMultiFileAuthState } from '@whiskeysockets/baileys'

global.vegetasessions = 'GaaraSessions' // Carpeta de sesiones
const { state, saveCreds } = await useMultiFileAuthState(global.vegetasessions)

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (texto) => new Promise((resolver) => rl.question(texto, resolver))

let phoneNumber = global.botNumber
const methodCode = !!phoneNumber || process.argv.includes("code") // forzar 8 dígitos
let opcion = '2' // fuerza que siempre sea con código

// Solicitar número si no está definido
if (!phoneNumber) {
    do {
        phoneNumber = await question(chalk.greenBright(`[ ⚡ ] Ingrese su número de WhatsApp:\n--> `))
        phoneNumber = phoneNumber.replace(/\D/g,'')
        if (!phoneNumber.startsWith('+')) phoneNumber = `+${phoneNumber}`
    } while (!phoneNumber)
    rl.close()
}

const addNumber = phoneNumber.replace(/\D/g, '')
console.log(chalk.cyanBright(`[ ⚡ ] Su número: ${addNumber}`))

// Configuración básica del socket
const connectionOptions = {
    printQRInTerminal: false,
    auth: {
        creds: state.creds,
        keys: state.keys
    },
    browser: Browsers.macOS("Desktop")
}

global.conn = makeWASocket(connectionOptions)

// Pedir código de 8 dígitos
if (!conn.authState.creds.registered) {
    let code = await conn.requestPairingCode(addNumber)
    code = code?.match(/.{1,4}/g)?.join("-") || code
    console.log(chalk.bgMagentaBright.white(`[♡] Código de 8 dígitos:`), chalk.white(code))
}
conn.credsUpdate = saveCreds.bind(conn, true)

console.log(chalk.green.bold(`\n✅ Sesión inicializada en GaaraSessions con éxito!`))
