#!/usr/bin/env node

"use strict"; 

const got = require('got');
const tempfile = require('tempfile');
const wallpaper = require('wallpaper');
const path = require('path');
const fs = require('fs');
const request = require("request")
const weighted = require('weighted')

function setWallpaper(url) {
    console.log("Setting wallpaper to: " + url);
    const file = tempfile(path.extname(url));
    
    got
        .stream(url)
        .pipe(fs.createWriteStream(file))
        .on('finish', () => {
            wallpaper.set(file);
        });

    //delete temp file (we wait 3 seconds so OSX has time to grab the file and set the wallpaper)
    setTimeout(fs.unlinkSync, 3000, file)
}

function setBing() {
    console.log("HANDLER: Bing Photo of the Day");
    
    let lastBingPhotoCount = 100;
    request({
        url: `http://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=${lastBingPhotoCount}&mkt=en-US`,
        json: true
    }, function (error, response, body) {

        if (!error && response.statusCode === 200) {
            var randomPhoto = body.images[Math.floor(Math.random()*body.images.length)];
            setWallpaper("http://www.bing.com" + randomPhoto.url);
        }
    });
}

function setUnsplash() {
    console.log("HANDLER: Unsplash");
    
    var api_key = process.env.UNSPLASH_API_KEY;
    request({
        url: "https://api.unsplash.com/photos/random?client_id=" + api_key,
        json: true
    }, function (error, response, body) {

        if (!error && response.statusCode === 200) {
            setWallpaper(body.urls.full);
        }
    })
}

function setChromecast() {
    console.log("HANDLER: Chromecast Backgrounds");
    
    request({
        url: "https://raw.githubusercontent.com/mattburns/chromecast-backgrounds/master/backgrounds.json",
        json: true
    }, function (error, response, body) {

        if (!error && response.statusCode === 200) {
            var randomPhoto = body[Math.floor(Math.random()*body.length)]; 
            setWallpaper(randomPhoto.url);
        }
    });
}

function setGooglePhoto() {
    console.log("HANDLER: Picasa Web Album");
    
    request({
        url: "https://picasaweb.google.com/data/feed/base/user/108862440783718909111/albumid/6217521077777661025?alt=json&kind=photo&max-results=100&hl=en_US&imgmax=1600",
        json: true
    }, function (error, response, body) {

        if (!error && response.statusCode === 200) {
            var randomPhoto = body.feed.entry[Math.floor(Math.random()*body.feed.entry.length)];
            setWallpaper(randomPhoto.content.src);
        }
    });
}

let wallpaperHandlers = [setBing, setUnsplash, setChromecast, setGooglePhoto]
  , weights = [0.25, 0.25, 0.25, 0.25];

let currentHandler = weighted.select(wallpaperHandlers, weights);
currentHandler();
