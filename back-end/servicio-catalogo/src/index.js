const express = require('express')
const cors = require('cors')
require('dotenv').config()

const servicioRoutes = require('./routes/servicio.routes')

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/servicios', servicioRoutes)

const PORT = 3002
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servicio catálogo corriendo en puerto ${PORT}`)
})