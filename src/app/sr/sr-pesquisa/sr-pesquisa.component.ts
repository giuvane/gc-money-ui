import { Component, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { Table } from 'primeng/components/table/table';
import { ToastyService } from 'ng2-toasty';

import { AreaFiltro, SrService } from '../sr.service';
import { AuthService } from 'src/app/seguranca/auth.service';
import { ConfirmationService } from 'primeng/api';
import { ErrorHandlerService } from 'src/app/core/error-handler.service';
import { LazyLoadEvent } from 'primeng/components/common/api';


@Component({
  selector: 'app-sr-pesquisa',
  templateUrl: './sr-pesquisa.component.html',
  styleUrls: ['./sr-pesquisa.component.css']
})
export class SrPesquisaComponent implements OnInit {

  totalRegistros = 0;
  filtro = new AreaFiltro();
  areas = [];
  @ViewChild('tabela', {static: true}) grid: Table;

  constructor(
    private srService: SrService,
    public auth: AuthService,
    private toasty: ToastyService,
    private confirmation: ConfirmationService,
    private errorHandler: ErrorHandlerService,
    private title: Title
    ) { }

  ngOnInit(): void {
    // this.pesquisar();
    this.title.setTitle('Pesquisa de áreas');
  }

  pesquisar(pagina = 0) {
    this.filtro.pagina = pagina;

    this.srService.pesquisarAreas(this.filtro)
      .then(resultado => {
        this.totalRegistros = resultado.total;
        this.areas = resultado.areas;
      })
      .catch(erro => this.errorHandler.handle(erro));
  }

  aoMudarPagina(event: LazyLoadEvent) {
    const pagina = event.first / event.rows;
    this.pesquisar(pagina);
    console.log(event);
  }

  confirmarExclusao(area: any) {
    /*
    this.confirmation.confirm({
      message: 'Tem certeza que deseja excluir?',
      accept: () => {
        // Chamado quando o usuário confirma o dialog
        this.excluir(lancamento);
      }
    });
    */
  }

  excluir(area: any) {
    /*
    this.lancamentoService.excluir(lancamento.codigo)
      .then(() => {
        this.grid.reset();
        // console.log(`Excluído com sucesso ${lancamento.descricao}`);

        this.toasty.success('Lançamento excluído com sucesso!');
      })
      .catch(erro => this.errorHandler.handle(erro));
      */
  }

}
