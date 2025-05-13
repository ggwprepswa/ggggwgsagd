const { default: makeWASocket, useSingleFileAuthState } = require("@whiskeysockets/baileys");
const { Boom } = require("@hapi/boom");
const fs = require("fs");

const { state, saveState } = useSingleFileAuthState('./auth_info.json');

async function startSock() {
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true
    });

    sock.ev.on("messages.upsert", async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const sender = msg.key.remoteJid;
        const messageText = msg.message.conversation || msg.message.extendedTextMessage?.text;

        if (messageText?.toLowerCase() === "menu") {
            await sock.sendMessage(sender, { text: "📋 *Menu Bot:*\n1. menu\n2. ping\n3. chatgpt [prompt]" });
        } else if (messageText?.toLowerCase().startsWith("chatgpt ")) {
            const prompt = messageText.slice(8);
            const reply = `(dummy reply for "${prompt}")`; // Integrasi ke ChatGPT bisa ditambahkan
            await sock.sendMessage(sender, { text: reply });
        } else if (messageText?.toLowerCase() === "ping") {
            await sock.sendMessage(sender, { text: "pong" });
        }
    });

    sock.ev.on("creds.update", saveState);
}
startSock();
