import * as express from 'express';
import * as http from 'http';
import * as path from 'path';


const port = 8000;
const app = express.default();
const httpServer = http.createServer(app);

// This path might be a bad idea
app.use('/media', express.static(
    path.join(__dirname, '../npm/node_modules/blockly/media')));
app.use('/', express.static(__dirname));

httpServer.listen(port, function() {
    console.log('listening at port ' + port);
});

