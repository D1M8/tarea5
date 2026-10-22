require("dotenv").config()

//Modulos de la aplicacion
const path = require('path') //Gestion de rutas
const express = require('express') //Framework Backend
const helmet = require('helmet') // Seguridad - JWT 
const cookieParser = require('cookie-parser') // Cookie (Archivo guarda configuracion)

//Gestion de rutas
const routes = require('./routes')

//Otras configuraciones
const { apiLimiter} = require('./middlewares/rateLimit')
const { notFound, errorHandler} =require ('./middlewares/errorHandler')

const app = express() //Inicializar
const isProd =process.env.NODE_ENV=== 'produccion' //Evalua el tipo de entorno

//Proxy = mascara de navegacion
if (process.env.TRUS_PROXY) app.set('trust proxy', Number(process.env.TRUS_PROXY))

//Configuracion de seguridad
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      'style-src': ["'self'"],
      'upgrade-insecure-request': isProd ? [] : null
    }
  }
}))

// Configurando express...
app.use(express.json({ limit: '10kb' })) // Tamaño máximo JSON 
app.use(cookieParser()) //Leer cooki
app.use(express.static(path.join(__dirname, '..', 'public'))) //Ruta Frontend

// Configuración de ruta
app.use('/api', apilimiter, routes)

//Ruta raíz '/' (dev) localhost:3000, (prod) www.miapp.com 
app.get('/', (req, res)=> res.redirect('/index.html'))

//Manejamos rutas inexistentes 
app.use('/api', notFound) 
app.use(errorHandler)

//Exportamos este módulo
module.exports = app
