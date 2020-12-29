import { Component, OnInit } from '@angular/core';

import { MessageService } from 'primeng/api';

declare var google: any;

@Component({
  selector: 'app-gmap',
  templateUrl: './gmap.component.html',
  styleUrls: ['./gmap.component.css']
})
export class GmapComponent implements OnInit {

  options: any;
  overlays: any[];
  selectedPosition: any;
  dialogVisible: boolean;
  markerTitle: string;
  draggable: boolean;
  infoWindow: any;
  mapStyle: any;
  map: any;

  constructor(private messageService: MessageService) {
    this.map = google.maps.Map;
  }

  setMap(event) {
    this.map = event.map;

    this.carregarGeoJson();
    this.iniciarOverlays();
  }

  ngOnInit() {
    this.options = {
        center: {lat: 37.6739, lng: -121.1867},
        zoom: 12
    };

    this.mapStyle = {
      width: '100%',
      height: '480px'
    };

    //this.iniciarOverlays();
    this.infoWindow = new google.maps.InfoWindow();
  }

  handleMapClick(event) {
    // event: MouseEvent of Google Maps api
    this.selectedPosition = event.latLng;
    this.dialogVisible = true;
    this.messageService.add({
      severity: 'info', detail: 'Lat: ' + this.selectedPosition.lat() + ' Long: ' + this.selectedPosition.lng() });
    console.log(event);
  }

  handleOverlayClick(event) {
      // event.originalEvent: MouseEvent of Google Maps api
      // event.overlay: Clicked overlay
      // event.map: Map instance
      this.selectedPosition = event.originalEvent.latLng;
      this.messageService.add({
        severity: 'info', detail: 'Lat: ' + this.selectedPosition.lat() + ' Long: ' + this.selectedPosition.lng() });

      console.log(event.originalEvent);
      console.log(event.overlay);
      console.log(event.map);

      const isMarker = event.overlay.getTitle !== undefined;

      if (isMarker) {
          const title = event.overlay.getTitle();
          this.infoWindow.setContent('<div>' + title + '</div>');
          this.infoWindow.open(event.map, event.overlay);
          event.map.setCenter(event.overlay.getPosition());

          this.messageService.add({severity: 'info', summary: 'Marcador selecionado', detail: title});
      } else {
          this.messageService.add({severity: 'info', summary: 'Shape selecionado', detail: ''});
      }
  }

  handleDragEnd(event) {
    this.messageService.add({severity: 'info', summary: 'Marcador movido', detail: event.overlay.getTitle()});
  }

  addMarker() {
    this.overlays.push(new google.maps.Marker({
      position:
      {
        lat: this.selectedPosition.lat(),
        lng: this.selectedPosition.lng()
      },
      title: this.markerTitle,
      draggable: this.draggable
    }));
    this.markerTitle = null;
    this.dialogVisible = false;
  }

  iniciarOverlays() {

    const imageBounds = {
      north: 40.773941,
      south: 40.712216,
      east: -74.12544,
      west: -74.22655
    };

    this.overlays = [
      new google.maps.Marker({ position: { lat: 36.879466, lng: 30.667648 }, title: 'Konyaalti' }),
      new google.maps.Marker({ position: { lat: 36.883707, lng: 30.689216 }, title: 'Ataturk Park' }),
      new google.maps.Marker({ position: { lat: 36.885233, lng: 30.702323 }, title: 'Oldtown' }),
      new google.maps.Polygon({ paths: [
          {lat: 36.9177, lng: 30.7854},
          {lat: 36.8851, lng: 30.7802},
          {lat: 36.8829, lng: 30.8111},
          {lat: 36.9177, lng: 30.8159}
      ], strokeOpacity: 0.5, strokeWeight: 1, fillColor: '#1976D2', fillOpacity: 0.35
      }),
      new google.maps.Circle({ center:
        {lat: 36.90707, lng: 30.56533},
        fillColor: '#1976D2', fillOpacity: 0.35, strokeWeight: 1, radius: 1500}),
      new google.maps.Polyline({path: [
        {lat: 36.86149, lng: 30.63743},
        {lat: 36.86341, lng: 30.72463}],
        geodesic: true, strokeColor: '#FF0000', strokeOpacity: 0.5, strokeWeight: 2}),
      new google.maps.GroundOverlay(
        'https://www.lib.utexas.edu/maps/historical/newark_nj_1922.jpg',
        imageBounds)
    ];
  }

  carregarGeoJson() {
    this.map.data.loadGeoJson(
      'https://storage.googleapis.com/mapsdevsite/json/google.json');
  }

  limpar() {
    this.overlays = [];
  }

}
