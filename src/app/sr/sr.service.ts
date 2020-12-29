import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { MoneyHttp } from '../seguranca/money-http';
import { environment } from './../../environments/environment';

import { Area, Product } from 'src/app/core/model';
import { TreeNode } from 'primeng/api';

// Interface criada para obrigar que seja passada uma descricao no método pesquisar()
export class AreaFiltro {
  descricao: string;
  pagina = 0;
  itensPorPagina = 5;
}

export class ImagensFiltro {
  descricao: string;
  dataImagensInicio: Date;
  dataImagensFim: Date;
  pagina = 0;
  itensPorPagina = 5;
  iv: {
    name: string;
    code: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class SrService {

  srUrl: string;
  appid: string;

  constructor(private http: MoneyHttp) {
    // this.srUrl = `${environment.agroApiUrl}/polygons`;
    this.appid = '6475da62dd1776f8852048627272aad0'; // APIKEy do Agro API
  }

  carregarInformacoesPoligono(polyid: string) {

    this.srUrl = `${environment.agroApiUrl}/polygons/${polyid}`;

    let params = new HttpParams();

    params = params.append('appid', this.appid);

    return this.http.get<any>(`${this.srUrl}`, { params })
      .toPromise()
      .then(response => {
        // const areas = response.content; busca com .content removida pq não estava retornando json
        const area = response;

        const resultado = {
          area
        };
        // console.log(area);
        return resultado;
      });
  }

  carregarEstatisticasArea(url: string) {
    this.srUrl = url;

    //let params = new HttpParams();

    //params = params.append('appid', this.appid);

    return this.http.get<any>(`${this.srUrl}`)
      .toPromise()
      .then(response => {
        // const areas = response.content; busca com .content removida pq não estava retornando json
        const estat = response;

        const resultado = {
          estat
        };
        // console.log(area);
        return resultado;
      });
  }

  // Método utilizado para gerar gráfico estatístico do NDVI da área
  carregarHistoricoArea(polyid: string, dataInicio: any, dataFim: any) {
    this.srUrl = `${environment.agroApiUrl}/ndvi/history`;

    let params = new HttpParams();

    params = params.append('appid', this.appid);
    params = params.append('polyid', polyid);
    params = params.append('start', dataInicio);
    params = params.append('end', dataFim);

    return this.http.get<any>(`${this.srUrl}`, { params })
      .toPromise()
      .then(response => {
        // const areas = response.content; busca com .content removida pq não estava retornando json
        const historico = response;

        const resultado = {
          historico,
          total: response.totalElements,
        };
        return resultado;
      });
  }

  pesquisarAreas(filtro: AreaFiltro): Promise<any> {

    this.srUrl = `${environment.agroApiUrl}/polygons`;

    let params = new HttpParams({
      fromObject: {
        page: filtro.pagina.toString(),
        size: filtro.itensPorPagina.toString()
      }
    });

    params = params.append('appid', this.appid);

    return this.http.get<any>(`${this.srUrl}`, { params })
      .toPromise()
      .then(response => {
        // const areas = response.content; busca com .content removida pq não estava retornando json
        const areas = response;

        const resultado = {
          areas,
          total: response.totalElements
        };
        console.log(areas);
        return resultado;
      });

    // return this.http.get(`${this.srUrl}`, {params}).toPromise();
    // return this.http.get(`${this.lancamentosUrl}?resumo`, { headers, params })

  }

  pesquisarImagens(filtro: ImagensFiltro, polyid: string, dataInicio: any, dataFim: any): Promise<any> {

    this.srUrl = `${environment.agroApiUrl}/image/search`;

    let params = new HttpParams();

    params = params.append('appid', this.appid);
    params = params.append('polyid', polyid);
    params = params.append('start', dataInicio);
    params = params.append('end', dataFim);

    return this.http.get<any>(`${this.srUrl}`, { params })
      .toPromise()
      .then(response => {
        // const areas = response.content; busca com .content removida pq não estava retornando json
        const areas = response;
        const tree = response as TreeNode[];

        const resultado = {
          areas,
          total: response.totalElements,
          tree
        };
        return resultado;
      });
  }

  adicionar(area: Area): Promise<Area> {
    //let headers = new HttpHeaders().append('Authorization', 'Basic YWRtaW5AYWxnYW1vbmV5LmNvbTphZG1pbg==');
    //headers = headers.append('Content-Type', 'application/json');

    let params = new HttpParams();
    params = params.set('appid', this.appid);

    return this.http.post<Area>(
      this.srUrl, area, {params})
      //this.srUrl, area)
      .toPromise();
  }
}
