import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import * as moment from 'moment'; // Biblioteca momento.js utilizada para conversão de formatos de data
import { Lancamento } from 'src/app/core/model';
import { environment } from './../../environments/environment';
import { MoneyHttp } from '../seguranca/money-http';

// Interface criada para obrigar que seja passada uma descricao no método pesquisar()
export class LancamentoFiltro {
  descricao: string;
  dataVencimentoInicio: Date;
  dataVencimentoFim: Date;
  pagina = 0;
  itensPorPagina = 5;
}

@Injectable({
  providedIn: 'root'
})
export class LancamentoService {

  //lancamentosUrl = 'http://localhost:8080/lancamentos';
  lancamentosUrl: string;

  // Removido quando alterado de basic-security para oauth2
  // constructor(private http: HttpClient) { }
  constructor(private http: MoneyHttp) {
    this.lancamentosUrl = `${environment.apiUrl}/lancamentos`;
  }


  urlUploadAnexo(): string {
    return `${this.lancamentosUrl}/anexo`;
  }

  // Biblioteca momento.js utilizada para conversão de formatos de data
  pesquisar(filtro: LancamentoFiltro): Promise<any> {
    // Na migração de basic-security para oauth2 não é mais necessário este header
    // seguranca.module.ts recupera o token de acesso e injeta automaticamente nas requisições http
    // const headers = new HttpHeaders().append('Authorization', 'Basic YWRtaW5AYWxnYW1vbmV5LmNvbTphZG1pbg==');

    /* Alterado abaixo, de forma mais elegante
    let params = new HttpParams();

    params = params.set('page', filtro.pagina.toString());
    params = params.set('size', filtro.itensPorPagina.toString());
    */
    let params = new HttpParams({
      fromObject: {
        page: filtro.pagina.toString(),
        size: filtro.itensPorPagina.toString()
      }
    });

    if (filtro.descricao) {
      params = params.append('descricao', filtro.descricao);
    }

    if (filtro.dataVencimentoInicio) {
      params = params.append('dataVencimentoDe', moment(filtro.dataVencimentoInicio).format('YYYY-MM-DD'));
    }

    if (filtro.dataVencimentoFim) {
        params = params.append('dataVencimentoAte', moment(filtro.dataVencimentoFim).format('YYYY-MM-DD'));
    }

    // return this.http.get(`${this.lancamentosUrl}?resumo`, { headers, params })
    return this.http.get<any>(`${this.lancamentosUrl}?resumo`, { params })
      .toPromise()
      .then(response => {
        const lancamentos = response.content;

        const resultado = {
          lancamentos,
          total: response.totalElements
        };
        return resultado;
      });

    // return this.http.get(`${this.lancamentosUrl}?resumo`).toPromise();
  }

  excluir(codigo: number): Promise<void> {
    //const headers = new HttpHeaders().append('Authorization', 'Basic YWRtaW5AYWxnYW1vbmV5LmNvbTphZG1pbg==');

    //return this.http.delete(`${this.lancamentosUrl}/${codigo}`, { headers })
    return this.http.delete(`${this.lancamentosUrl}/${codigo}`)
      .toPromise()
      .then(() => null);
  }

  adicionar(lancamento: Lancamento): Promise<Lancamento> {
    //let headers = new HttpHeaders().append('Authorization', 'Basic YWRtaW5AYWxnYW1vbmV5LmNvbTphZG1pbg==');
    //headers = headers.append('Content-Type', 'application/json');

    return this.http.post<Lancamento>(
      //this.lancamentosUrl, lancamento, {headers})
      this.lancamentosUrl, lancamento)
      .toPromise();
  }

  atualizar(lancamento: Lancamento): Promise<Lancamento> {
    //let headers = new HttpHeaders().append('Authorization', 'Basic YWRtaW5AYWxnYW1vbmV5LmNvbTphZG1pbg==');
    //headers = headers.append('Content-Type', 'application/json');

    return this.http.put<Lancamento>(
      //`${this.lancamentosUrl}/${lancamento.codigo}`, lancamento, {headers})
      `${this.lancamentosUrl}/${lancamento.codigo}`, lancamento)
      .toPromise()
      .then(response => {
        const lancamentoAlterado = response;
        this.converterStringsParaDatas([lancamentoAlterado]);
        return lancamentoAlterado;
      });
  }

  buscarPorCodigo(codigo: number): Promise<Lancamento> {
    //const headers = new HttpHeaders().append('Authorization', 'Basic YWRtaW5AYWxnYW1vbmV5LmNvbTphZG1pbg==');

    //return this.http.get<Lancamento>(`${this.lancamentosUrl}/${codigo}`, { headers })
    return this.http.get<Lancamento>(`${this.lancamentosUrl}/${codigo}`)
      .toPromise()
      .then(response => {
        const lancamento = response;
        this.converterStringsParaDatas([lancamento]);
        return lancamento;
      });
  }

  private converterStringsParaDatas(lancamentos: Lancamento[]) {
    for (const lancamento of lancamentos) {
      lancamento.dataVencimento = moment(lancamento.dataVencimento,
        'YYYY-MM-DD').toDate();

      if (lancamento.dataPagamento) {
        lancamento.dataPagamento = moment(lancamento.dataPagamento,
          'YYYY-MM-DD').toDate();
      }
    }
  }
}
