'use strict';

require('dotenv').config();

const pg = require('pg')
const cors = require('cors');
const superagent = require('superagent');
const express = require('express');
const app = express();
const PORT = process.env.PORT;
const client = new pg.Client(process.env.DATABASE_URL);
app.use(cors());


// creating of Routes
app.get('/', (req, res) => { res.send('Will\'s house'); });
app.get('/location', handleLocation);
app.get('/weather', heandleWeather);
app.get('/trails', heandleTrail);
app.get('/movies', heandleMovies);
app.get('/yelp', heandleYelp);

// global error

app.get('*', returnErroe);


function returnErroe(req, res) {
  res.status(500).send('Sorry, something went wrong');
}


// constructor

function Location(city, geoData) {
  this.search_query = city;
  this.formatted_query = geoData.display_name;
  this.latitude = geoData.lat;
  this.longitude = geoData.lon;
}

function Weather(day) {
  this.forecast = day.weather.description;
  this.time = day.valid_date;
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

function Movie(obj) {
  this.title = obj.title;
  this.ovewview = obj.ovewview;
  this.average_votes = obj.average_votes;
  this.total_votes = obj.total_votes;
  this.image_url = obj.image_url;
  this.popularity = obj.popularity;
  this.released_on = obj.released_on;
}

function Yelp(obj) {
  this.name = obj.name;
  this.image_url = obj.image_url;
  this.price = obj.price;
  this.rating = obj.rating;
  this.url = obj.url;

}





// Routes's functions

function handleLocation(request, response) {
  const GEOCODE_API_KEY = process.env.GEOCODE_API_KEY;
  const city = request.query.search_query;
  const url = `https://us1.locationiq.com/v1/search.php?key=${GEOCODE_API_KEY}&q=${city}&format=json&limit=1`;
  let search_query = [request.query.city];
  let SQL = `SELECT * FROM locations WHERE search_query=$1;`;
  client.query(SQL, search_query)
    .then(result => {
      console.log(result);
      if (result.rows.length > 0) {
        response.status(200).send(result.rows[0]);
      } else {
        superagent(url)
          .then(data => {
            const geoData = data.body[0];
            const locationData = new Location(city, geoData);
            let SQL = 'INSERT INTO locations (search_query, formatted_query, latitude, longitude) VALUES ($1, $2, $3, $4);';
            let valSave = [locationData.search_query, locationData.formatted_query, locationData.latitude, locationData.longitude];
            client.query(SQL, valSave)
              .then(() => {
                response.send(locationData);
              })
          })
          .catch(err => { console.error('return', err) });
      }
    })
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



function heandleMovies(req, res) {
  let city = req.query.search_query;
  const MOVIE_API_KEY = process.env.MOVIE_API_KEY;
  const url = `https://api.themoviedb.org/3/search/movie?api_key=${MOVIE_API_KEY}&query=${city}`
  superagent.get(url)
    .then(data => {
      let bodyData = data.body.results;
      let movies = bodyData.map(obj => new Movie(obj))
      res.status(200).send(movies);
    })
    .catch(err => { console.error('return', err) });
}

function heandleYelp(req, res) {
  const curentPage = req.query.page;
  const lon = req.query.longitude;
  const lat = req.query.latitude;
  const YELP_API_KEY = process.env.YELP_API_KEY;
  const url = `https://api.yelp.com/v3/businesses/search?latitude=${lat}&longitude=${lon}`;
  superagent(url)
    .set('Authorization', `Bearer ${YELP_API_KEY}`)
    .then(data => {
      const yelpData = data.body;
      let yelp = yelpData.businesses.map(obj => new Yelp(obj));
      let startingPosition = 5 * (curentPage -1);
      let showYelp = yelp.splice(startingPosition, 5);
      res.status(200).send(showYelp);
    })
    .catch(err => { console.error('return', err) });
}

// listener of the post
client.connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`sever up ${PORT}`);
    });
  })
