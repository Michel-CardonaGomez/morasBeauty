const express = require('express')
const cors = require('cors')
require('dotenv').config()

const citaRoutes = require('./routes/cita.routes')

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/citas', citaRoutes)

const PORT = 3003
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servicio citas corriendo en puerto ${PORT}`)
})