import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import 'leaflet-routing-machine';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormsModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements AfterViewInit, OnDestroy {
  public page = {
    title: "AsinMap",
    urlAttribution: "http://www.openstreetmap.org/copyright",
    textAttribution: "OpenStreetMap",
    placeHolderInputCoordinate: "Coordenadas ...",
    alertErrorSearch: false,
    camionIcon: "icons/punto.png"
  }

  private truckIcon = L.icon({
    iconUrl: 'icons/camion.png', // Aquí sí va el texto con el path
    iconSize: [40, 40],         // Obligatorio para que se vea bien
    iconAnchor: [20, 40]        // El punto de la imagen que toca la coordenada
  });

  private destinationIcon = L.icon({
    iconUrl: 'icons/ubicacion.png', // Aquí sí va el texto con el path
    iconSize: [40, 40],         // Obligatorio para que se vea bien
    iconAnchor: [20, 40]        // El punto de la imagen que toca la coordenada
  });

  public originDestination = {
    placeHolderOrigin: "Origen ...",
    placeHolderDestination: "Destino ...",
    regularExpresion: /^-?\d+(\.\d+)?,\s?-?\d+(\.\d+)?$/,
    inputOrigin: "",
    alertErrorOrigin: false,
    inputDestination: "",
    alertErrorDestination: false,
  }

  public ubication = {
    inicialCoordinate: [4.6440635, -74.1218681],
    centralCoordinate: [4.6225848,-74.1502975] as number[],
    regularExpresion: /^-?\d+(\.\d+)?,\s?-?\d+(\.\d+)?$/,
    zoom: 19,
    title: "Plaza de nariño",
    text: "Plaza central",
    coordsNews: "",
    inputCoordinate: ""
  }

  private map: L.Map | undefined;
  private lastMarker: L.Marker | undefined;

  ngAfterViewInit() {
    this.map = L.map('map', { attributionControl: false }).setView([this.ubication.inicialCoordinate[0], this.ubication.inicialCoordinate[1]], this.ubication.zoom);

    if (this.map) {
      this.initializeMap(this.ubication.inicialCoordinate[0], this.ubication.inicialCoordinate[1]);
      //this.routeGenerate();

      this.map.on('click', this.onMapClick);
    }
  }

  ngOnDestroy() {
    this.removeMap();
  }

  // Elimina el ultimo marcador colocado
  public clearLastMarkers = () => {
    if (this.lastMarker && this.map) {
      this.map.removeLayer(this.lastMarker);
      this.ubication.inicialCoordinate = [];
    }
  }

  public foundCoords() {
    const inputValid = this.formatCoords(this.ubication.inputCoordinate);

    this.ubication.centralCoordinate = inputValid[0];
    if (inputValid[1]) {
      this.centerMap(this.ubication.centralCoordinate[0], this.ubication.centralCoordinate[1]);
      this.setAMarker(this.ubication.centralCoordinate[0], this.ubication.centralCoordinate[1]);
      this.page.alertErrorSearch = !inputValid[1];

    } else {
      this.page.alertErrorSearch = !inputValid[1];

    }
  }

  public foundRoute() {
    const inputValidOrigin = this.formatCoords(this.originDestination.inputOrigin);
    const inputValidDestination = this.formatCoords(this.originDestination.inputDestination);

    if (inputValidOrigin[1] && inputValidDestination[1]) {
      this.routeGenerate(inputValidOrigin[0], inputValidDestination[0]);
      this.centerMap(inputValidOrigin[0][0], inputValidOrigin[0][1]);
      this.originDestination.alertErrorOrigin = !inputValidOrigin[1];
      this.originDestination.alertErrorDestination = !inputValidOrigin[1];

    } else {
      this.originDestination.alertErrorOrigin = !inputValidOrigin[1];
      this.originDestination.alertErrorDestination = !inputValidOrigin[1];

    }
  }

  public deleteSearch() {
    this.ubication.inputCoordinate = "";
    this.page.alertErrorSearch = false;
  }

  public routeGenerate(origin: number[], destination: number[]) {
    const origen = L.latLng(origin[0], origin[1]);
    const destino = L.latLng(destination[0], destination[1]);
    const container = document.getElementById('directions-container');

    (L as any).Routing.control({
      waypoints: [origen, destino],
      language: 'es',
      createMarker: (i: number, waypoint: any, n: number) => {
        // Para el punto de origen
        if (i === 0) {
          return L.marker(waypoint.latLng, { icon: this.truckIcon });
        }
        // Para el destino o puntos intermedios
        return L.marker(waypoint.latLng, { icon: this.destinationIcon });
      },
      container: container,
      show: true,
      itinerary: {
        collapsible: false // Mantenerlo abierto siempre ya que está afuera
      },
      lineOptions: {
        styles: [{ color: 'blue', weight: 4 }]
      },
      routeWhileDragging: true,
      addWaypoints: false,
      collapsible: true,
    }).addTo(this.map);
  }

  // Evento que detecta las coordenadas sobre el lugar en donde se dio click en el mapa
  private onMapClick = (e: any) => {
    const { lat, lng } = e.latlng;
    this.setAMarker(lat, lng);
  }

  // Pone un manrcador sobre el mapa cuando el usuario da click izquierdo
  private setAMarker(lat: number, lng: number) {
    if (this.map) {
      this.clearLastMarkers();

      this.lastMarker = L.marker([lat, lng], { icon: this.customIcon })
        .addTo(this.map)
        .bindPopup(this.ubication.title);
    }
  }

  private initializeMap = (lat: number, lng: number) => {
    if (this.map) {
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: ''
      }).addTo(this.map);
    }
  }

  private removeMap() {
    if (this.map) {
      this.map.remove();
    }
  }

  private centerMap(lat: number, lng: number, zoom: number = this.ubication.zoom) {
    if (this.map) {
      this.map.setView([lat, lng], zoom);
    }
  }

  private customIcon = L.icon({
    iconUrl: this.page.camionIcon, // Ruta a tu imagen en la carpeta assets
    shadowUrl: '', // Opcional: sombra del marcador

    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  private formatCoords(coords: string): [number[], boolean] {
    if (coords && this.ubication.regularExpresion.test(coords)) {
      return [coords.split(",").map(c => parseFloat(c.trim())), true]

    } else {
      return [[], false];
    }
  }
}
