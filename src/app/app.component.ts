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

  public multipleRoute: boolean = false;

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

  private allRoutingControls: any[] = [];
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

  onCheckboxChange() {
    console.log('¿Mostrar instrucciones?:', this.multipleRoute);
    // Aquí puedes ejecutar lógica extra, como limpiar el div si se desmarca
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
      if(this.multipleRoute){
        this.generateMultipleRoutes(inputValidOrigin[0], inputValidDestination[0]);
      }else{
        this.routeGenerate(inputValidOrigin[0], inputValidDestination[0]);
      }
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

  // Genera una unica ruta
  public routeGenerate(origin: number[], destination: number[]) {
    const origen = L.latLng(origin[0], origin[1]);
    const destino = L.latLng(destination[0], destination[1]);
    const container = document.getElementById('directions-container');

    (L as any).Routing.control({
      waypoints: [origen, destino],
      language: 'es',
      createMarker: (i: number, waypoint: any, n: number) => {
        if (i === 0) {
          return L.marker(waypoint.latLng, { icon: this.truckIcon });
        }
        return L.marker(waypoint.latLng, { icon: this.destinationIcon });
      },
      container: container,
      show: true,
      itinerary: {
        collapsible: false 
      },
      lineOptions: {
        styles: [{ color: 'blue', weight: 4 }]
      },
      routeWhileDragging: true,
      addWaypoints: false,
      collapsible: true,
    }).addTo(this.map);
  }

  public generateMultipleRoutes(origin: number[], destination: number[], color: string = 'red') {
    const origen = L.latLng(origin[0], origin[1]);
    const destino = L.latLng(destination[0], destination[1]);

    // Creamos el control
    const routingControl = (L as any).Routing.control({
      waypoints: [origen, destino],
      language: 'es',
      fitSelectedRoutes: true, // Esto asegura que el mapa se mueva a la ruta
      show: true,
      addWaypoints: false,
      createMarker: (i: number, waypoint: any) => {
        return L.marker(waypoint.latLng, {
          icon: i === 0 ? this.truckIcon : this.destinationIcon
        });
      },
      lineOptions: {
        styles: [{ color: color, weight: 6, opacity: 0.8 }]
      }
    }).addTo(this.map);

    this.allRoutingControls.push(routingControl);

    // ESCUCHAMOS EL EVENTO CORRECTO
    routingControl.on('routesfound', (e: any) => {
      // FIX: Usamos getContainer() directamente sobre el control
      // O usamos e.target.getContainer()
      const itineraryContainer = routingControl.getContainer();
      const targetDiv = document.getElementById('directions-container');

      if (targetDiv && itineraryContainer) {
        // Si quieres múltiples rutas, crea un contenedor para cada una
        const routeWrapper = document.createElement('div');
        routeWrapper.className = 'route-itinerary-item';
        routeWrapper.innerHTML = `<h4 style="color: ${color}; margin: 10px 0;">Ruta #${this.allRoutingControls.length}</h4>`;

        // Movemos el panel de instrucciones de Leaflet dentro de nuestro wrapper
        routeWrapper.appendChild(itineraryContainer);
        targetDiv.appendChild(routeWrapper);
      }
    });

    routingControl.on('routingerror', (err: any) => {
      console.error('Error de cálculo:', err);
    });
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

  public clearMap() {
    this.allRoutingControls.forEach(control => {
      this.map?.removeControl(control);
    });
    this.allRoutingControls = [];

    this.map?.eachLayer((layer: any) => {
      if (!!layer.toGeoJSON && !layer.hasOwnProperty('_url')) {
        this.map?.removeLayer(layer);
      }
    });

    const targetDiv = document.getElementById('directions-container');
    if (targetDiv) targetDiv.innerHTML = '';
  }
}
