const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const pino = require("pino");
const config = require("./config.json");

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('session');
    const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        auth: state,
        printQRInTerminal: true
    });

    sock.ev.on('connection.update', (update) => {
        if (update.connection === 'open') console.log('FR RABBI BOT IS READY!');
    });

    sock.ev.on('group-participants.update', async (anu) => {
        if (anu.action === 'add') sock.sendMessage(anu.id, { text: config.welcome });
        else if (anu.action === 'remove') sock.sendMessage(anu.id, { text: config.left });
    });

    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;
        const from = msg.key.remoteJid;
        const body = msg.message.conversation || msg.message.extendedTextMessage?.text || "";

        if (body.toLowerCase().includes("bot")) {
            sock.sendMessage(from, { text: "এতো ডাকিস কেন? তোর কি হয়েছে?" }, { quoted: msg });
        }
    });

    sock.ev.on('creds.update', saveCreds);
}
startBot();
