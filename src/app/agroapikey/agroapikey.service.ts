import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { MoneyHttp } from '../seguranca/money-http';
import { environment } from './../../environments/environment';
import { AgroApiKey } from '../core/model';

export class AgroapikeyFiltro {
  nome: string;
  pagina = 0;
  itensPorPagina = 5;
}

@Injectable({
  providedIn: 'root'
})
export class AgroapikeyService {

  agroApiKeyUrl: string;
  usuarioUrl: string;

  constructor(private http: MoneyHttp, private httpClient: HttpClient) {
    //this.agroApiKey = '6475da62dd1776f8852048627272aad0'; do jovem
    this.agroApiKeyUrl = `${environment.apiUrl}/agro-api-key`;
    this.usuarioUrl = `${environment.apiUrl}/usuario`
  }

  listarUsuarios(): Promise<any[]> {
    return this.http.get<any>(`${this.usuarioUrl}`)
      .toPromise()
  }

  getAllAgroApiKey() {
    return this.http.get<any>(`${this.agroApiKeyUrl}`)
      .toPromise()
      .then(response => {
        const agroApiKeys = response;
        console.log(agroApiKeys)
        const resultado = {
          agroApiKeys,
          total: response.totalElements,
        };
        return resultado;
      });
  }

  deleteAgroApiKey(codigo: number): Promise<void> {
    return this.http.delete(`${this.agroApiKeyUrl}/${codigo}`)
      .toPromise()
      .then(() => null);
  }

  buscarPorCodigo(codigo: number): Promise<AgroApiKey> {
    return this.http.get<AgroApiKey>(`${this.agroApiKeyUrl}/${codigo}`)
      .toPromise();
  }

  adicionar(agroApiKey: AgroApiKey): Promise<AgroApiKey> {
    return this.http.post<AgroApiKey>(
      this.agroApiKeyUrl, agroApiKey)
      .toPromise();
  }

  atualizar(agroApiKey: AgroApiKey): Promise<AgroApiKey> {
    return this.http.put<AgroApiKey>(
      `${this.agroApiKeyUrl}/${agroApiKey.codigo}`, agroApiKey)
      .toPromise();
  }
}
