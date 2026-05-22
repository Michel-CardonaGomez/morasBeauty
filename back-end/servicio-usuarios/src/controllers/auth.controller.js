const service = require('../services/usuario.service')

const registro = async (req, res) => {
  try {
    const result = await service.registro(req.body)
    res.status(201).json(result)
  } catch (e) {
    res.status(400).json({ error: e.message })
  }
}

const login = async (req, res) => {
  try {
    const result = await service.login(req.body)
    res.json(result)
  } catch (e) {
    res.status(401).json({ error: e.message })
  }
}

module.exports = { registro, login }