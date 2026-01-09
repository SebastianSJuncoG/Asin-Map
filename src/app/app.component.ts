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
  page = {
    title: "AsinMap",

  }

  private map: L.Map | undefined;

  ngAfterViewInit() {
    // Es vital inicializarlo en AfterViewInit porque el div #map 
    // debe existir en el DOM antes de que Leaflet intente usarlo.
    this.map = L.map('map').setView([51.505, -0.09], 13);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(this.map);
  }

  ngOnDestroy() {
    // Limpieza para evitar fugas de memoria
    if (this.map) {
      this.map.remove();
    }
  }
}
