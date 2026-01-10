import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import * as L from 'leaflet';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements AfterViewInit, OnDestroy {
  public page = {
    title: "AsinMap",
    zoom: 16,
    urlAttribution: "http://www.openstreetmap.org/copyright",
    textAttribution: "OpenStreetMap",

  }

  private ubication = {
    title: "Plaza de nariño",
    text: "Interser",
    centralCoordinate: [1.2147162, -77.2808453],
    markedPoint: [1.2147162, -77.2808453],
    latitude: 0,
    Length: 0
  }

  private map: L.Map | undefined;
  private lastMarker: L.Marker | undefined;

  ngAfterViewInit() {
    this.map = L.map('map').setView([4.6440635, -74.1218681], this.page.zoom);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: `&copy; <a href="${this.page.urlAttribution}">${this.page.textAttribution}</a>`
    }).addTo(this.map);

    console.log(this.ubication.latitude, this.ubication.Length);

    this.map.on('click', this.onMapClick);
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }

  // Evento que detecta las coordenadas sobre el lugar en donde se dio click en el mapa
  private onMapClick = (e: any) => {
    const { lat, lng } = e.latlng;
    this.setAMarker(lat, lng);
  }

  // Pone un manrcador sobre el mapa cuando el usuario da click izquierdo
  private setAMarker(lat: number, lng: number) {
    if (this.map) {
      if (this.lastMarker) {
        this.map.removeLayer(this.lastMarker);
      }

      this.lastMarker = L.marker([lat, lng])
        .addTo(this.map)
        .bindPopup(this.ubication.title);
    }
  }
}
