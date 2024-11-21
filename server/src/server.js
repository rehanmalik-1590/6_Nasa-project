const http = require('http');

require('dotenv').config();

const app = require('./app');
const { mongoConnect } = require('./services/mongo')
const { loadPlanetsData} = require('./models/planets.model');
const { loadLaunchData } = require('./models/launches.model')

const PORT = process.env.PORT || 8000;


const server = http.createServer(app);


async function startServer()
{
    //.....................MongoDb Connect..............................
    await mongoConnect();
    await loadPlanetsData();
    await loadLaunchData();

    server.listen(PORT, () => {
        console.log(`Listening on port ${PORT}...`);
    }).on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`Port ${PORT} is in use, trying another port...`);
            server.listen(0); // This will pick an available port automatically
        } else {
            console.error(err);
        }
    });
}

startServer();


