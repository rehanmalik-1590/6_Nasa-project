
const API_URL = 'http://localhost:8000/v1';
async function httpGetPlanets() {
  // Load planets and return as JSON.
  try {
    const response = await fetch(`${API_URL}/planets`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch planets:", error);
    // Handle the error appropriately
  }
  
}

// Load launches, sort by flight number, and return as JSON.
async function httpGetLaunches() {
  try {
    const response = await fetch(`${API_URL}/launches`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const fetchedLaunched = await response.json();
    return fetchedLaunched.sort((a, b) => {
      return a.flightNumber - b.flightNumber;
    });
    
  } catch (error) {
    console.error("Failed to fetch planets:", error);
    // Handle the error appropriately
  }
}

// Submit given launch data to launch system.
async function httpSubmitLaunch(launch) {
  try {
    return await fetch(`${API_URL}/launches`, { // Corrected endpoint
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(launch),
    });
  } catch (error) {
    return {
      ok: false,
    };
  }
}


// Delete launch with given ID.
async function httpAbortLaunch(id) {
  try {
    const response = await fetch(`${API_URL}/launches/${id}`, { 
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return {
      ok: true,
      status: response.status,
    };
  } catch (error) {
    console.error("Failed to abort launch:", error);
    return {
      ok: false,
      error: error.message,
    };
  }
}


export {
  httpGetPlanets,
  httpGetLaunches,
  httpSubmitLaunch,
  httpAbortLaunch,
};