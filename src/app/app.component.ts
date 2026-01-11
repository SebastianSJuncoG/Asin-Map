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
    alertError: false
  }

  public origenDestino = {
    placeHolderOrigin: "Origen ...",
    placeHolderDestination: "Destino ..."
  }

  public ubication = {
    inicialCoordinate: [4.6440635, -74.1218681],
    centralCoordinate: [4.6225848,-74.1502975] as number[],
    regularExpresion: /^-?\d+(\.\d+)?,\s?-?\d+(\.\d+)?$/,
    zoom: 19,
    title: "Plaza de nariño",
    text: "Plaza central",
    coordsNews: "",
    inputCoordinate: "",
    inputOrigin: "",
    inputDestination: ""
  }

  private map: L.Map | undefined;
  private lastMarker: L.Marker | undefined;

  ngAfterViewInit() {
    this.map = L.map('map', { attributionControl: false }).setView([this.ubication.inicialCoordinate[0], this.ubication.inicialCoordinate[1]], this.ubication.zoom);

    if (this.map) {
      this.initializeMap(this.ubication.inicialCoordinate[0], this.ubication.inicialCoordinate[1]);
      this.generarRuta();

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
    this.ubication.centralCoordinate = this.formatCoords(this.ubication.inputCoordinate);
    if (this.ubication.centralCoordinate.length > 0) {
      this.page.alertError = false;
      this.centerMap(this.ubication.centralCoordinate[0], this.ubication.centralCoordinate[1]);
      this.setAMarker(this.ubication.centralCoordinate[0], this.ubication.centralCoordinate[1]);

    } else {
      this.page.alertError = true;

    }
  }

  public deleteSearch() {
    this.ubication.inputCoordinate = "";
    this.page.alertError = false;
  }

  public generarRuta() {
    const origen = L.latLng(4.644, -74.121);
    const destino = L.latLng(this.ubication.centralCoordinate[0], this.ubication.centralCoordinate[1]);

    (L as any).Routing.control({
      waypoints: [origen, destino],
      lineOptions: {
        styles: [{ color: 'blue', weight: 4 }]
      },
      routeWhileDragging: true,
      addWaypoints: false
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
    iconUrl: 'icons/camion.png', // Ruta a tu imagen en la carpeta assets
    shadowUrl: '', // Opcional: sombra del marcador

    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  private formatCoords(coords: string): number[] {
    if (this.ubication.inputCoordinate && this.ubication.regularExpresion.test(this.ubication.inputCoordinate)) {
      return this.ubication.inputCoordinate.split(",").map(c => parseFloat(c.trim()))

    } else {
      return [];
    }
  }
}
