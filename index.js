const fs_promises = require('fs').promises;
const fs = require('fs');
const path = require('path');
var formidable = require('formidable');
const Express = require("express");
const bodyParser = require('body-parser');
const { MongoClient } = require("mongodb");
const { machine } = require('os');

const app = Express();


const PORT = 3030;
let client;
let reciever
async function generateDataBaseConnectionString() {
  try {
    const data = await fs_promises.readFile('config.json', 'utf8');
    const config = JSON.parse(data);
    const databaseConfig = config.database;
    return `mongodb://${databaseConfig.username}:${databaseConfig.password}@${databaseConfig.host}:${databaseConfig.port}`;
  } catch (error) {
    console.error('Error reading database configuration:', error);
    return null;
  }
}

(async () => {
  const CONNECTION_STRING = await generateDataBaseConnectionString();
  if (!CONNECTION_STRING) {
    console.error('Failed to generate database connection string');
    return;
  }


  try {
    client = new MongoClient(CONNECTION_STRING);
    await client.connect();
    console.log("Connected to database");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    reciever = new FileReceiver(app);
  } catch (error) {
    console.error('Error connecting to database:', error);
    if (client) {
      await client.close();
    }
  }
})();

app.get('/api/food_history/device/:device/date/:date', getAll)
app.get('/api/food_history/device', getDevice)
app.get('/api/food_history/device/:device', getDate)


app.post('/api/upload', (req, res, next) => {
  // console.log(req)
  const form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
    // console.log(err)
    // console.log(fields)
    console.log(files)
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


async function getAll(req, res) {
  try {

    // Get the database and collection on which to run the operation
    database = client.db(req.params['device']);
    const device = database.collection(req.params['date']);
    // Query for a movie that has the title 'The Room'
    const query = {};
    const options = {
      // Sort matched documents in descending order by rating
      sort: { "create_time": 1 },
      // Include only the `title` and `imdb` fields in the returned document
      projection: { _id: 0 },
    };
    // Execute query
    const cursor = await device.find(query, options);
    if ((await device.countDocuments(query)) === 0) {

      console.log("No documents found!");

    }

    // Print returned documents
    var data = []
    for await (const doc of cursor) {
      data.push(doc)
      console.dir(doc);

    }
    res.send(data)

  } finally {
    //   await client.close();
  }
}

async function getDevice(req, res) {
  try {

    // Get the database and collection on which to run the operation
    database = client.db("foodie");
    const device = database.collection("device");
    // Query for a movie that has the title 'The Room'
    const query = {};
    const options = {
      // Sort matched documents in descending order by rating
      sort: {},
      // Include only the `title` and `imdb` fields in the returned document
      projection: { _id: 0 },
    };
    // Execute query
    const cursor = await device.find(query, options);
    if ((await device.countDocuments(query)) === 0) {

      console.log("No documents found!");

    }

    // Print returned documents
    var data = []
    for await (const doc of cursor) {
      data.push(doc)
      console.dir(doc);

    }
    res.send(data)

  } finally {
    //   await client.close();
  }
}
async function getDate(req, res) {
  try {

    // Get the database and collection on which to run the operation
    database = client.db(req.params['device']);

    // Query for a movie that has the title 'The Room'

    const collections = await database.listCollections().toArray();
    // collections.sort()
    collections.sort((a, b) => {
      // 假设集合有一个名为 'createDate' 的属性表示创建时间

      const createDateA = new Date(a.name); // 获取集合A的创建时间
      const createDateB = new Date(b.name); // 获取集合B的创建时间

      // 进行时间比较和排序
      return createDateB - createDateA; // 如果是日期对象，可以使用 getTime() 方法获取时间戳
    });

    res.send(collections)

  } finally {
    // client.close();
  }
};

class FileReceiver {
  constructor(app) {
    this.fs = require('fs')
    // this.app = app;
    // app.use(bodyParser.raw({ type: 'image/png', limit: '20mb' }));
    app.post('/upload/macAddress/:mac_address/folderName/:folder_name', this.handleUpload.bind(this));
    console.log("file reciever init ")
  }

  start() {
    this.app.listen(this.port, () => {
      console.log(`Server running on port ${this.port}`);
    });
  }

  

  handleUpload(req, res) {
    console.log(req.params)
    let mac_address = req.params['mac_address']; // 儲存格式為 uploads / mac_address / time_string /
    let folder_name = req.params['folder_name'];
    console.log(mac_address)
    console.log(folder_name)
    const form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
   
      console.log(files)
      let oldPath = files['profilePic'][0]['filepath'];
      let folderPath = path.join(__dirname, 'uploads',mac_address,folder_name)
      let newPath = folderPath + '/' + files['profilePic'][0]['originalFilename']
      
      console.log(oldPath)
      console.log(newPath)
      
      let rawData = fs.readFileSync(oldPath)
      if (!fs.existsSync(folderPath)) {
        

        fs.mkdir(folderPath,{ recursive: true }, error => error ? console.log(error) : 
          fs.writeFile(newPath, rawData, function (err) {
          
            if (err) console.log(err)
            return res.send("Successfully uploaded")
          }) ) ;
        
      }
      

      // fs.writeFile(newPath, rawData, function (err) {
        
      //   if (err) console.log(err)
      //   return res.send("Successfully uploaded")
      // })
      
    })
  }

}