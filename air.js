// DOM elements
const errorLabel = document.querySelector("label[for='error-msg']");
const latInp = document.querySelector("#latitude");
const lonInp = document.querySelector("#longitude");
const airQuality = document.querySelector(".air-quality");
const airQualityStat = document.querySelector(".air-quality-status");
const srchBtn = document.querySelector(".search-btn");
const componentsEle = document.querySelectorAll(".component-val");

// API key and endpoint
const appId = "11c26bd9e235aa8b6a22ed585b7d1334"; // Get your own API key from https://home.openweathermap.org/api_keys
const link = "https://api.openweathermap.org/data/2.5/air_pollution"; // API endpoint

// Get user location function
const getUserLocation = () => {
  // Check if geolocation is available
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(onPositionGathered, onPositionGatherError);
  } else {
    onPositionGatherError({ message: "Can't access your location. Please enter your coordinates manually." });
  }
};

// Successfully gathered position, now get air quality
const onPositionGathered = (pos) => {
  const lat = pos.coords.latitude.toFixed(4);
  const lon = pos.coords.longitude.toFixed(4);
  
  // Display user coordinates in the input fields
  latInp.value = lat;
  lonInp.value = lon;
  
  // Fetch air quality data
  getAirQuality(lat, lon);
};

// Fetch air quality data from API
const getAirQuality = async (lat, lon) => {
  try {
    const rawData = await fetch(`${link}?lat=${lat}&lon=${lon}&appid=${appId}`);
    const airData = await rawData.json();
    
    if (airData.cod && airData.cod !== 200) {
      throw new Error(airData.message || "Failed to fetch air quality data.");
    }

    // Update UI with air quality data
    setValuesOfAir(airData);
    setComponentsOfAir(airData);
  } catch (err) {
    onPositionGatherError({ message: err.message || "Something went wrong. Check your internet connection." });
  }
};

// Update air quality index and status
const setValuesOfAir = (airData) => {
  const aqi = airData.list[0].main.aqi;
  let airStat = "", color = "";

  // Set Air Quality Index
  airQuality.innerText = aqi;
  
  // Set status and color based on AQI
  switch (aqi) {
    case 1: 
      airStat = "Good";
      color = "rgb(19, 201, 28)";
      break;
    case 2: 
      airStat = "Fair";
      color = "rgb(15, 134, 25)";
      break;
    case 3: 
      airStat = "Moderate";
      color = "rgb(201, 204, 13)";
      break;
    case 4: 
      airStat = "Poor";
      color = "rgb(204, 83, 13)";
      break;
    case 5: 
      airStat = "Very Poor";
      color = "rgb(204, 13, 13)";
      break;
    default: 
      airStat = "Unknown";
      color = "rgb(128, 128, 128)"; // Grey for unknown status
  }

  // Update air quality status
  airQualityStat.innerText = airStat;
  airQualityStat.style.color = color;
};

// Update the components of air quality
const setComponentsOfAir = (airData) => {
  const components = airData.list[0].components;
  
  componentsEle.forEach(ele => {
    const compType = ele.getAttribute('data-comp');
    ele.innerText = components[compType] + " μg/m³"; // Show component value in micrograms per cubic meter
  });
};

// Handle errors (display error messages)
const onPositionGatherError = (e) => {
  errorLabel.innerText = e.message;
};

// Search button click event to fetch air quality data based on input coordinates
srchBtn.addEventListener("click", () => {
  const lat = parseFloat(latInp.value).toFixed(4);
  const lon = parseFloat(lonInp.value).toFixed(4);

  if (isNaN(lat) || isNaN(lon)) {
    onPositionGatherError({ message: "Invalid latitude or longitude." });
  } else {
    getAirQuality(lat, lon);
  }
});

// Get the user's location on page load
getUserLocation();
