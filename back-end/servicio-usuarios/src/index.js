const express = require('express')
const cors = require('cors')
require('dotenv').config()


const authRoutes     = require('./routes/auth.routes')
const empleadoRoutes = require('./routes/empleado.routes')

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/auth',      authRoutes)
app.use('/api/empleados', empleadoRoutes)

const PORT = 3001
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servicio usuarios corriendo en puerto ${PORT}`)
})