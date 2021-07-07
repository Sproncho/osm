import "./SearchResult.css"
import {usedState} from "react"
import { useState } from "react";
import data from "../../data.json";
export default function SearchResult({city,resultClick}) {
  let highlighted = data.cities.find(c => {
    let isLat = (parseFloat(c.lat).toFixed(0) === parseFloat(city.geometry.coordinates[1]).toFixed(0))
    let isLon = (parseFloat(c.lon).toFixed(0) === parseFloat(city.geometry.coordinates[0]).toFixed(0)) 
    return isLat && isLon
  })
  console.log(city);
  return (
    <div className={`SearchResult ${highlighted?"highlited":""}`} onClick={()=>{resultClick(city)}}>
      <p className="name">{city.properties.display_name}</p>
      <p><b>latitude</b>:{city.geometry.coordinates[1]}</p>
      <p><b>longitude</b>:{city.geometry.coordinates[0]}</p>
    </div>
  );
}
