const express = require('express');

const app = express();
const mysql = require('mysql2');

//motor de plantilla
const hbs = require('hbs');
//encontrar archivos
const path = require('path');
//enviar mails
const nodemailer = require('nodemailer');
const { appendFile, read } = require('fs');
const { threadId } = require('worker_threads');
const { compileFunction } = require('vm');

//variables de entorno
require('dotenv').config();

//configuramos el puerto
const APP_PORT = process.env.APP_PORT

//middelware funciones que dan info a json

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname, 'public')));


//configuramos el motor de plantillas de HBS
app.set('view engine', 'hbs');
//configuramos la ubicacion de las plantillas
app.set('views', path.join(__dirname, 'views'));
//configuramos los parciales de los motores de plantillas
hbs.registerPartials(path.join(__dirname, 'views/partials'));

//Conexión a la Base de Datos
const conexion = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: process.env.MYSQL_PORT
})

conexion.connect((err) =>{
    if(err) throw err;
    console.log(`Conectado a la Database ${process.env.MYSQL_DATABASE}`);
})

//rutas de la aplicacion
app.get('/', (req, res) =>{
    res.render('index', {
        titulo: 'home'
    })
    
})
//paginas de mi app

//pagina de productos de la barra de navegacion
app.get('/productos', (req, res) =>{
    
    let sql = "SELECT * from productos";
    conexion.query(sql, function (err,result){
        if (err) throw err;
        console.log(result);
        res.render('productos', {
            titulo: 'Productos',
            datos: result
        })   
    })
})


//pagina de formulario de la barra de navegacion
app.get('/formulario', (req, res) =>{
    res.render('formulario', {
        titulo: 'formulario'
    })
    
})

//pagina de contacto de la barra de navegacion
app.get('/contacto', (req, res) =>{
    res.render('contacto', {
        titulo: 'contacto'
    })
    
})

app.post('/formulario', (req, res) =>{    
    const nombre = req.body.nombre;
    const precio = req.body.precio;
    const descripcion = req.body.descripcion;

    let datos ={
        nombre: nombre,
        precio: precio,
        descripcion: descripcion
    }

    let sql = "INSERT INTO productos set ?"
        conexion.query(sql, datos, function (err){
            if (err) throw err;
            console.log(`producto ingresado`);
            res.render('index')
        })
})


app.post('/contacto', (req, res)=>{
    const nombre= req.body.nombre;
    const email= req.body.email;

    //console.log(`los datos son ${nombre} - ${email}`);
    //res.send('los datos fueron recibidos, gracias')

//creamos una funcion para enviar email al cliente
async function envioMail(){
    //confirguracion cuenta del envio
    let transporter = nodemailer.createTransport({
        host:'smtp.gmail.com',
        port:465,
        seguridad: true,
        auth: {
            user: process.env.EMAIL_APP,
            pass: process.env.PASSWORD_APP
        }
    });
    //envio mail
    let info = await transporter.sendMail({
        from: process.env.EMAIL_APP,
        to: `${email}`,
        subject: "Gracias por suscribirte",
        html: `Muchas gracias por visitar nuestra web`
    })
}


    let datos ={
        nombre: nombre,
        email: email
    }
    let sql = "INSERT INTO contacto set ?"
    conexion.query(sql, datos, function (err){
        if (err) throw err;
        console.log(`contacto ingresado`);
        //email
        envioMail().catch(console.error);
        res.render('enviado')
    })

})


// servidor a la escucha de las peticiones
app.listen(APP_PORT, ()=>{
    console.log(`Servidor trabajando en 
    el puerto: ${APP_PORT}`);

})

