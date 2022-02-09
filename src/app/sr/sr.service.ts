import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
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

export class LoginAdb {
  login: string;
  password: string;
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
  adbAuthbUrl: string;
  adbUrl: string
  agroApiUrl: string;
  agroApiKey: string;

  constructor(private http: MoneyHttp, private httpClient: HttpClient) {
    // this.srUrl = `${environment.agroApiUrl}/polygons`;
    this.agroApiKey = '6475da62dd1776f8852048627272aad0'; // APIKEy do Agro API
    this.srUrl = `${environment.apiUrl}`;
    this.adbAuthbUrl = `${environment.adbAuth}`;
    this.adbUrl = `${environment.adb}`;
  }

  carregarInformacoesPoligono(polyid: string) {

    this.agroApiUrl = `${environment.agroApiUrl}/polygons/${polyid}`;

    let params = new HttpParams();

    params = params.append('appid', this.agroApiKey);

    return this.http.get<any>(`${this.agroApiUrl}`, { params })
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
    this.agroApiUrl = url;

    //let params = new HttpParams();

    //params = params.append('appid', this.appid);

    return this.http.get<any>(`${this.agroApiUrl}`)
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
    this.agroApiUrl = `${environment.agroApiUrl}/ndvi/history`;

    let params = new HttpParams();

    params = params.append('appid', this.agroApiKey);
    params = params.append('polyid', polyid);
    params = params.append('start', dataInicio);
    params = params.append('end', dataFim);

    return this.http.get<any>(`${this.agroApiUrl}`, { params })
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

    this.agroApiUrl = `${environment.agroApiUrl}/polygons`;

    let params = new HttpParams({
      fromObject: {
        page: filtro.pagina.toString(),
        size: filtro.itensPorPagina.toString()
      }
    });

    params = params.append('appid', this.agroApiKey);

    return this.http.get<any>(`${this.agroApiUrl}`, { params })
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

    this.agroApiUrl = `${environment.agroApiUrl}/image/search`;

    let params = new HttpParams();

    params = params.append('appid', this.agroApiKey);
    params = params.append('polyid', polyid);
    params = params.append('start', dataInicio);
    params = params.append('end', dataFim);

    return this.http.get<any>(`${this.agroApiUrl}`, { params })
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
    params = params.set('appid', this.agroApiKey);

    return this.http.post<Area>(
      this.agroApiUrl, area, {params})
      //this.srUrl, area)
      .toPromise();
  }

  vetorizarTif(link: string, nomeLayer: string): Promise<any> {

    let params = new HttpParams();
    params = params.set('link', link);
    params = params.set('nomeLayer', nomeLayer);

    return this.http.get<any>(`${this.srUrl}/sr`, {params})
      .toPromise()
      .then(response => {
        const json = response;
        return json;
      });
  }

  gerarTokenAdb(login: string, password: string): Promise<any> {

    const body = JSON.stringify({ login, password });

    return this.httpClient.post<any>(`${this.adbAuthbUrl}`, body, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/plain',
      },
      responseType: 'text' as 'json',
    })
      .toPromise()
      .then(response => {
        const token = response;
        return token;
      });
  }

  private getHeaders(token: string): HttpHeaders {
    return new HttpHeaders({
      Authorization: token,
      'Content-Type': 'application/json'
    });
  }

  integrarAdb(token: string, json: string, projectId: string): Promise<any> {

    //const body = JSON.stringify({ json });

    const headers = new HttpHeaders()
    .append('Authorization',  token )
    .append('Content-Type', 'application/json');

    console.log(token);
    console.log(json);

    return this.httpClient.post(`${this.adbUrl}/api/map/project/${projectId}/layer`, json, { headers }
    /*
      {
        headers: this.getHeaders(token)
      }
*/
      )
      .toPromise()
      .then(response => {
        return response;
      });

  }
}
