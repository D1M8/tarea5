const router =require('express').Router()
const c = require('../controllers/auth.controller') //Contro
const { verifyToken } = require ('../middlewares/auth')
const { loginLimiter } = require ('../middlewares/rateLimit')

//¿En un login, que verbo debemos utilizar
//POST (enviamos un paquete, proteccion)
router.post('/login, loginLimiter, c.login')
router.post('/logout', c.logout)
router.get('/me', verifyToken, c.me)

module. exports = router
