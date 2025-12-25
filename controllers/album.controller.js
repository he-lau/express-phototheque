const Album = require('../models/Album');
const path = require('path');
const fs = require('fs');
const { rimraf } = require("rimraf");
const catchAsync = require("../helpers/catchAsync");


const albums = catchAsync(async (req,res) => {
    console.log('GET /albums');
    //throw new Error('Ereur !!!')

    try {
        const albums = await Album.find();
        console.log(albums);
        
        res.render('albums', {title:'Mes albums', albums:albums});
    } catch (error) {
        console.log(error);
        
    }
});

const album = catchAsync(async (req,res) => {
    console.log(`GET /albums/${req.params.id}`);
    //console.log(req.params.id);
    
    try {
        const album = await Album.findById(req.params.id);

        res.render('album',{
            title:'Album - '+album.title,
            album:album,
            errors:req.flash('error')
        })
    } catch (error) {
        console.log(error);
        res.redirect('/404');
    }
});

const createAlbumForm = catchAsync((req,res) => {
    console.log('GET /albums/create');
    
    res.render('new-album',{
    title: 'Nouvel album',
    errors:req.flash('error')});
});

const createAlbum =  catchAsync(async (req,res) => {
    console.log('POST /albums/create');

    const title = req.body.albumTitle;

    try {
        if(title) {
            console.log(title);

            await Album.create({
                title:title
            });
    
            res.redirect('/albums');
        }
        else {
            req.flash("error", "Le titre ne doit pas être vide");
            res.redirect('/albums/create');
            return;  
        }        
    } catch (error) {
        console.log(error);
        req.flash("error", "Erreur lors de la création de l'album");
        res.redirect('/albums/create');  
    }
});

const addImage = catchAsync(async (req,res)=>{
    const albumId = req.params.id;
    console.log(`POST /albums/${albumId}`);

    if(!req?.files?.image) {
        req.flash('error', 'Aucun fichier');
        res.redirect(`/albums/${albumId}`);
        return;
    }

    try {
        const album = await Album.findById(albumId);
        const imageName = req.files.image.name;
        const imageMimetype = req.files.image.mimetype;

        if(imageMimetype != 'image/jpeg' && imageMimetype != 'image/png') {
            req.flash('error', 'Le fichier doit être une image (.jpeg ou .png)');
            res.redirect(`/albums/${albumId}`);
            return;
        }

        const folderPath = path.join(__dirname,'../public/uploads',albumId);
        const localPath = path.join(__dirname,'../public/uploads',albumId,imageName);

        if (!fs.existsSync(folderPath)) {
            try {
                fs.mkdirSync(folderPath,{recursive:true});
                console.log('Dossier créé :', folderPath);
            } catch (err) {
                console.error('Erreur création dossier :', err);
            }
        } 


        await req.files.image.mv(localPath);
/*
        await Album.findByIdAndUpdate(
            albumId,
            { $addToSet: { images: imageName } },
            { new: true }
        );
*/
        if (!album.images.includes(imageName)) {
            album.images.push(imageName);
        }

        // Sauvegarde les modifications
        await album.save();

        res.redirect(`/albums/${albumId}`);
        //res.sendStatus(200);        
    } catch (error) {
        console.log(error);
        
    }
});

const deleteImage = catchAsync(async (req,res) => {
    const albumId = req.params.id;
    const imageIndex = req.params.index;
    console.log(`DELETE /albums/${albumId}/delete/${imageIndex}`);

    try {
        const album = await Album.findById(albumId);
        const image = album.images[imageIndex];

        if(!image) {
            res.redirect(`/albums/${albumId}`);
            return;
        }

        album.images.splice(imageIndex,1);
        await album.save();

        const imagePath = path.join(__dirname,'../public/uploads',album._id.toString(),image);

        fs.unlinkSync(imagePath);
        console.log(image);
        
    } catch (error) {
        console.log(error);
    }



    res.redirect(`/albums/${albumId}`);
});

const deleteAlbum = async (req,res)=>{
    
    try {
        const albumId = req.params.id;
        console.log(`DELETE albums/${albumId}/delete`);

        // Bdd
        const album = await Album.findByIdAndDelete(albumId);

        // upload
        const folderPath = path.join(__dirname,'../public/uploads',albumId);

        await rimraf(folderPath);

        res.redirect('/');



    } catch (error) {
        console.log(error);
    }
    
}

module.exports = {
    createAlbumForm,
    createAlbum,
    albums,
    album,
    addImage,
    deleteImage,
    deleteAlbum
}