require("dotenv").config();
const express = require("express");
const axios = require("axios");
const twilio = require("twilio");

const app = express();
app.use(express.json());

const twilioClient = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

app.post("/webhook", async (req, res) => {
    const mensaje = req.body.Body;
    const telefono = req.body.From;

    // Enviar mensaje a OpenAI (GPT-4)
    const respuestaIA = await axios.post("https://api.openai.com/v1/chat/completions", {
        model: "gpt-4",
        messages: [{ role: "user", content: mensaje }]
    }, {
        headers: { "Authorization": `Bearer ${process.env.OPENAI_API_KEY}` }
    });

    const respuestaTexto = respuestaIA.data.choices[0].message.content;

    // Enviar respuesta a WhatsApp
    await twilioClient.messages.create({
        from: process.env.TWILIO_WHATSAPP_NUMBER,
        to: telefono,
        body: respuestaTexto
    });

    res.sendStatus(200);
});

// Iniciar servidor en el puerto 3000
app.listen(3000, () => console.log("Bot de WhatsApp con OpenAI activo 🚀"));
