const router =require('express').Router()

//JWT = limitar el uso de las rutas
const { verifyToken, requireLevel } = require('../middlewares/auth')

//Rutas App (expandiendo segun modulos)
//Version 1: login
router.use('/auth', require('./auth.routes'))
router.use('/personas',verifyToken, require('./persona.routes'))
router.use('/personas',verifyToken, requireLevel('ADMIN'), require('./usuario.routes'))

module.exports = router