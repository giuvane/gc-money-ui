// sr-cadastro.component.ts
import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastyService } from 'ng2-toasty';
import { SrService } from '../sr.service';
import { ErrorHandlerService } from 'src/app/core/error-handler.service';
import { Area } from 'src/app/core/model';

import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import {defaults as defaultInteractions} from 'ol/interaction';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import {Draw, Modify, Snap} from 'ol/interaction';
import {Style, Stroke, Fill} from 'ol/style';
import GeoJSON from 'ol/format/GeoJSON';
import {fromLonLat} from 'ol/proj';

@Component({
  selector: 'app-sr-cadastro',
  templateUrl: './sr-cadastro.component.html',
  styleUrls: ['./sr-cadastro.component.css']
})
export class SrCadastroComponent implements OnInit, AfterViewInit {

  area = new Area();

  @ViewChild('drawMap', { static: false }) drawMapEl!: ElementRef<HTMLDivElement>;

  private map!: Map;
  private view!: View;
  private drawSrc = new VectorSource();
  private drawLayer = new VectorLayer({
    source: this.drawSrc,
    style: new Style({
      stroke: new Stroke({ color: '#00bcd4', width: 2 }),
      fill: new Fill({ color: 'rgba(0,188,212,0.20)' })
    })
  });

  private draw!: Draw;
  private modify!: Modify;
  private snap!: Snap;

  constructor(
    private srService: SrService,
    private toasty: ToastyService,
    private errorHandler: ErrorHandlerService,
    private router: Router
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.initMap();
    this.enableDraw(); // já entra no modo desenho
  }

  private initMap() {
    this.view = new View({
      center: fromLonLat([-54.336235, -24.858674]), // sua default city
      zoom: 14,
      minZoom: 1,
      maxZoom: 19
    });

    const esriSat = new TileLayer({
      source: new XYZ({
        url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attributions:
          'Tiles © Esri — Sources: Esri, Maxar, Earthstar Geographics, and the GIS User Community'
      }),
      visible: true
    });

    this.map = new Map({
      target: this.drawMapEl.nativeElement,
      layers: [esriSat, this.drawLayer],
      view: this.view,
      interactions: defaultInteractions({ altShiftDragRotate: false, pinchRotate: false })
    });

    // editar vértices do polígono
    this.modify = new Modify({ source: this.drawSrc });
    this.map.addInteraction(this.modify);
    // snapping nos vértices
    this.snap = new Snap({ source: this.drawSrc });
    this.map.addInteraction(this.snap);

    setTimeout(() => {
      const stop = this.map.getOverlayContainerStopEvent() as HTMLElement;
      if (!stop) return;

      // Desliga eventos do contêiner que bloqueia o pan/zoom
      stop.style.pointerEvents = 'none';

      // Mantém os controles clicáveis
      stop.querySelectorAll('.ol-control, .ol-zoom, .ol-attribution, button')
        .forEach(el => (el as HTMLElement).style.pointerEvents = 'auto');
    }, 0);
  }

  /** habilita ferramenta de desenho (um único polígono) */
  private enableDraw() {
    // só 1 feature ao mesmo tempo
    this.drawSrc.clear();
    if (this.draw) this.map.removeInteraction(this.draw);

    this.draw = new Draw({
      source: this.drawSrc,
      type: 'Polygon',
      finishCondition: (e) => true
    });

    // fecha desenho com duplo clique
    this.draw.on('drawend', () => {
      // nada aqui: já fica editável pelo Modify
    });

    this.map.addInteraction(this.draw);
  }

  /** Remove qualquer polígono atual e recomeça o desenho */
  limpar() {
    this.drawSrc.clear();
    this.enableDraw();
  }

  /** Converte a feature desenhada para GeoJSON EPSG:4326 e envia */
  salvar(form: NgForm) {
    const feat = this.drawSrc.getFeatures()[0];
    if (!feat) {
      this.toasty.warning('Desenhe um polígono antes de salvar.');
      return;
    }

    const gj = new GeoJSON().writeFeatureObject(feat, {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857'
    });

    this.area.geo_json = {
      type: 'Feature',
      properties: {},
      geometry: gj.geometry
    };

    this.srService.adicionar(this.area)
      .then(() => {
        this.toasty.success('Área adicionada com sucesso!');
        this.router.navigate(['/sr']);
      })
      .catch(erro => this.errorHandler.handle(erro));
  }
}
