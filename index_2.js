const express = require('express');
const fs = require('fs');
const path = require('path')
const formidable = require('formidable');
 
const app = express();
 
app.post('/api/upload', (req, res, next) => {
 
    const form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
 
        let oldPath = files['profilePic'][0]['filepath'];
        let newPath = path.join(__dirname, 'uploads') + '/' + files['profilePic'][0]['originalFilename']
        // console.log(files['profilePic'][0]['originalFilename'])
        console.log(oldPath)
        console.log(newPath)
        // console.log("efwfewfew")
        let rawData = fs.readFileSync(oldPath)
        // console.log(newPath)
        fs.writeFile(newPath, rawData, function (err) {
            if (err) console.log(err)
            return res.send("Successfully uploaded")
        })
    })
});
 
app.listen(3000, function (err) {
    if (err) console.log(err)
    console.log('Server listening on Port 3000');
});