DROP TABLE IF EXISTS locations;

CREATE TABLE locations (
    id SERIAL PRIMARY KEY,
    search_query VARCHAR(255),
    formatted_query VARCHAR(255),
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7)
  );


DROP TABLE IF EXISTS weathers;

CREATE TABLE weathers(
  id SERIAL PRIMARY KEY,
  forecast VARCHAR(255),
  time NUMERIC(10, 7)
);

DROP TABLE IF EXISTS trails;

CREATE TABLE trails(
  id SERIAL PRIMARY KEY,
  trail_url VARCHAR(255),
  name VARCHAR(255),
  location NUMERIC(10, 7),
  length NUMERIC(10, 7),
  condition_date VARCHAR(255),   
  condition_time VARCHAR(255),   
  conditions VARCHAR(255),   
  star VARCHAR(255),   
  star_votes VARCHAR(255),   
  summar VARCHAR(255)  
);
