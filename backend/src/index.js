const express = require('express')
const cors = require('cors')
require('dotenv').config()

const authRoutes = require('./routes/auth.routes')
const contractRoutes = require('./routes/contract.routes')
const teamRoutes = require('./routes/team.routes')

const app = express()

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json())


app.use('/api/auth', authRoutes)
app.use('/api/contracts', contractRoutes)
app.use('/api/team', teamRoutes)


app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})


app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Internal server error' })
})

const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`)
})