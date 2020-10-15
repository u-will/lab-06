'use strict';

require('dotenv').config();

const pg = require('pg')
const cors = require('cors');
const superagent = require('superagent');
const express = require('express');
const app = express();
const PORT = process.env.PORT;
const locations = {};
const weathers = {};
const trails = {};
const client = new pg.Client(process.env.DATABASE_URL);
app.use(cors());


// creating of Routes
app.get('/', (req, res) => { res.send('Will\'s house'); });
app.get('/location', handleLocation);
app.get('/weather', heandleWeather);
app.get('/trails', heandleTrail);

// global error

app.get('*', returnErroe);


function returnErroe(req, res) {
  res.status(500).send('Sorry, something went wrong');
}


// constructor

function Location(city, geoData) {
  this.serch_query = city;
  this.formatted_query = geoData.display_name;
  this.latitude = geoData.lat;
  this.longitude = geoData.lon;
}

function Weather(day) {
  this.forecast = day.weather.description;
  this.hour = day.valid_date;
}

function Trail(obj) {
  let conditionDates = obj.conditionDate.split(' ');
  this.trail_url = obj.url;
  this.name = obj.name;
  this.location = obj.location;
  this.length = obj.length;
  this.condition_date = conditionDates[0];
  this.condition_time = conditionDates[1];
  this.conditions = obj.conditionStatus;
  this.stars = obj.stars;
  this.star_votes = obj.starVotes;
  this.summary = obj.summary;
}

// Routes's methods

function handleLocation(request, response) {
  try {
    const GEOCODE_API_KEY = process.env.GEOCODE_API_KEY;
    const city = request.query.city;
    const url = `https://us1.locationiq.com/v1/search.php?key=${GEOCODE_API_KEY}&q=${city}&format=json&limit=1`;
    superagent.get(url)
      .then(data => {
        const geoData = data.body[0];
        const locationData = new Location(city, geoData);
        locations[city] = locationData;
        response.json(locationData);
      })
      .catch(err => console.error('retuern', err));
  } catch (error) {
    response.status(500).send('Oops you enter the wromg localhost');
  }
}


function heandleWeather(req, res) {

  const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
  const lon = req.query.longitude;
  const lat = req.query.latitude;
  const url = `https://api.weatherbit.io/v2.0/forecast/daily?lat=${lat}&lon=${lon}&key=${WEATHER_API_KEY}&format=json`;
  superagent.get(url)
    .then(data => {
      let temp = data.body.data.map(element => new Weather(element));
      res.json(temp);
    })
    .catch(err => console.error('retuern', err));
  // .catch(()=> {
  //   returnErroe(req, res)
  // });
}

function heandleTrail(req, res) {
  const key = process.env.TRAIL_API_KEY;
  const lon = req.query.longitude;
  const lat = req.query.latitude;
  const url = `https://www.hikingproject.com/data/get-trails?lat=${lat}&lon=${lon}&maxDistance=10&key=${key}`;
  superagent.get(url)
    .then(data => {
      let trail = data.body.trails.map(object => new Trail(object));
      res.json(trail);
    })
    .catch(err => console.error('retuern', err));
  // .catch(() => {
  //   returnErroe(req, res);
  // });
}


// listener of the post

app.listen(PORT, () => {
  console.log(`sever up ${PORT}`);
});
