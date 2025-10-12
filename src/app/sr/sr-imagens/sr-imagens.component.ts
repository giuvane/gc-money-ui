import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import {
  animate, state, style, transition, trigger
} from '@angular/animations';

import Map from 'ol/Map';
import View from 'ol/View';
import OSM from 'ol/source/OSM';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import BingMaps from 'ol/source/BingMaps';
import {defaults as defaultInteractions} from 'ol/interaction';
import DragPan from 'ol/interaction/DragPan';
import MouseWheelZoom from 'ol/interaction/MouseWheelZoom';
import Kinetic from 'ol/Kinetic';

import * as Proj from 'ol/proj';
import * as gdal from 'gdal';
import GeoTIFF from 'geotiff';
import { fromUrl } from 'geotiff/dist-browser/geotiff.js';

import { ToastyService } from 'ng2-toasty';
import { ErrorHandlerService } from 'src/app/core/error-handler.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { MessageService, SelectItem } from 'primeng/api';
import {TreeNode} from 'primeng/api';

import { ImagensFiltro, SrService } from '../sr.service';
import { Area, AreaEstatisticas, Historico, Product, TreeDados, TreeImagens } from 'src/app/core/model';
import { Tree } from 'primeng/tree';
import { environment } from 'src/environments/environment';
import { AreaImagem, EstatisticaTable } from './../../core/model';
import { Table } from 'primeng/components/table/table';
import { stringify } from 'querystring';
import { analyzeAndValidateNgModules } from '@angular/compiler';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Polygon from 'ol/geom/Polygon';
import {fromLonLat} from 'ol/proj';
import {Style, Stroke, Fill} from 'ol/style';
import GeoJSON from 'ol/format/GeoJSON';

interface IV {
  name: string;
  code: string;
}

interface Paleta {
  name: string;
  code: string;
}

interface FiltroNuvens {
  name: string;
  code: number;
}

interface FiltroSat {
  name: string;
  code: string;
}

@Component({
  selector: 'app-sr-imagens',
  templateUrl: './sr-imagens.component.html',
  styleUrls: ['./sr-imagens.component.css'],
  animations: [
    trigger('state', [
        transition(':enter', [
            style({
                opacity: 0
            }),
            animate(300)
        ]),
        transition(':leave', [
            animate(300),
            style({
                opacity: 0
            })
        ])
    ])
  ]
})
export class SrImagensComponent implements OnInit, AfterViewInit {

  idArea: string;
  totalRegistros = 0;
  filtro = new ImagensFiltro();
  area = new Area();
  areaEstatisticas = new AreaEstatisticas();
  estatisticas: EstatisticaTable[] = [];
  @ViewChild('tabela', {static: true}) grid: Table;
  dataEstatistica: string = '';
  tituloEstatistica: string = '';

  adbDialogVisible = false;
  adbProjectsDialogVisible = false;
  adbLoading = false;
  adbEmail = '';
  adbPassword = '';
  rememberAdbEmail = true; // salva no localStorage
  private pendingTiff: { tiff: string; nomeLayer: string } | null = null;

  // Open Layers
  @ViewChild('map', { static: false }) mapEl!: ElementRef<HTMLDivElement>;
  public state: any;
  map: Map;
  layers: any[];
  view: View;
  bingMap: TileLayer;

  // PickList
  sourceImagens: AreaImagem[];
  targetImagens: AreaImagem[];
  imagemSelecionada = new AreaImagem();

  // Dropdown IVs
  ivs: IV[];
  selectedIv: IV;

  // Downdown filtro nuvens
  filtroNuvens: FiltroNuvens[];
  selectedFiltroNuvens: FiltroNuvens;

  // Downdown filtro satélite
  filtroSat: FiltroSat[];
  selectedFiltroSat: FiltroSat;

  // Gráfico de linha
  data: any;
  historico: Historico[];

  // Download imagens
  png: string;
  tif: string;

  // Dropdown Paleta
  paletas: Paleta[];
  paleta: Paleta;

  // Dialog
  display: boolean = false;

  // ADB
  token: string;

  adbProjects: Array<{ id: string; name: string }> = [];
  adbProjectsLoading = false;
  adbProjectOptions: SelectItem[] = []; 
  adbProject: { id: string; name: string } | null = null;
  adbProjectId: string | null;

  private footprintsSrc = new VectorSource();
  private footprintsLayer = new VectorLayer({
  source: this.footprintsSrc,
  style: new Style({
    stroke: new Stroke({ color: '#00bcd4', width: 2 }),
    fill: new Fill({ color: 'rgba(0,188,212,0.15)' })
  })
});

private isLatLon(pair: number[]): boolean {
  if (!pair || pair.length < 2) { return false; }
  var a = pair[0], b = pair[1];
  return Math.abs(a) <= 90 && Math.abs(b) <= 180 && Math.abs(b) > Math.abs(a);
}

/** Converte anel [[lat,lon],...] -> [[lon,lat],...] */
private swapRing(ring: number[][]): number[][] {
  var out: number[][] = [];
  for (var i = 0; i < ring.length; i++) {
    var p = ring[i];
    out.push([p[1], p[0]]);
  }
  return out;
}

/** Normaliza seu geo_json: aceita [lat,lon] e corrige para [lon,lat] */
private normalizeGeoJson(geojson: any): any {
  // clone raso
  var g = JSON.parse(JSON.stringify(geojson || {}));
  if (!g || !g.geometry) { return g; }

  var geom = g.geometry;
  if (geom.type === 'Polygon' && geom.coordinates && geom.coordinates.length > 0) {
    var ring = geom.coordinates[0];
    if (ring && ring.length > 0 && this.isLatLon(ring[0])) {
      geom.coordinates = [ this.swapRing(ring) ];
    }
  } else if (geom.type === 'MultiPolygon' && geom.coordinates && geom.coordinates.length > 0) {
    // supondo [[ring]] por polígono
    var polys = geom.coordinates;
    for (var p = 0; p < polys.length; p++) {
      var firstRing = polys[p] && polys[p][0];
      if (firstRing && firstRing.length > 0 && this.isLatLon(firstRing[0])) {
        polys[p] = [ this.swapRing(firstRing) ];
      }
    }
    geom.coordinates = polys;
  }
  return g;
}

/** Desenha o GeoJSON (WGS84) e faz fit no mapa */
drawAreaGeoJson(geo_json: any) {
  var fixed = this.normalizeGeoJson(geo_json);

  var feat = new GeoJSON().readFeature(fixed, {
    dataProjection: 'EPSG:4326',
    featureProjection: 'EPSG:3857'
  });

  this.footprintsSrc.clear();
  this.footprintsSrc.addFeature(feat);

  var geom: any = feat.getGeometry && feat.getGeometry();
  if (geom && geom.getExtent) {
    this.view.fit(geom.getExtent(), { padding: [40,40,40,40], duration: 250 });
  }
}

  constructor(
    private srService: SrService,
    private toasty: ToastyService,
    private errorHandler: ErrorHandlerService,
    private route: ActivatedRoute,
    private router: Router,
    private title: Title,
    private messageService: MessageService
  ) {
      this.ivs = [
        {name: 'NDVI', code: 'ndvi'},
        {name: 'EVI', code: 'evi'},
        {name: 'EVI2', code: 'evi2'},
        {name: 'DSWI', code: 'dswi'},
        {name: 'NDWI', code: 'ndwi'},
        {name: 'NRI', code: 'nri'},
        {name: 'RGB', code: 'rgb'},
        {name: 'Falsa cor', code: 'fc'}
      ];

      this.paletas = [
        {name: 'Paleta 1', code: '1'},
        {name: 'Paleta 2', code: '2'},
        {name: 'Paleta 3', code: '3'},
        {name: 'Paleta 4', code: '4'},
      ];

      this.filtroNuvens = [
        {name: '40%', code: 40},
        {name: '30%', code: 30},
        {name: '20%', code: 20},
        {name: '15%', code: 15},
        {name: '10%', code: 10},
        {name: '5%', code: 5}
      ];

      this.filtroSat = [
        {name: 'Todos', code: 'all'},
        {name: 'Sentinel-2', code: 's2'},
        {name: 'Landsat8', code: 'l8'}
      ];

   }

  ngOnInit() {
    this.idArea = this.route.snapshot.params['codigo'];
    console.log(this.idArea);

    const last = localStorage.getItem('adb_email');
    if (last) this.adbEmail = last;
  }

  ngAfterViewInit(): void {
    this.carregarInformacoesArea();
  }

  carregarInformacoesArea() {
    this.srService.carregarInformacoesPoligono(this.idArea)
      .then(resultado => {
        this.area = resultado.area;
        console.log(this.area);

        this.carregarMapa();

        if (this.area.geo_json) {
          this.drawAreaGeoJson(this.area.geo_json);
        }
    })
    .catch(erro => this.errorHandler.handle(erro));
  }

  carregarMapa() {
   this.view = new View({
      center: Proj.fromLonLat([this.area.center[0], this.area.center[1]]),
      zoom: 16,
      minZoom: 2,
      maxZoom: 18,        
      constrainResolution: true,
      smoothExtentConstraint: true
    });

    const osm = new TileLayer({
    source: new OSM(),
    visible: true
    });

    const esriSat = new TileLayer({
      source: new XYZ({
        url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attributions: 'Tiles © Esri — Sources: Esri, Maxar, Earthstar Geographics, and the GIS User Community'
      }),
      visible: true
    });

    // 3) Cria o mapa (AGORA o mapEl existe)
    this.map = new Map({
      target: this.mapEl.nativeElement,
      layers: [esriSat, this.footprintsLayer],
      view: this.view,
      interactions: defaultInteractions({
        altShiftDragRotate: false,
        pinchRotate: false,
      })
      .extend([
        new DragPan({ kinetic: new Kinetic(-0.005, 0.05, 100) }),
        new MouseWheelZoom()
      ])
    });

    this.map.on('pointerdrag', () => this.mapEl.nativeElement.classList.add('dragging'));
    this.map.on('pointerup',   () => this.mapEl.nativeElement.classList.remove('dragging'));

    setTimeout(() => {
  const stop = this.map.getTargetElement()
    .querySelector('.ol-overlaycontainer-stopevent') as HTMLElement;
  if (stop) {
    stop.style.pointerEvents = 'none';
    stop.querySelectorAll('.ol-control').forEach(el => {
      (el as HTMLElement).style.pointerEvents = 'auto';
    });
  }
}, 0);

  // 4) Garante resize após renderizar/painéis
  //setTimeout(() => this.map?.updateSize(), 0);
  //window.addEventListener('resize', () => this.map?.updateSize());
  }

  carregarLayer(areaImagem: AreaImagem) {

    let camada: string = '';

    if (this.selectedIv.code === 'ndvi') {
      camada = areaImagem.tile.ndvi;
    } else if (this.selectedIv.code === 'evi') {
      camada = areaImagem.tile.evi;
    } else if (this.selectedIv.code === 'evi2') {
      camada = areaImagem.tile.evi2;
    } else if (this.selectedIv.code === 'dswi') {
      camada = areaImagem.tile.dswi;
    } else if (this.selectedIv.code === 'ndwi') {
      camada = areaImagem.tile.ndwi;
    } else if (this.selectedIv.code === 'nri') {
      camada = areaImagem.tile.nri;
    } else if (this.selectedIv.code === 'rgb') {
      camada = areaImagem.tile.truecolor;
    } else if (this.selectedIv.code === 'fc') {
      camada = areaImagem.tile.falsecolor;
    }

    const raster = new TileLayer({
      source: new XYZ({
        // tslint:disable-next-line: max-line-length
        url: camada + '&paletteid=' + this.paleta.code
      })
    });
    // raster.set('layerid', layer.id);

    this.map.addLayer(raster);
  }

  carregarEstatisticas(areaImagem: AreaImagem) {

    let url: string;

    this.dataEstatistica = this.unixTimestampToDateGraph(areaImagem.dt);
    this.estatisticas = [];

    if (this.selectedIv.code === 'ndvi') {
      url = areaImagem.stats.ndvi;
      this.tituloEstatistica = 'NDVI';
    } else if (this.selectedIv.code === 'evi') {
      url = areaImagem.stats.evi;
      this.tituloEstatistica = 'EVI';
    } else if (this.selectedIv.code === 'evi2') {
      url = areaImagem.stats.evi2;
      this.tituloEstatistica = 'EVI2';
    } else if (this.selectedIv.code === 'dswi') {
      url = areaImagem.stats.dswi;
      this.tituloEstatistica = 'DSWI';
    } else if (this.selectedIv.code === 'ndwi') {
      url = areaImagem.stats.ndwi;
      this.tituloEstatistica = 'NDWI';
    } else if (this.selectedIv.code === 'nri') {
      url = areaImagem.stats.nri;
      this.tituloEstatistica = 'NRI';
    } else if (this.selectedIv.code === 'rgb') {
      url = areaImagem.stats.ndvi;
      this.tituloEstatistica = 'NDVI';
    } else if (this.selectedIv.code === 'fc') {
      url = areaImagem.stats.ndvi;
      this.tituloEstatistica = 'NDVI';
    }

    this.srService.carregarEstatisticasArea(url)
      .then(resultado => {
        this.areaEstatisticas = resultado.estat;
        console.log(this.areaEstatisticas);

        this.estatisticas.push({key: 'Pixels', value: this.areaEstatisticas.num.toString()});
        this.estatisticas.push({key: 'Desvio padrão', value: this.areaEstatisticas.std.toFixed(4) });
        this.estatisticas.push({key: '1º quartil', value: this.areaEstatisticas.p25.toFixed(4)});
        this.estatisticas.push({key: 'Mínimo', value: this.areaEstatisticas.min.toFixed(4)});
        this.estatisticas.push({key: 'Máximo', value: this.areaEstatisticas.max.toFixed(4)});
        this.estatisticas.push({key: 'Média', value: this.areaEstatisticas.median.toFixed(4)});
        this.estatisticas.push({key: '3º quartil', value: this.areaEstatisticas.p75.toFixed(4)});
        this.estatisticas.push({key: 'Mediana', value: this.areaEstatisticas.mean.toFixed(4)});
    })
    .catch(erro => this.errorHandler.handle(erro));
  }

  carregarHistoricoEstatistico(dataInicio: string, dataFim: string, filtroNuvens: number = 40, filtroSat: string = 'all') {

    let labels: string[] = [];
    let min: string[] = [];
    let max: string[] = [];
    let mean: string[] = [];

    this.srService.carregarHistoricoArea(this.idArea, dataInicio, dataFim)
      .then(resultado => {
        this.totalRegistros = resultado.total;
        this.historico = resultado.historico;

        if (filtroSat !== 'all') {
          for (const hist of this.historico) {
            if (hist.cl < filtroNuvens && hist.type === filtroSat) {
              labels.push(this.unixTimestampToDateGraph(hist.dt).toString());
              min.push(hist.data.min);
              max.push(hist.data.max);
              mean.push(hist.data.mean);
            }
          }
        } else {
          for (const hist of this.historico) {
            if (hist.cl < filtroNuvens) {
              labels.push(this.unixTimestampToDateGraph(hist.dt).toString());
              min.push(hist.data.min);
              max.push(hist.data.max);
              mean.push(hist.data.mean);
            }
          }
        }

        // Exemplo de gráfico de linha
        this.data = {
          labels: labels.reverse(),
          datasets:
          [
            {
              label: 'max',
              data: max.reverse(),
              fill: false,
              borderColor: '#0000CD'
            },
            {
              label: 'min',
              data: min.reverse(),
              fill: false,
              borderColor: '#B22222'
            },
            {
              label: 'mean',
              data: mean.reverse(),
              fill: false,
              borderColor: '#3CB371'
            }
          ]
        };
      })
      .catch(erro => this.errorHandler.handle(erro));
  }

  pesquisar(pagina = 0) {

    // this.srService.getProductsSmall().then(products => this.sourceProducts = products);
    this.targetImagens = [];

    let dataInicio: string;
    let dataFim: string;

    if (this.filtro.dataImagensInicio && this.filtro.dataImagensFim) {
      dataInicio = this.dateToUnixTimestamp(this.filtro.dataImagensInicio).slice(0, -3);
      // dataInicio = dataInicio.slice(0, -3);
      dataFim = this.dateToUnixTimestamp(this.filtro.dataImagensFim).slice(0, -3);
      // dataFim = dataFim.slice(0, -3);

      this.filtro.pagina = pagina;

      this.srService.pesquisarImagens(this.filtro, this.idArea, dataInicio, dataFim)
        .then(resultado => {
          this.totalRegistros = resultado.total;
          this.sourceImagens = resultado.areas;
          console.log(this.sourceImagens[0]);
         // console.log(this.files1);
        })
        .catch(erro => this.errorHandler.handle(erro));

      this.carregarHistoricoEstatistico(dataInicio, dataFim);

    }
  }

  /* Eventos do componente PickList */
  sourceSelect(event) {
    this.imagemSelecionada = event.items[0];

    this.messageService.add({
      severity: 'info',
      summary: 'Imagem selecionada (source)',
      detail: this.unixTimestampToDateGraph(this.imagemSelecionada.dt)
    });

    this.carregarLayer(event.items[0]);
    this.carregarEstatisticas(event.items[0]);

    if (this.selectedIv.code === 'ndvi') {
      this.png = this.imagemSelecionada.image.ndvi + '&paletteid=' + this.paleta.code;
      this.tif = this.imagemSelecionada.data.ndvi + '&paletteid=' + this.paleta.code;
    } else if (this.selectedIv.code === 'evi') {
      this.png = this.imagemSelecionada.image.evi + '&paletteid='+ this.paleta.code;
      this.tif = this.imagemSelecionada.data.evi + '&paletteid=' + this.paleta.code;
    } else if (this.selectedIv.code === 'evi2') {
      this.png = this.imagemSelecionada.image.evi2 + '&paletteid=' + this.paleta.code;
      this.tif = this.imagemSelecionada.data.evi2 + '&paletteid=' + this.paleta.code;
    } else if (this.selectedIv.code === 'dswi') {
      this.png = this.imagemSelecionada.image.dswi + '&paletteid=' + this.paleta.code;
      this.tif = this.imagemSelecionada.data.dswi + '&paletteid=' + this.paleta.code;
    } else if (this.selectedIv.code === 'ndwi') {
      this.png = this.imagemSelecionada.image.ndwi + '&paletteid=' + this.paleta.code;
      this.tif = this.imagemSelecionada.data.ndwi + '&paletteid=' + + this.paleta.code;
    } else if (this.selectedIv.code === 'nri') {
      this.png = this.imagemSelecionada.image.nri + '&paletteid=' + + this.paleta.code;
      this.tif = this.imagemSelecionada.data.nri + '&paletteid=' + + this.paleta.code;
    } else if (this.selectedIv.code === 'rgb') {
      this.png = this.imagemSelecionada.image.truecolor;
      this.tif = this.imagemSelecionada.data.truecolor;
    } else if (this.selectedIv.code === 'fc') {
      this.png = this.imagemSelecionada.image.falsecolor;
      this.tif = this.imagemSelecionada.data.falsecolor;
    }
  }

  targetSelect(event) {
    this.imagemSelecionada = event.items[0];

    this.messageService.add({
      severity: 'info',
      summary: 'Imagem selecionada (target)',
      detail: this.unixTimestampToDateGraph(this.imagemSelecionada.dt)
    });

    this.carregarLayer(event.items[0]);
    this.carregarEstatisticas(event.items[0]);

    if (this.selectedIv.code === 'ndvi') {
      this.png = this.imagemSelecionada.image.ndvi + '&paletteid=' + this.paleta.code;
      this.tif = this.imagemSelecionada.data.ndvi + '&paletteid=' + this.paleta.code;
    } else if (this.selectedIv.code === 'evi') {
      this.png = this.imagemSelecionada.image.evi + '&paletteid=' + this.paleta.code;
      this.tif = this.imagemSelecionada.data.evi + '&paletteid=' + this.paleta.code;
    } else if (this.selectedIv.code === 'evi2') {
      this.png = this.imagemSelecionada.image.evi2 + '&paletteid=' + this.paleta.code;
      this.tif = this.imagemSelecionada.data.evi2 + '&paletteid=' + this.paleta.code;
    } else if (this.selectedIv.code === 'dswi') {
      this.png = this.imagemSelecionada.image.dswi + '&paletteid=' + this.paleta.code;
      this.tif = this.imagemSelecionada.data.dswi + '&paletteid=' + this.paleta.code;
    } else if (this.selectedIv.code === 'ndwi') {
      this.png = this.imagemSelecionada.image.ndwi + '&paletteid=' + this.paleta.code;
      this.tif = this.imagemSelecionada.data.ndwi + '&paletteid=' + this.paleta.code;
    } else if (this.selectedIv.code === 'nri') {
      this.png = this.imagemSelecionada.image.nri + '&paletteid=' + this.paleta.code;
      this.tif = this.imagemSelecionada.data.nri + '&paletteid=' + this.paleta.code;
    } else if (this.selectedIv.code === 'rgb') {
      this.png = this.imagemSelecionada.image.truecolor;
      this.tif = this.imagemSelecionada.data.truecolor;
    } else if (this.selectedIv.code === 'fc') {
      this.png = this.imagemSelecionada.image.falsecolor;
      this.tif = this.imagemSelecionada.data.falsecolor;
    }
  }

  selectData(event) {
    this.messageService.add({
      severity: 'info',
      summary: 'Data Selected', detail: this.data.datasets[event.element._datasetIndex].data[event.element._index]
    });
  }

  lerTiff(event) {
    let tiffSelecionado;

    if (this.selectedIv.code === 'ndvi') {
      tiffSelecionado = this.imagemSelecionada.data.ndvi;
    } else if (this.selectedIv.code === 'evi') {
      tiffSelecionado = this.imagemSelecionada.data.evi;
    } else if (this.selectedIv.code === 'evi2') {
      tiffSelecionado = this.imagemSelecionada.data.evi2;
    } else if (this.selectedIv.code === 'dswi') {
      tiffSelecionado = this.imagemSelecionada.data.dswi;
    } else if (this.selectedIv.code === 'ndwi') {
      tiffSelecionado = this.imagemSelecionada.data.ndwi;
    } else if (this.selectedIv.code === 'nri') {
      tiffSelecionado = this.imagemSelecionada.data.nri;
    } else if (this.selectedIv.code === 'rgb') {
      tiffSelecionado = this.imagemSelecionada.data.truecolor;
    } else if (this.selectedIv.code === 'fc') {
      tiffSelecionado = this.imagemSelecionada.data.falsecolor;
    }

    const nomeLayer = this.buildSafeLayerName();

    this.pendingTiff = { tiff: tiffSelecionado, nomeLayer };
    this.adbDialogVisible = true;
  }

  private buildSafeLayerName(): string {
    if (!this.imagemSelecionada || !this.imagemSelecionada.dt) return 'layer';

    const d = this.unixTimestampToDate(this.imagemSelecionada.dt);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    let name = `${this.imagemSelecionada.type}_${y}-${m}-${day}`;
    name = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    name = name.replace(/[^\w-]+/g, '_');
    if (name.length > 60) name = name.slice(0, 60);
    return name;
  }

  onConfirmAdbLogin() {
    if (!this.adbEmail || !this.adbPassword || !this.pendingTiff) {
      this.toasty.warning('Informe e-mail, senha e selecione uma imagem.');
      return;
    }

    this.adbLoading = true;

    if (this.rememberAdbEmail) localStorage.setItem('adb_email', this.adbEmail);
    else localStorage.removeItem('adb_email');

    this.srService.gerarTokenAdb(this.adbEmail, this.adbPassword)
      .then(token => {
        this.token = token;
        this.adbPassword = '';            
        this.adbProjectsLoading = true;
        console.log("Tokem: " + token)
        return this.srService.getAdbProjects(token);
      })
      .then(projects => {
        this.adbProjects = (projects || []).map(p => ({ id: p.id, name: p.name }));
        this.adbProjectOptions = this.adbProjects.map(p => ({ label: p.name, value: p.id }));
        this.adbDialogVisible = false;
        this.adbProjectsDialogVisible = true;
      })
      .catch(err => this.errorHandler.handle(err))
      .finally(() => {
        this.adbLoading = false;
        this.adbProjectsLoading = false;
      });
  }

  onCancelAdbLogin() {
    this.adbDialogVisible = false;
    this.pendingTiff = null;
    this.adbPassword = '';
  }
  
  onVetorizarParaProjeto() {
    if (!this.pendingTiff || !this.token) {
      this.toasty.warning('Faça o login no ADB e selecione a imagem.');
      return;
    }
    if (!this.adbProjectId) {
      this.toasty.warning('Selecione um projeto do ADB.');
      return;
    }

    const { tiff, nomeLayer } = this.pendingTiff;
    this.adbLoading = true;

    console.log("TIFF: " + tiff);

    this.srService.vetorizarTif(tiff, nomeLayer, this.token, this.adbProjectId)
      .then(() => {
        this.toasty.success('Vetorizar enviado ao ADB com sucesso!');
        this.adbProjectsDialogVisible = false;
        this.pendingTiff = null;
      })
      .catch(err => this.errorHandler.handle(err))
      .finally(() => this.adbLoading = false);
  }

  onAdbProjectChange(e: any) {
    this.adbProjectId = e && e.value ? e.value.id : null;
  }

  downloadPng() {
    let ivSelecionado;

    if (this.selectedIv.code === 'ndvi') {
      ivSelecionado = this.imagemSelecionada.image.ndvi;
    } else if (this.selectedIv.code === 'evi') {
      ivSelecionado = this.imagemSelecionada.image.evi;
    } else if (this.selectedIv.code === 'evi2') {
      ivSelecionado = this.imagemSelecionada.image.evi2;
    } else if (this.selectedIv.code === 'dswi') {
      ivSelecionado = this.imagemSelecionada.image.dswi;
    } else if (this.selectedIv.code === 'ndwi') {
      ivSelecionado = this.imagemSelecionada.image.ndwi;
    } else if (this.selectedIv.code === 'nri') {
      ivSelecionado = this.imagemSelecionada.image.nri;
    } else if (this.selectedIv.code === 'rgb') {
      ivSelecionado = this.imagemSelecionada.image.truecolor;
    } else if (this.selectedIv.code === 'fc') {
      ivSelecionado = this.imagemSelecionada.image.falsecolor;
    }

    console.log(ivSelecionado);
  }

  downloadTif() {
    let ivSelecionado;

    if (this.selectedIv.code === 'ndvi') {
      ivSelecionado = this.imagemSelecionada.data.ndvi;
    } else if (this.selectedIv.code === 'evi') {
      ivSelecionado = this.imagemSelecionada.data.evi;
    } else if (this.selectedIv.code === 'evi2') {
      ivSelecionado = this.imagemSelecionada.data.evi2;
    } else if (this.selectedIv.code === 'dswi') {
      ivSelecionado = this.imagemSelecionada.data.dswi;
    } else if (this.selectedIv.code === 'ndwi') {
      ivSelecionado = this.imagemSelecionada.data.ndwi;
    } else if (this.selectedIv.code === 'nri') {
      ivSelecionado = this.imagemSelecionada.data.nri;
    } else if (this.selectedIv.code === 'rgb') {
      ivSelecionado = this.imagemSelecionada.data.truecolor;
    } else if (this.selectedIv.code === 'fc') {
      ivSelecionado = this.imagemSelecionada.data.falsecolor;
    }

    console.log(ivSelecionado);
  }

  // Eventos do Dropdown
  changeDropdownIv(event) {
    this.carregarLayer(this.imagemSelecionada);
    this.carregarEstatisticas(this.imagemSelecionada);

    if (this.selectedIv.code === 'ndvi') {
      this.png = this.imagemSelecionada.image.ndvi + '&paletteid=' + this.paleta.code;
      this.tif = this.imagemSelecionada.data.ndvi + '&paletteid=' + this.paleta.code;
    } else if (this.selectedIv.code === 'evi') {
      this.png = this.imagemSelecionada.image.evi + '&paletteid=' + this.paleta.code;
      this.tif = this.imagemSelecionada.data.evi + '&paletteid=' + this.paleta.code;
    } else if (this.selectedIv.code === 'evi2') {
      this.png = this.imagemSelecionada.image.evi2 + '&paletteid=' + this.paleta.code;
      this.tif = this.imagemSelecionada.data.evi2 + '&paletteid=' + this.paleta.code;
    } else if (this.selectedIv.code === 'dswi') {
      this.png = this.imagemSelecionada.image.dswi + '&paletteid=' + this.paleta.code;
      this.tif = this.imagemSelecionada.data.dswi + '&paletteid=' + this.paleta.code;
    } else if (this.selectedIv.code === 'ndwi') {
      this.png = this.imagemSelecionada.image.ndwi + '&paletteid=' + this.paleta.code;
      this.tif = this.imagemSelecionada.data.ndwi + '&paletteid=' + this.paleta.code;
    } else if (this.selectedIv.code === 'nri') {
      this.png = this.imagemSelecionada.image.nri + '&paletteid=' + this.paleta.code;
      this.tif = this.imagemSelecionada.data.nri + '&paletteid=' + this.paleta.code;
    } else if (this.selectedIv.code === 'rgb') {
      this.png = this.imagemSelecionada.image.truecolor;
      this.tif = this.imagemSelecionada.data.truecolor;
    } else if (this.selectedIv.code === 'fc') {
      this.png = this.imagemSelecionada.image.falsecolor;
      this.tif = this.imagemSelecionada.data.falsecolor;
    }
  }

  changePaleta(event) {
    this.carregarLayer(this.imagemSelecionada);

    if (this.selectedIv.code === 'ndvi') {
      this.png = this.imagemSelecionada.image.ndvi + '&paletteid=' + this.paleta.code;
      this.tif = this.imagemSelecionada.data.ndvi + '&paletteid=' + this.paleta.code;
    } else if (this.selectedIv.code === 'evi') {
      this.png = this.imagemSelecionada.image.evi + '&paletteid=' + this.paleta.code;
      this.tif = this.imagemSelecionada.data.evi + '&paletteid=' + this.paleta.code;
    } else if (this.selectedIv.code === 'evi2') {
      this.png = this.imagemSelecionada.image.evi2 + '&paletteid=' + this.paleta.code;
      this.tif = this.imagemSelecionada.data.evi2 + '&paletteid=' + this.paleta.code;
    } else if (this.selectedIv.code === 'dswi') {
      this.png = this.imagemSelecionada.image.dswi + '&paletteid=' + this.paleta.code;
      this.tif = this.imagemSelecionada.data.dswi + '&paletteid=' + this.paleta.code;
    } else if (this.selectedIv.code === 'ndwi') {
      this.png = this.imagemSelecionada.image.ndwi + '&paletteid=' + this.paleta.code;
      this.tif = this.imagemSelecionada.data.ndwi + '&paletteid=' + this.paleta.code;
    } else if (this.selectedIv.code === 'nri') {
      this.png = this.imagemSelecionada.image.nri + '&paletteid=' + this.paleta.code;
      this.tif = this.imagemSelecionada.data.nri + '&paletteid=' + this.paleta.code;
    } else if (this.selectedIv.code === 'rgb') {
      this.png = this.imagemSelecionada.image.truecolor;
      this.tif = this.imagemSelecionada.data.truecolor;
    } else if (this.selectedIv.code === 'fc') {
      this.png = this.imagemSelecionada.image.falsecolor;
      this.tif = this.imagemSelecionada.data.falsecolor;
    }
  }

  showDialog() {
    this.display = true;
  }


  // Eventos do Dropdown
  changeDropdownFiltroNuvens(event) {
    let dataInicio: string;
    let dataFim: string;

    dataInicio = this.dateToUnixTimestamp(this.filtro.dataImagensInicio).slice(0, -3);
    dataFim = this.dateToUnixTimestamp(this.filtro.dataImagensFim).slice(0, -3);

    this.carregarHistoricoEstatistico(dataInicio, dataFim, this.selectedFiltroNuvens.code, this.selectedFiltroSat.code);
  }

  // Eventos do Dropdown
  changeDropdownFiltroSat(event) {
    let dataInicio: string;
    let dataFim: string;

    dataInicio = this.dateToUnixTimestamp(this.filtro.dataImagensInicio).slice(0, -3);
    dataFim = this.dateToUnixTimestamp(this.filtro.dataImagensFim).slice(0, -3);

    this.carregarHistoricoEstatistico(dataInicio, dataFim, this.selectedFiltroNuvens.code, this.selectedFiltroSat.code);
  }

  unixTimestampToDate(unixtime: any) {
    const date = new Date(unixtime*1000);
    return date;
  }

  unixTimestampToDateGraph(unixtime: any) {
    const date = new Date(unixtime*1000);
    // const format = date.getDate() + "/" + date.getMonth() + "/" + date.getFullYear();
    return date.toDateString();
  }

  dateToUnixTimestamp(date: Date) {
    const unixtime = date.valueOf();
    return unixtime.toString();
  }
}
