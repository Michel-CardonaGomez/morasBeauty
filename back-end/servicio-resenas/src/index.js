const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
require('dotenv').config()

const resenaRoutes = require('./routes/resena.routes')

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/resenas', resenaRoutes)

// Conectar a MongoDB
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('MongoDB conectado'))
  .catch(err => console.error('Error MongoDB:', err))

const PORT = 3004
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servicio reseñas corriendo en puerto ${PORT}`)
})