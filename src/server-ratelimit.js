const express = require('express');
const rateLimit = require('express-rate-limit');

const app = express();
const port = 8081;

// Middleware de rate limiting (Limite de 5 requisições por minuto)
const limiter = rateLimit({
    windowMs: 60 * 1000,  // 1 minuto
    max: 100,  // Limite de 5 requisições
    message: 'Você excedeu o limite de requisições, tente novamente mais tarde.',
});



// Aplica o rate limiter para todas as rotas
app.use(limiter);


// Função simulando chamada externa
async function externalService() {
    return 'Resposta da chamada externa';
}

// Rota que faz a chamada simulada
app.get('/api/ratelimit', async (req, res) => {
    try {
        const result = await externalService();
        res.send(result);
    } catch (error) {
        res.status(500).send(`Erro: ${error.message}`);
    }
});

// Iniciando o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});

async function simulateRateLimit() {
    const url = 'http://localhost:8081/api/ratelimit';
    const requests = 110; // Número de requisições para exceder o limite (100 no rate limiter)

    for (let i = 1; i <= requests; i++) {
        try {
            const response = await fetch(url)
            console.log(`Requisição ${i}:`, response.data);
        } catch (error) {
            if (error.response && error.response.status === 429) {
                console.error(`Requisição ${i}: Erro de Rate Limit - ${error.response.data}`);
            } else {
                console.error(`Requisição ${i}: Erro inesperado - ${error.message}`);
            }
        }
    }
}

simulateRateLimit();
