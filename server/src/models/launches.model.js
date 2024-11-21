
const axios = require('axios');

const launchesDatabase = require('./launches.mongo');
const planets = require('./planets.mongo');

const DEFAULT_FLIGHT_NUMBER = 100;

//...................................................................................................
// const launches = new Map();

// let latestFlightNumber = 100;

// const launch = {
//     // ye jo data comment main hai ye sara data available hai spaceX k data main aur hum nasa project par kam kar rhy hain is waqt
//     flightNumber: 100, // flight_number
//     mission: 'Kepler Exploration X', // name of mission
//     rocket: 'Explorer IS1', // rocket.name 
//     launchDate: new Date('December 27, 2030'), // date_local
//     target: 'Kepler-442 b', // not applicable
//     customers: ['ZTM', 'NASA'], // payload.customers for each payload
//     upcoming: true, // upcoming
//     success: true, // success
// };

// saveLaunch(launch);

//........................................................................................

const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query';

async function populateLaunches()
{
    console.log('Downloading launch data...');
    const response = await axios.post(SPACEX_API_URL, {
        query: {},
        options: {
            pagination : false,
            populate: [
                {
                    path: 'rocket',
                    select: {
                        name: 1
                    }
                },
                {
                    path: 'payloads',
                    select: {
                        'customers': 1
                    }
                }
            ]
        }
    });

    if(response.status !== 200) {
        console.log('Problem dawnloading launch data');
        throw new Error('Launch data dawnload failed');
    }

    const launchDocs = response.data.docs;
    launchDocs.forEach((launchDoc, index) => {
        const payloads = launchDoc['payloads'];
        const customers = payloads.flatMap((payload) => {
            return payload['customers'];
        });

        const launch = {
            flightNumber: launchDoc['flight_number'], // Fixed typo here
            mission: launchDoc['name'],
            rocket: launchDoc['rocket']?.['name'] || 'Unknown Rocket', // Handle undefined
            launchDate: launchDoc['date_local'],
            upcoming: launchDoc['upcoming'],
            success: launchDoc['success'],
            customers, // Shorthand property in Ecma script 6
        };

        console.log(`${launch.flightNumber || 'N/A'} - ${launch.mission || 'N/A'}`);

    });
    // await saveLaunch(launch);
}

async function loadLaunchData() {
    const firstLaunch = await findLaunch({
        flightNumber : 1,
        rocket : 'Falcon 1',
        mission : 'FalconSat',
    });

    if(firstLaunch) {
        console.log('Launch data already loaded!');
    }
    else {
        await populateLaunches();
    }

}

// loadLaunchData();

async function findLaunch(filter) {
    return await launchesDatabase.findOne(filter);
}

async function existsLaunchWithId(launchId) {
    return await launchesDatabase.findLaunch({
        flightNumber : launchId,
    });
}

async function getLatestFlightNumber() {
    const latestLauncg = await launchesDatabase
        .findOne().sort('-flightNumber');

    if(!latestLauncg) {
        return DEFAULT_FLIGHT_NUMBER;
    }

    return latestLauncg.flightNumber;  
}
async function getAllLaunches(skip,limit) {
    return await launchesDatabase.find({}, { '_id' : 0, '__v' : 0 }).sort({
        flightNumber : 1,
    })
    .skip(skip).limit(limit);

    // return Array.from(launches.values());
}

async function saveLaunch(launch) {
    await launchesDatabase.findOneAndUpdate(
        { flightNumber: launch.flightNumber },
        launch,
        { upsert: true }
    );
}



// ye addNewLaunch ki tarha same function hai
async function scheduleNewLaunch(launch) {

    const planet = await planets.findOne({
        keplerName: launch.target,
    });

    if (!planet) {
        console.error(`Planet not found in database for target: ${launch.target}`);
        throw new Error(`No matching planet found for target: ${launch.target}`);
    }

    const newFlightNumber = await getLatestFlightNumber() + 1;
    // add new launch
    const newLaunch = Object.assign(launch, {
        success : true,
        upcoming : true,
        customers : ['ZTM', 'NASA'],
        flightNumber : newFlightNumber,
    });

    await saveLaunch(newLaunch);
}

async function abortLaunchById(launchId) {
    try {
        const result = await launchesDatabase.updateOne(
            { flightNumber: launchId }, // Filter
            { $set: { upcoming: false, success: false } } // Update fields
        );

        // Check if the operation was successful
        if (result.matchedCount === 0) {
            console.error(`No launch found with flightNumber: ${launchId}`);
            return false;
        }

        // Return true if the document was modified successfully
        return result.modifiedCount === 1;
    } catch (error) {
        console.error(`Error aborting launch with ID ${launchId}:`, error);
        throw new Error(`Could not abort launch with ID ${launchId}`);
    }
}

module.exports = {
    loadLaunchData,
    existsLaunchWithId,
    getAllLaunches,
    scheduleNewLaunch,
    abortLaunchById,
};
