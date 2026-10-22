//Usuario = accede al app
const bcrypt = require("bcryptjs")
const db = require ("../config/db")
const { httpError, requireFields, checkCredentials } = require("../utils")


//Perfile o roles de usuario
const NIVELES = ["ADMIN", "USUARIO"]

// Consulta base
const baseQuery = () => {
   db("usuarios as u")
    .join("personas as p", "p.id", "u.idpersonas")
    .select(
      "u.id",
      "u.idpersona",
      "U.nombre_usuario",
      "u.nivel_acceso",
      "u.estado",
      "p.apellidos",
      "p.nombres"
    )
}

//Verificar nivel
const checkNivel = (nivel) => {
  //Si la variable no esta definida
  if (nivel !== undefined && !NIVELES.includes(nivel)){
    throw httpError(400, `Nivel de acceso incorrecto `)

  }
}

//Listar
exports.list = async (req, res) => {
  res.json(await baseQuery().orderBy("u.id"))
}

//Buscar
exports.get = async (req, res) => {
  const row = await baseQuery().where("ud.id" , req.params).first()

  if (!row) {
    throw httpError(404, "El usuario no fue encontrado");
  }
  
  res.json(row);
  
}

//Registrar
exports.create = async (req, res) => {
  //Validación, campos obligatorios
  requireFields(req.body, ["idpersona", "nombre_usuario", "clave_acceso"])

  //Deserealizar los datos que vienen en body
  const { idpersona, nombre_usuario, clave_acceso, nivel_acceso, estado } = req.body

  //Verificar que nivel sea correcto
  checkNivel(nivel_acceso)

  //Verificar credencial
  checkCredentials(req.body, {claveObligatoria: true})

  //Creamos al usuario
  const [id] = await db("usuarios").insert({
    idpersona,
    nombre_usuario,
    nivel_acceso,
    estado,
    clave_acceso: await bcrypt.hash(clave_acceso, 10)
  })

  res.status(201).json({ id, message: 'Usuario creado'})
}

//Actualizar

//Eliminar
exports.remove = async (req, res) => {
  //Es posible eliminar tu propio usuario

  if (Number(req.params.id) === req.user.id){
    throw httpError(400, "No puedes eliminar tu propio usuario")
  }

  
  const num = await db("usuarios") 
    .where({ id: req.params.id }) 
    .del()

  if (!num) throw httpError (404, "Usuario no existe") 
  res.json({ message: 'Usuario eliminado' })
}