import { Component, OnInit } from '@angular/core';
import { FormControl, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { ToastyService } from 'ng2-toasty';

import { SrService } from '../sr.service';
import { ErrorHandlerService } from 'src/app/core/error-handler.service';
import { Area } from 'src/app/core/model';
import { MessageService } from 'primeng/api';

declare var google: any;

@Component({
  selector: 'app-sr-cadastro',
  templateUrl: './sr-cadastro.component.html',
  styleUrls: ['./sr-cadastro.component.css']
})
export class SrCadastroComponent implements OnInit {

  area = new Area();

  // Maps
  options: any;
  overlays: any[];
  selectedPosition: any;
  dialogVisible: boolean;
  markerTitle: string;
  draggable: boolean;
  infoWindow: any;
  mapStyle: any;
  map: any;

  // Polígono
  poligono: any[];
  poligono_geojson: any[];
  pontos: any[];
  coord: any;

  constructor(
    private srService: SrService,
    private toasty: ToastyService,
    private errorHandler: ErrorHandlerService,
    private route: ActivatedRoute,
    private router: Router,
    private title: Title,

    private messageService: MessageService
  ) {
    this.map = google.maps.Map;

   }

  ngOnInit() {
    this.options = {
      center: {lat: -24.858674, lng: -54.336235},
      zoom: 14
    };

    this.mapStyle = {
      width: '100%',
      height: '480px'
    };

    this.infoWindow = new google.maps.InfoWindow();

    this.overlays = [];
    this.poligono = [];
    this.poligono_geojson = [];
    this.pontos = [];
    // this.poligono = google.maps.Polygon;
    // this.coord = google.maps.LatLng;

    // this.poligono.setStrokeColor('#FF9900');
    // this.poligono.setFillColor('#FF9900');
    // this.poligono.setStrokeOpacity(0.7);
    // this.poligono.setFillOpacity(0.7);

  }

  setMap(event) {
    this.map = event.map;

    // this.carregarGeoJson();
    // this.iniciarOverlays();
  }

  handleMapClick(event) {
    /*
    // -=- Abre dialgo para adicionar novo marcador -=-
    // event: MouseEvent of Google Maps api
    this.selectedPosition = event.latLng;
    this.dialogVisible = true;
    this.messageService.add({
      severity: 'info', detail: 'Lat: ' + this.selectedPosition.lat() + ' Long: ' + this.selectedPosition.lng() });
    console.log(event);
      */

    /*
    this.selectedPosition = event.latLng;
    this.coord = new google.maps.LatLng(this.selectedPosition.lat(), this.selectedPosition.lng());
    this.poligono.getPaths().add(this.coord);
    console.log(this.poligono);
    this.overlays.push(this.poligono);
    */

    this.selectedPosition = event.latLng;
    this.poligono.push({ lat: this.selectedPosition.lat(), lng: this.selectedPosition.lng() });
    this.pontos.push({ lat: this.selectedPosition.lat(), lng: this.selectedPosition.lng() });
    //console.log(this.poligono);

    this.poligono_geojson.push( [ this.selectedPosition.lat(), this.selectedPosition.lng() ] );
    // console.log(this.poligono_geojson);



    //console.log(this.area);

    this.overlays = [
      new google.maps.Polygon({ paths: [
          this.poligono,
      ], strokeOpacity: 0.5, strokeWeight: 1, fillColor: '#1976D2', fillOpacity: 0.35
      }),

    ];
    // this.overlays.push(new google.maps.Marker({ position: { lat: this.selectedPosition.lat(), lng: this.selectedPosition.lng() }, title: '' }));
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
    this.poligono = [];
  }

  salvar(form: NgForm) {
    // if (this.editando) {
    //   this.atualizarPessoa(form);
    // } else {
    //   this.adicionarPessoa(form);
    // }

    this.adicionarArea(form);
  }

  adicionarArea(form: NgForm) {

    let primeiro = this.poligono[0];

    this.poligono_geojson.push( [ primeiro.lat, primeiro.lng ] );

    this.area.geo_json = {
      type: 'Feature',
      properties: {},
      geometry: {
          type: 'Polygon',
          coordinates: [this.poligono_geojson]
        }
    };

    console.log(this.area);

    this.srService.adicionar(this.area)
      .then(areaAdicionada => {
        this.toasty.success('Pessoa adicionada com sucesso!');

        // form.reset();
        // this.lancamento = new Lancamento();
        this.router.navigate(['/sr']);
      })
      .catch(erro => this.errorHandler.handle(erro));
  }

}
