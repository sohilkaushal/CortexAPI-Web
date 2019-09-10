const express = require('express');
const http = require('http');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.Server(app);
const serverIO = require('socket.io')(server);

const database = require('./database');

app.use(express.static(`${__dirname}/public`));

server.listen(9000);
const directory = path.join(__dirname, 'data');

const result = [];
serverIO.on('connection', (socket) => {
  const date = Date.now();
  const connectionDate = date.toString();
  fs.closeSync(fs.openSync(`./data/info-${connectionDate}.json`, 'a'));
  console.log(`[CREATING FILE] :${connectionDate}`);
  socket.on('data', (data) => {
    const response = JSON.stringify(JSON.parse(data, null, 2));
    fs.appendFile(`./data/info-${connectionDate}.json`, response, () => {});
    result.push(data);
  },
  socket.on('disconnect', () => {
  	/**
	   * @param directory
	   * @param file
	   * @param objectID
	   * */
    const readFile = (directory, file, objectID) => {
      // Read contents line by line
      fs.readFile(`${directory}/${file}`, { encoding: 'utf-8' }, (errorFile, contents) => {
        // console.log(typeof (contents));
        if (errorFile) console.error('[ACCESS ERROR]: ERROR WHILE READING THE FILE');
        database.fileData.create({
          stream: contents,
          origin: file,
          originID: objectID,
        });
      });
    };
    fs.readdir(directory, (errorDir, files) => {
      if (errorDir) console.error('[ACCESS ERROR]: ERROR WHILE READING THE DIRECTORY\n');
      files.forEach((file) => {
        const sessionFile = path.parse(file).name;
        const sessionDate = sessionFile.slice(5);

        // Checking if the file exists in the database
        database.readingData.findOne({ fileName: sessionFile }).lean().then((result) => {
          if (!result) {
            database.readingData.create({
              fileName: sessionFile,
              date: sessionDate,
            }).then((data) => {
              const id = data._id;
              console.log(id);
              readFile(directory, file, id);
            }).catch((err) => {
              console.log(err);
            });
          }
        });
      });
    });
  }));
});
