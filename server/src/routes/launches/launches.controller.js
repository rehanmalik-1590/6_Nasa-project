
const { 
    getAllLaunches,
    scheduleNewLaunch,
    existsLaunchWithId,
    abortLaunchById,
} = require('../../models/launches.model');

const {
    getPagination,
} = require('../../services/query');

async function httpGetAllLaunches(req, res) {
    const { skip, limit } = getPagination(req.query);   // ye destructuring use karne ka tareeka hai {} is braces k ander value rakh kar phir asign 
    
    const launches = await getAllLaunches(skip,limit);
    return res.status(200).json(launches);
}

async function httpAddNewLaunch(req, res) {
    const launch = req.body;

    // Check for required launch properties
    if (!launch.mission || !launch.rocket || !launch.launchDate || !launch.target) {
        return res.status(400).json({
            error: 'Missing required launch property',  // Corrected spelling
        });
    }

    // Validate the launch date
    const launchDate = new Date(launch.launchDate);
    if (isNaN(launchDate.getTime())) {  // Use getTime() to check if date is invalid
        return res.status(400).json({
            error: 'Invalid Launch Date',
        });
    }

    // Use the validated date
    launch.launchDate = launchDate;

    await scheduleNewLaunch(launch);
    console.log(launch);
    return res.status(201).json(launch);
}

async function httpAbortLaunch(req, res) {
    const launchId = Number(req.params.id);

    const existsLaunch = await existsLaunchWithId(launchId);
    if (!existsLaunch) {
        return res.status(404).json({
            error: 'Launch not found',
        });
    }

    const aborted = await abortLaunchById(launchId);
    if(!aborted) {
        return res.status(400).json({
            error : 'Launch not aborted',
        });
    }

    return res.status(200).json({
        message: 'Launch aborted successfully',
        launch: aborted,
        ok : true,
    });
}


module.exports = {
    httpGetAllLaunches,
    httpAddNewLaunch,
    httpAbortLaunch,
};