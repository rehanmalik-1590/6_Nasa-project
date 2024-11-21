const mongoose = require('mongoose');

//................................MongoDb Connection String..............................
const MONGO_URL = process.env.MONGO_URL;

// .......................Mongo Db Connection............................
mongoose.connection.once('open', () => {
    console.log('mongoDb connecting ready.');
});

mongoose.connection.on('error', (err) => {
    console.error(err);
});

async function mongoConnect()
{
    await mongoose.connect(MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
}

async function mongoDisconnect() {
    await mongoose.disconnect();
}

module.exports = {
    mongoConnect,
    mongoDisconnect,
};