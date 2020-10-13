'use strict';

require('dotenv').config();

const cors = require('cors');

const express = require('express');
const app = express();
const PORT = process.env.PORT ;

app.use(cors());

app.get('/', (req, res) => {
  res.send('Will\'s house');
});


app.get('/location', handleLocation);

function Location(city, geoData) {
  this.serch_query = city;
  this.formatted_query = geoData[0].display_name;
  this.latitude = geoData[0].lat;
  this.longitude = geoData[0].lon;
}
function handleLocation(request, response) {
  try {
    const geoData = require('./data/location.json');
    const city = request.query.city;
    const locationData = new Location(city, geoData);
    response.json(locationData);
  } catch (error) {
    response.status(500).send('Oops you enter the wromg localhost');
  }
}



app.get('/weather', heandleWeather);


function heandleWeather(req, res) {
  try {
    const jsonData = require('./data/weather.json');
    const temp = [];
    jsonData.data.forEach(element => {
      let weather = new Weather(element);
      temp.push(weather);
    });
    res.json(temp);
  } catch (error) {
    res.status(500).send('Oops you enter the wrong..');
  }
}

function Weather(day) {
  this.forecast = day.weather.description;
  this.time = day.temp;
}




app.get('*', (req, res) => {
  res.status(404).send('Oops');
})


app.listen(PORT, () => {
  console.log(`sever up ${PORT}`);
});
