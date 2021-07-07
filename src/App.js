import "./App.css";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  GeoJSON,
  useMapEvent,
} from "react-leaflet";
import { useState, useEffect } from "react";
import { connect } from "react-redux";
import data from "./data.json";
import airportsData from "./airports.json";
import * as Actions from "./redux/AppStateReducer/ActionCreators";
import airportIcon from "./assets/airport";
import L from "leaflet";
import SearchResult from "./components/SearchResult/SearchResult";
import AutoComplete from "./components/AutoComplete/AutoComplete";

function App({ loading, setLoading }) {
  const [map, setMap] = useState(null);
  const [citiesActive, setCitiesActive] = useState(false);
  const [airportsActive, setAirportsActive] = useState(false);
  const [json, setJson] = useState(null);
  const [cityName, setCityName] = useState("");
  const [dataBaseCity, setDataBaseCity] = useState("");
  
  const [options, setOptions] = useState();
  const [optionsFromDatabase, setOptionsFromDatabase] = useState();
  const [searchMarker, setSearchMarker] = useState(null);
  const [databaseMarker,setDatabaseMarker] = useState(null);
  console.log(data);

  const airports = airportsData.filter((airport) => {
    if (data.cities.find((city) => airport.city === city.city)) {
      return true;
    } else {
      return false;
    }
  });

  const findCities = async (cityName) => {
    const url = `https://nominatim.openstreetmap.org/search?city=${cityName}&format=geojson&accept-language=en
    `;
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        setJson(data.features);
        console.log(data.features[0].properties);
      });
  };
  const findAutocomplete = async (cityName) => {
    const url = `https://photon.komoot.io/api/?q=${cityName}&osm_tag=place:city`;
    const response = await fetch(url);
    let data = (await response.json()).features;
    console.log(data);
    // data = data.map((feature) => feature.properties.name);
    // console.log(data);
    // setAutoCompleteData(data);
    return data;
  };

  const resultClick = (city) => {
    setSearchMarker({
      coordinates: {
        lat: city.geometry.coordinates[1],
        lng: city.geometry.coordinates[0],
      },
      name: city.properties.display_name,
    });
    if (map) {
      map.flyTo({
        lat: city.geometry.coordinates[1],
        lng: city.geometry.coordinates[0],
      });
    }
  };


  const onChangeHandler = async (text) => {
    setCityName(text);
    let matches = [];
    if (text.length > 0) {
      const result = await findAutocomplete(text);
      // console.log(data);
      matches = result.map((feature) => feature.properties.name);
      matches = matches.filter((a, b) => matches.indexOf(a) === b);
    }
    console.log("matches", matches);
    setOptions(matches);
   
  };
  const databaseCityChangeHandler = (text) =>{
    setDataBaseCity(text);
    let matches = [];
    if(text.length > 0){
      matches = data.cities.map((feature,i) => {return {...feature,text:`${feature.city}, ${feature.country}`}});
      matches = matches.filter(feature => feature.city.includes(text))
      matches = matches.sort((a, b) =>{
        if(a.city.startsWith(text)){
          return -1;
        }
        if(b.city.startsWith(text)){
          return 1;
        }
        return 0;
      })
      matches = matches.slice(0, 15);
    }
    setOptionsFromDatabase(matches);
  }

  const liOnclickHandler=(option)=>{
    setDatabaseMarker({
      coordinates:{
        lat:option.lat, 
        lng:option.lon
      },
      name:option.city
    })
    if (map) {
      map.flyTo({
        lat:option.lat,
        lng: option.lon,
      });
    }
  }
  return (
    <div className="App">
      <div className="searchBox">
      <div className="openStreetAutocomplete">
          <AutoComplete
            onChange={(e) => {
              onChangeHandler(e.target.value);
            }}
            placeholder="search cities from OSM"
            value = {cityName}
            setValue={setCityName}
            options = {options}
            setOptions={setOptions}
          />
          <button
            className="searchBtn"
            onClick={() => {
              findCities(cityName);
            }}
          >
            search
          </button>
      </div>
        <AutoComplete
          onChange={(e) => {
            databaseCityChangeHandler(e.target.value);
          }}
          placeholder="search city from database"
          value = {dataBaseCity}
          setValue={setDataBaseCity}
          options = {optionsFromDatabase}
          customOptions
          setOptions={setOptionsFromDatabase}
          liOnClick={liOnclickHandler}
        />
      </div>
      <div className="main">
        <div className="results">
          {json &&
            json.map((city) => (
              <SearchResult
                key={city.properties.display_name}
                city={city}
                resultClick={resultClick}
              />
            ))}
        </div>
        <MapContainer
          center={{ lat: 51.505, lng: -0.09 }}
          zoom={10}
          scrollWheelZoom={true}
          whenCreated={(map) => setMap(map)}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {citiesActive &&
            data.cities.map((city) => (
              <Marker position={{ lat: city.lat, lng: city.lon }}>
                <Popup>{city.city}</Popup>
              </Marker>
            ))}
          {airportsActive &&
            airports.map((airport) => (
              <Marker
                icon={airportIcon}
                position={{
                  lat: airport._geoloc.lat,
                  lng: airport._geoloc.lng,
                }}
              ></Marker>
            ))}
          {searchMarker && (
            <Marker position={searchMarker.coordinates}>
              <Popup>{searchMarker.name}</Popup>
            </Marker>
          )}
          {databaseMarker && (
            <Marker position={databaseMarker.coordinates}>
              <Popup>{databaseMarker.name}</Popup>
            </Marker>
          )}

        </MapContainer>
        <div className="temp">
          <div className="checkBoxes">
            show cities:
            <input
              type="checkbox"
              checked={citiesActive}
              onChange={() => setCitiesActive(!citiesActive)}
            />
            show airports:
            <input
              type="checkbox"
              checked={airportsActive}
              onChange={() => setAirportsActive(!airportsActive)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
const mapStateToProps = (state) => {
  return {
    loading: state.appState.loading,
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    setLoading: (state) => dispatch(Actions.setLoading(state)),
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(App);
