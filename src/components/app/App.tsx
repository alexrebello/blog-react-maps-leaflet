import "leaflet/dist/leaflet.css";
import "react-datepicker/dist/react-datepicker.css";


import React, { FormEvent, useState } from "react";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import Leaflet from "leaflet";
import { v4 as uuidv4 } from "uuid";

import { fetchLocalMapBox } from "../ui/apiMapBox";
import AsyncSelect from "react-select/async";

import mapPackage from "./imagens/package.svg";
import mapPin from "./imagens/pin.svg";

import DatePicker from "react-datepicker";

import "./style/App.css";
import CustomPopup from "./CustomPopup";

const initialPosition = { lat: -23.5407048, lng: -46.645248 };

const mapPackageIcon = Leaflet.icon({
  iconUrl: mapPackage,
  iconSize: [58, 68],
  iconAnchor: [29, 68],
  popupAnchor: [170, 2],
});

const mapPinIcon = Leaflet.icon({
  iconUrl: mapPin,
  iconSize: [58, 68],
  iconAnchor: [29, 68],
  popupAnchor: [170, 2],
});

interface Delivery {
  id: string;
  name: string;
  address: string;
  complement: string;
  date: string | null;
  latitude: number;
  longitude: number;
}

type Position = {
  longitude: number;
  latitude: number;
};

function App() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [position, setPosition] = useState<Position | null>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [id, setId] = useState('');
  const [name, setName] = useState("");
  const [complement, setComplement] = useState("");
  const [address, setAddress] = useState<{
    label: string;
    value: string;
  } | null>(null);
  const [inputDate, setDate] = useState<Date | null >(null);
  const [location, setLocation] = useState(initialPosition);

  const loadOptions = (inputValue: any, callback: any) => {
    const handleAsync = async() => {
      const response = await fetchLocalMapBox(inputValue);
      let places: any = [];
      if (inputValue.length < 5) return;
      response.features.map((item: any) => {
        return places.push({
          label: item.place_name,
          value: item.place_name,
          hours: item.hours,
          coords: item.center,
          place: item.place_name,
        });
      });
      callback(places);  
    }
    handleAsync();
  };

  const handleChangeSelect = (event: any) => {
    setPosition({
      longitude: event.coords[0],
      latitude: event.coords[1],
    });
    setAddress({ label: event.place, value: event.place });
    setLocation({
      lng: event.coords[0],
      lat: event.coords[1],
    });
  };

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    //if (!address || !name || !inputDate ) return;
    if (!address) { 
      alert('Insira o Endereço')
      return
      } else if (!name) { 
        alert('Insira o Nome')
        return
      } else if (!inputDate) {
        alert('Insira Data de Entrega')
        return
      }

    let temporaryDeliverieses: Delivery[] = [...deliveries,];
    const date: string = inputDate.toISOString();

    let delivery: Delivery = 
      {
        id: uuidv4(),
        name,
        address: address?.value || "",
        complement,
        date, 
        latitude: location.lat,
        longitude: location.lng,
      };

    if(isEditing) {
      temporaryDeliverieses = makeChange(temporaryDeliverieses, delivery)
    }

    setDeliveries([...temporaryDeliverieses,delivery,]);

    setId('');
    setName("");
    setAddress(null);
    setComplement("");
    setDate(null);
    setPosition(null);
    setIsEditing(false);
  }

  function makeChange(temporaryDeliverieses: Delivery[], delivery: Delivery) {
    temporaryDeliverieses = temporaryDeliverieses.map(it => {
      if (it.id === id) {
        it.id = id;
        it.name = delivery.name;
        it.address = delivery.address;
        it.complement = delivery.complement;
        it.date = delivery.date;
        it.latitude = delivery.latitude;
        it.longitude = delivery.longitude;
      }
      return it;
    });
    return temporaryDeliverieses;
  }

  async function handleFormReset(event: FormEvent) {
    event.preventDefault();

    setName("");
    setAddress(null);
    setComplement("");
    setDate(null);
    setPosition(null);
    setIsEditing(false)
  }

  async function modifierDelivery(event: any) {
    event.preventDefault();
    setIsEditing(true)
    let found: Delivery | any = deliveries.find(it => it.id === event.target.value);

    if (found.id) {
      setId(found.id);
      console.log(found.id)
      setName(found.name);
      console.log(found.name)
      //setAddress(found.address.value);
      //console.log(found.address)
      setComplement(found.complement);
      console.log(found.complement)
      //setDate(found.date);
      //console.log(found.date);
    }
  }

  async function deletarDelivery(event: any) {
    setDeliveries([
      ...deliveries.filter(it => it.id !== event.target.value)
    ]);
  }

  return (
    <div id="page-map">
      <main>
        <form onSubmit={handleSubmit} onReset={handleFormReset} className="landing-page-form">
          <fieldset>
            <legend>Entregas</legend>

            <div className="input-block">
              <label htmlFor="name">Nome</label>
              <input
                id="name"
                placeholder="Digite seu nome"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>

            <div className="input-block">
              <label htmlFor="address">Endereço</label>
              <AsyncSelect
                placeholder="Digite seu endereço..."
                classNamePrefix="filter"
                cacheOptions
                loadOptions={loadOptions}
                onChange={handleChangeSelect}
                value={address}
              />
            </div>

            <div className="input-block">
              <label htmlFor="complement">Complemento</label>
              <input
                placeholder="Apto / Nr / Casa..."
                id="complement"
                value={complement}
                onChange={(event) => setComplement(event.target.value)}
              />
            </div>

            <div className="input-block">
              <label htmlFor="dateDelivery">Data De Entrega</label>
              <DatePicker 
                selected={ inputDate === null ? new Date() : new Date(inputDate)}
                onChange={(event: any)=> setDate(new Date( event.toISOString()))}
                dateFormat={"dd-MM-yyyy"}
              />
              
            </div>
          </fieldset>

          <button className="confirm-button" type="submit">{isEditing ? "Confirmar Alteração" : "Confirmar"}</button>
          <button className="confirm-reset" type="reset">{isEditing ? "Cancelar Alteração" : "Limpar"}</button>
           
          
        </form>
      </main>

      <MapContainer
        center={location}
        zoom={15}
        style={{ width: "100%", height: "100%" }}
      >
        {/* <TileLayer url="https://a.tile.openstreetmap.org/{z}/{x}/{y}.png" /> */}
        <TileLayer
          url={`https://api.mapbox.com/styles/v1/mapbox/light-v10/tiles/256/{z}/{x}/{y}@2x?access_token=${process.env.REACT_APP_ACCESS_TOKEN_MAP_BOX}`}
        />

        {position && (
          <Marker
            icon={mapPinIcon}
            position={[position.latitude, position.longitude]}
          ></Marker>
        )}

        {deliveries.map((delivery) => (
          <Marker
            key={delivery.id}
            icon={mapPackageIcon}
            position={[delivery.latitude, delivery.longitude]}
          >
            <CustomPopup
              delivery={delivery}
              modifierDelivery={modifierDelivery}
              deletarDelivery={deletarDelivery}
            />
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default App;
