import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
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

  public ubication = {
    inicialCoordinate: [4.6440635, -74.1218681],
    centralCoordinate: null,
    regularExpresion: /^-?\d+(\.\d+)?,\s?-?\d+(\.\d+)?$/,
    zoom: 16,
    title: "Plaza de nariño",
    text: "Plaza central",
    coordsNews: "",
    inputCoordinate: "",
  }

  private map: L.Map | undefined;
  private lastMarker: L.Marker | undefined;

  ngAfterViewInit() {
    this.map = L.map('map').setView([this.ubication.inicialCoordinate[0], this.ubication.inicialCoordinate[1]], this.ubication.zoom);

    if (this.map) {
      this.initializeMap(this.ubication.inicialCoordinate[0], this.ubication.inicialCoordinate[1]);

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
    }
  }

  public formatCoords() {
    console.log(this.ubication.centralCoordinate);
    if(this.ubication.centralCoordinate && this.ubication.regularExpresion.test(this.ubication.centralCoordinate)){
      console.log("Valido");
      this.page.alertError = false;
    }else{
      console.log("invalido");
      this.page.alertError = true;
    }
    //console.log(coordenate.value);
    // if (this.ubication.centralCoordinate) {
    //   const newCoordenate = this.ubication.centralCoordinate.toString().replace(/\s+/g, '');
    //   const coordenateArray = newCoordenate.split(",");
    //   // this.ubication.centralCoordinate = [coordenateArray[0], coordenateArray[1]];
    //   // console.log(`Latitud: ${this.ubication.centralCoordinate[0]} - Longitud: ${this.ubication.centralCoordinate[1]}`);

    //   this.recentrarMapa(this.ubication.inicialCoordinate[0], this.ubication.inicialCoordinate[1]);

    //   console.log(this.ubication.centralCoordinate);

    // }
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

      this.lastMarker = L.marker([lat, lng])
        .addTo(this.map)
        .bindPopup(this.ubication.title);
    }
  }

  private initializeMap = (lat: number, lng: number) => {
    if (this.map) {
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: `&copy; <a href="${lat}">${lng}</a>`
      }).addTo(this.map);
    }
  }

  private removeMap() {
    if (this.map) {
      this.map.remove();
    }
  }

  private centerMap(lat: number, lng: number) {
    if (this.map) {
      console.log(`Latitud: ${lat} - Longitud: ${lng}`);
      this.map.setView([lat, lng], 13);
    }
  }
}
