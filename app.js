const inicioDebug = require('debug')('app:inicio');
const dbDebug = require('debug')('app:db');
const express = require('express');
const config = require('config');
//const logger = require('./logger');
const Joi = require('joi');
const morgan = require('morgan');
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static('public'));

//configuaricón de entornos
console.log('Aplicación: ' + config.get('nombre'));
console.log('BD Server: '+ config.get('configDB.host'));



//middleware de tercero
if(app.get('env')==='development'){
    app.use(morgan('tiny'));
    //console.log("morgan habilitado");
    inicioDebug('Morgan esta habilitado');
}
//Trabajo con DB
dbDebug('conectando a la base de datos')


//app.use(logger);


// app.use(function(req,res,next){
//     console.log('autenticando');
//     next();
// });

const usuarios = [
    {id: 1, nombre: "Juan"},
    { id: 2, nombre: "Maria"},
    { id: 3, nombre: "Paola"}
];

app.get('/',(req, res)=>{
    res.send('Hola desde express!');
});

app.get('/api/usuarios',(req, res)=>{
    res.send(usuarios);
});

app.get('/api/usuarios/:id',(req,res)=>{
    //let usuario = usuarios.find(u => u.id === parseInt(req.params.id));
    let usuario = existeUsuario(req.params.id)
    if (!usuario) {
        res.status(404).send('usuario no encontrado');
    }
    res.send(usuario);
});

app.post('/api/usuarios',(req,res)=>{

    const {error, value} = validarUsuario(req.body.nombre);

    if(!error){
        const usuario = {
            id: usuarios.length + 1,
            nombre: value.nombre
        }
        usuarios.push(usuario);
        res.send(usuario);
    }else{
        const mensaje = error.details[0].message
        res.status(400).send(mensaje);
        return;
    }
    
    // if(!req.body.nombre || req.body.nombre.length <= 2){
    //     res.status(400).send('Debe ingresar un nombre y mayor a dos letras');
    //     return;
    // }

});

app.put('/api/usuarios/:id',(req,res)=>{
    //Encontrar si existe el obj usuario
    //let usuario = usuarios.find(u => u.id === parseInt(req.params.id})
    let usuario = existeUsuario(req.params.id);
    if (!usuario) {
        res.status(404).send('Usuario no encontrado');
        return;
    }

    // const schema = Joi.object({
    //     nombre: Joi.string().min(3).max(30).required()
    // });
    
    const {error, value} = validarUsuario(req.body.nombre);
    
    if(error){
        const mensaje = error.details[0].message
        res.status(400).send(mensaje);
        return;
    }

    usuario.nombre = value.nombre;
    res.send(usuario);

});

app.delete('/api/usuarios/:id',(req,res)=>{
    let usuario = existeUsuario(req.params.id);
    if (!usuario) {
        res.status(404).send('Usuario no encontrado');
        return;
    }

    const index = usuarios.indexOf(usuario);
    usuarios.splice(index, 1);
    //res.send(usuarios);
    res.send(usuario);
});

const port = process.env.PORT || 3000
app.listen(port,()=>{
    console.log(`escuchando en el puerto ${port}...`);
});

function existeUsuario(id) {
    return (usuarios.find(u => u.id === parseInt(id)));
}

function validarUsuario(nombreP) {
    const schema = Joi.object({
        nombre: Joi.string().min(3).max(30).required()
    });
    return (schema.validate({ nombre: nombreP}));
}

