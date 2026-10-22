const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const db = require('../comfig/db')
const {httpError, requireFields } = require('../utils')

//Configuracion cookies
const cookieOpts ={
  httpOnly : true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production'
}

//HASH temporal
const DUMMY_HASH =bcrypt.hashSync('dummy-password', 10)

//Export.metodo
exports.login = async (req, res) =>{
  requireFields(req.body, ['nombre de usuario', 'clave de acceso'])
  
  //Deserealizacion
  const {nombre_usuario, clave_acceso} = req.body 

  //Validar el tipo de dato (seguridad xss)
  if (typeof nombre_usuario !== 'string' || typeof clave_acceso !== 'string'){
    throw httpError(400, 'Datos no son correctos')
  }
  //Buscamos al usuario
  const user = await db('usuarios').where({nombre_usuario}).first()
  const valid =await bcrypt.compare(clave_acceso, user ? user.clave_acceso : DUMMY_HASH)

  if (!user || !user.estado || !valid ){
    //401 NO AUTORIZADO
    throw httpError(401, 'Usuario o contraseña incorrecta')
  }
  //Si llegaste hasta aqui - WELCOME

  const token = jwt.sign({
    id: user.id,
    nombre_usuario: user.nombre_usuario,
    nivel_acceso: user.nivel_acceso
  }, process.env.JWT_SECRET,{
    algorithm: 'HS256',
    expiresIn: process.env.JWT_EXPIRES_IN || '8h'
  })

  res.cookie('token', token, cookieOpts).json({ message: 'Bienvenido'})
}

//Cierre de sesion
exports.logout = async (req, res)=> {
  res.clearCookie('token', cookieOpts).json({ message: 'Sesion finalizada'})
}

//Funcion que retorene la informacion completa
exports.me = async ( req, res) =>{
  //Objetivo es hacer una consulta mutitable
  const usuario = await db('usuarios as u')
    .join('personas as p','p.id', 'u.idpersona')
    .where('u.id', req.user.id)
    .select('ud.id', 'u.nombre_usuario', 'u.nivel_acceso', 'p.nombre', 'p.apellidos')
    .first()

  if (!usuario) throw httpError (401, 'Usuario no encontrado')

  //Si existe envio los datos como JSON
  res.json(usuario)
}