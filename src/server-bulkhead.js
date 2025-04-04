import express from 'express'
import { bulkhead } from 'cockatiel'

const app = express()
const port = 8080

// Configurando bulkhead com cockatiel (Máximo de 10 requisições simultâneas com 10 requisições na fila de espera)
const bulkheadPolicy = bulkhead(10, 10)

// Função simulando chamada externa
async function externalService() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve('Resposta da chamada externa')
    }, 2000) // Simula uma chamada que demora 1 segundo
  })
}

// Rota que faz a chamada simulada
app.get('/api/bulkhead', async (req, res) => {
  try {
    const result = await bulkheadPolicy.execute(() => externalService())
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

// Função que chama endpoint /api/bulkhead a cada 100ms
async function testBulkhead() {
  let count = 0

  const interval = setInterval(async () => {
    const result = await fetch('http://localhost:8080/api/bulkhead')
    const data = await result.text()

    console.log(`Count: ${count} // Data: ${data}`)

    count++

    if (count > 50) {
      clearInterval(interval)
    }
  }, 100)
}

await testBulkhead()