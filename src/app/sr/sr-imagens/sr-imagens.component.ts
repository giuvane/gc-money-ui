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

import * as Proj from 'ol/proj';
import * as gdal from 'gdal';
import GeoTIFF from 'geotiff';
import { fromUrl } from 'geotiff/dist-browser/geotiff.js';

import { ToastyService } from 'ng2-toasty';
import { ErrorHandlerService } from 'src/app/core/error-handler.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { MessageService } from 'primeng/api';
import {TreeNode} from 'primeng/api';

import { ImagensFiltro, SrService } from '../sr.service';
import { Area, AreaEstatisticas, Historico, Product, TreeDados, TreeImagens } from 'src/app/core/model';
import { Tree } from 'primeng/tree';
import { environment } from 'src/environments/environment';
import { AreaImagem, EstatisticaTable } from './../../core/model';
import { Table } from 'primeng/components/table/table';
import { stringify } from 'querystring';
import { analyzeAndValidateNgModules } from '@angular/compiler';

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

  // Open Layers
  @ViewChild('map', {static: false}) public mapEl: ElementRef;
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

  constructor(
    private srService: SrService,
    private toasty: ToastyService,
    private errorHandler: ErrorHandlerService,
    private route: ActivatedRoute,
    private router: Router,
    private title: Title,
    private messageService: MessageService
  ) {
      // Criando mapa Bing
      this.bingMap = new TileLayer({
        source: new BingMaps({
          imagerySet: 'AerialWithLabels',
          key:  environment.bingMapsKey,
        }),
      });

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

    this.carregarInformacoesArea();
  }

  ngAfterViewInit(): void {

  }

  carregarInformacoesArea() {
    this.srService.carregarInformacoesPoligono(this.idArea)
      .then(resultado => {
        this.area = resultado.area;
        console.log(this.area);

        this.carregarMapa();
    })
    .catch(erro => this.errorHandler.handle(erro));
  }

  carregarMapa() {
    this.view = new View({
      center: Proj.fromLonLat([this.area.center[0], this.area.center[1]]),
      zoom: 16,
      minZoom: 1,
      maxZoom: 19,
    });

    this.map = new Map({
      //controls: [],
      layers: [this.bingMap],
      target: this.mapEl.nativeElement,
      view: this.view,
    });
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
      camada = areaImagem.tile.ndvi;
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

    let login = 'giuvane.conti@gmail.com';
    let senha = '123456';
    let projectId = '6009c5932a0457001a17c319';

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

    let nomeLayer = 'teste';

    this.srService.vetorizarTif(tiffSelecionado, nomeLayer)
      .then(resultado => {
        console.log(resultado);
        this.gerarTokenAdb(login, senha, resultado, projectId);
        this.salvarArquivoCsv(resultado);
      })
      .catch(erro => this.errorHandler.handle(erro));

  }

  salvarArquivoCsv(json: string) {

  }

  gerarTokenAdb(login: string, senha: string, json: string, projectId: string) {
    this.srService.gerarTokenAdb(login, senha)
        .then(resultado => {
          const token = resultado;
          //console.log(token);
          this.integrarAdb(token, json, projectId);
        })
        .catch(erro => this.errorHandler.handle(erro));
  }

  integrarAdb(token: string, json: string, projectId: string) {
    this.srService.integrarAdb(token, json, projectId)
        .then(json => {
          //console.log(json);
        })
        .catch(erro => this.errorHandler.handle(erro));
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
