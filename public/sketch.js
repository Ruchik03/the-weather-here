/**
 * The location of the user is received in (lat & lon) and
 * the data is sent to the server. The server responds
 * with the necessary data and the data is shown to the user
 *
 * @author: Ruchik Chaudhari
 * Date: 08/24/2020
 **/

let lat, lon;

//check if the browser supports geolocation or not
if ("geolocation" in navigator) {
  console.log("geolocation available");
  //get the location of the user
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      let lat, lon, weather, air, city;
      try {
        //get the co-ordinates
        lat = position.coords.latitude;
        lon = position.coords.longitude;
        console.log(lat, lon);

        //send a request to server to get the data for the given lat & lon
        const api_url = `weather/${lat},${lon}`;
        const response = await fetch(api_url);

        const json = await response.json();

        //View the data to the client
        city = json.city;

        //add the city, lat and lon to the respective element
        document.getElementById("city").textContent = city;
        document.getElementById("latitude").textContent = lat.toFixed(2);
        document.getElementById("longitude").textContent = lon.toFixed(2);

        //add the weather data
        weather = json.weather.list[0];
        document.getElementById("summary").textContent =
          weather.weather[0].description;
        document.getElementById("temp").textContent = weather.main.temp;

        //add the air quality data
        air = json.air_quality.results[0].measurements[0];
        document.getElementById("aq_parameter").textContent = air.parameter;
        document.getElementById("aq_value").textContent = air.value;
        document.getElementById("aq_units").textContent = air.unit;
        let date = formatDate(air.lastUpdated);

        document.getElementById("aq_date").textContent = date;
      } catch (error) {
        console.error(error);
        air = { value: -1 };
        document.getElementById("air_check").textContent =
          "At this point, no data for air quality has been provided by OpenAQ.org at your location.";
      }

      //post the data to the database
      const data = { lat, lon, city, weather, air };
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      };
      const db_response = await fetch("/api", options);
      const db_json = await db_response.json();
      console.log(db_json);
    },
    //if the user denies the permission then give an alert
    function (error) {
      if (error.code == error.PERMISSION_DENIED)
        alert(
          "The app cannot provide you the data, as the access to track your location was denied"
        );
    }
  );
} else {
  alert("geolocation is not supported by your browser");
}

function formatDate(date) {
  let year = date.slice(0, 4);
  let month = date.slice(5, 7);
  let day = date.slice(8, 10);
  return month + "/" + day + "/" + year;
}
