import express from 'express'
import rateLimit from 'express-rate-limit'

const app = express()
const port = 8080

// Middleware de rate limiting (Limite de 5 requisições por minuto)
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 100, // Limite de 100 requisições
  message: 'Você excedeu o limite de requisições, tente novamente mais tarde.',
})

// Aplica o rate limiter para todas as rotas
app.use(limiter)

// Função simulando chamada externa
async function externalService() {
  return 'Resposta da chamada externa'
}

// Rota que faz a chamada simulada
app.get('/api/ratelimit', async (req, res) => {
  try {
    const result = await externalService()
    res.send(result)
  } catch (error) {
    // @ts-expect-error error is not typed
    res.status(500).send(`Erro: ${error.message}`)
  }
})

// Iniciando o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`)
})

// Função que chama 110 vezes o endpoint /api/ratelimit a cada 100ms
async function breakRateLimit() {
  let count = 0

  const interval = setInterval(async () => {
    const result = await fetch('http://localhost:8080/api/ratelimit')
    const data = await result.text()

    console.log(`Count: ${count} // Data: ${data}`)

    count++

    if (count > 110) {
      clearInterval(interval)
    }
  }, 100)
}

await breakRateLimit()