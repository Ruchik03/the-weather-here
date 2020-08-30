/**
 * This is the API for the application. It get the location from the user
 * and sends it to three different API's to get the information about the
 * weather, air quality and the city name of the current location. It saves
 * all that data to a database and sends it on the client-side code to plot
 * these locations on a map.
 *
 * @author: Ruchik Chaudhari
 * Date: 08/24/2020
 **/

//import the necessary tools
const express = require("express");
const Datastore = require("nedb");
const fetch = require("node-fetch");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

//make the app listen to a port
app.listen(port, () => {
  console.log(`Starting server at ${port}`);
});

//display the files in the public folder
app.use(express.static("public"));
app.use(express.json({ limit: "1mb" }));
const database = new Datastore("database1.db");

database.loadDatabase();

//set the route to send the data from the database
app.get("/api", (request, response) => {
  database.find({}, (err, data) => {
    if (err) {
      response.end();

      return;
    }
    //convert the data to JSON
    response.json(data);
  });
});

//set the route for the data to be posted
app.post("/api", (request, response) => {
  const data = request.body;

  //get the current time
  var usaTime = new Date().toLocaleString("en-US", {
    timeZone: "America/Los_Angeles",
  });

  //add the time to the data object representing information of the user
  data.timestamp = usaTime + "[US PST]";
  database.insert(data);
  response.json(data);
});

//set the route to send the data
app.get("/weather/:latlon", async (request, response) => {
  //get the lat & lon from the request body
  console.log(request.params);
  const latlon = request.params.latlon.split(",");
  console.log(latlon);
  const lat = latlon[0];
  const lon = latlon[1];
  console.log(lat, lon);

  //get the weather data from the openweather map API
  const api_key = process.env.API_KEY;
  const weather_url = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${api_key}`;
  const weather_response = await fetch(weather_url);
  const weather_data = await weather_response.json();

  //get the city name from the lat & lon from the bigdata API
  const bigdata_url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
  const bigdata_response = await fetch(bigdata_url);
  const bigdata_data = await bigdata_response.json();
  const city = bigdata_data.locality + ", " + bigdata_data.principalSubdivision;

  //get the air quality data from the openAQ API
  const aq_url = `https://api.openaq.org/v1/latest?coordinates=${lat},${lon}`;
  const aq_response = await fetch(aq_url);
  const aq_data = await aq_response.json();

  //make an object with all the data recieved
  const data = {
    weather: weather_data,

    air_quality: aq_data,

    city: city,
  };
  //send it back to client
  response.json(data);
});
