const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const albumRoutes = require('./routes/album.routes');
const session = require("express-session");
const flash = require("connect-flash");
const fileUpload = require("express-fileupload");

const app = express();

app.set('trust proxy',1);
app.use(session({
  secret: "secret",
  resave: false,
  saveUninitialized: true,
//  cookie:{secure:true}
}));

app.use(flash());

app.get('/', (req,res)=>{
  res.redirect('/albums');
})

// Connexion à MongoDB
mongoose.connect('mongodb://localhost/phototheque')
  .then(() => console.log('Connecté à MongoDB'))
  .catch(err => console.error('Erreur de connexion à MongoDB :', err));

// Configuration du moteur de template
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware body
app.use(express.urlencoded({extended:false}));
app.use(express.json()); 
app.use(fileUpload());

// Fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', albumRoutes);

// Middleware 404
app.use((req, res) => {
  res.status(404).send('Page non trouvée');
});

app.use((error, req, res, next) => {
  console.log(error);
  res.status(500).send('Erreur interne');
});

// Lancement du serveur
app.listen(3000, () => {
  console.log('App lancée sur le port 3000');
});
