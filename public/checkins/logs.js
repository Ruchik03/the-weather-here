/**
 * All the data from the database is retrived and
 * and loction of all the users' who checked-in
 * so far get's plotted on the map with the weather and
 * air quality data
 *
 * @author: Ruchik Chaudhari
 * Date: 08/25/2020
 **/

//set the map data according to the information given by leaflet
const mymap = L.map("checkinMap").setView([37.77, -122.42], 2);
const attribution =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
//const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const tileUrl = "https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png";
const tiles = L.tileLayer(tileUrl, { attribution });
tiles.addTo(mymap);

getData();

//get the data from the database and map it
async function getData() {
  const response = await fetch("/api");
  const data = await response.json();

  for (item of data) {
    //create the marker with the given information and add it the map
    const marker = L.marker([item.lat, item.lon]).addTo(mymap);

    //text for the pop-up
    let txt = `checkedin @ (${item.timestamp} ) The weather here at ${item.city} is ${item.weather.weather[0].description} with
    a temperature of ${item.weather.main.temp}&deg; F.`;

    if (item.air.value < 0) {
      txt +=
        "  No air quality reading provided by OpenAQ API at this location.";
    } else {
      txt += `  The concentration of particulate matter 
    (${item.air.parameter}) is ${item.air.value} 
    ${item.air.unit} last read on ${formatDate(item.air.lastUpdated)}`;
    }
    marker.bindPopup(txt);
  }
  console.log(data);
}

function formatDate(date) {
  let year = date.slice(0, 4);
  let month = date.slice(5, 7);
  let day = date.slice(8, 10);
  return month + "/" + day + "/" + year;
}
