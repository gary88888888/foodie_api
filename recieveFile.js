const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

class FileReceiver {
  constructor(app) {
    
    this.app = app;
    this.app.use(bodyParser.raw({ type: 'image/jpg', limit: '10mb' }));
    this.app.post('/upload', this.handleUpload.bind(this));
  }

//   start() {
//     this.app.listen(this.port, () => {
//       console.log(`Server running on port ${this.port}`);
//     });
//   }

  handleUpload(req, res) {
    console.log(req)
    if (!req.is('image/jpg')) {
      res.status(400).send(req);
      return;
    }

    const fileStream = fs.createWriteStream(path.join(__dirname, 'received_photo.jpg'));
    fileStream.on('error', (err) => {
      console.error(err);
      res.status(500).send('Internal server error');
    });

    fileStream.on('finish', () => {
      res.status(200).send('File uploaded successfully');
    });

    req.pipe(fileStream);
  }
}
module.exports = FileReceiver;
// const receiver = new FileReceiver(); // Set the desired port number
// receiver.start();