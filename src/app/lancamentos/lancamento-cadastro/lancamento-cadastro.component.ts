import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { ToastyService } from 'ng2-toasty';
import { MessageService } from 'primeng/api';
import {Message} from 'primeng/api';

import { CategoriaService } from './../../categorias/categoria.service';
import { ErrorHandlerService } from 'src/app/core/error-handler.service';
import { PessoaService } from 'src/app/pessoas/pessoa.service';
import { Lancamento } from 'src/app/core/model';
import { LancamentoService } from '../lancamento.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-lancamento-cadastro',
  templateUrl: './lancamento-cadastro.component.html',
  styleUrls: ['./lancamento-cadastro.component.css']
})
export class LancamentoCadastroComponent implements OnInit {

  tipos = [
    { label: 'Receita', value: 'RECEITA' },
    { label: 'Despesa', value: 'DESPESA' }
  ];

  categorias = [];
  pessoas = [];
  // lancamento = new Lancamento(); // Migrado para formulário reativo e utilizada a propriedade formulario
  formulario: FormGroup;
  uploadEmAndamento = false;

  constructor(
    private categoriaService: CategoriaService,
    private pessoaService: PessoaService,
    private lancamentoService: LancamentoService,
    private toasty: ToastyService,
    private messageService: MessageService,
    private errorHandler: ErrorHandlerService,
    private route: ActivatedRoute,
    private router: Router,
    private title: Title,
    private formBuilder: FormBuilder
    ) { }

  ngOnInit() {

    // Chama o método que configura o foromulário reativo
    this.configurarFormulario();

    this.title.setTitle('Novo lançamento');

    // Variável e método utilizado em caso de edição de lançamento
    const codigoLancamento = this.route.snapshot.params['codigo'];

    if (codigoLancamento) {
      this.carregarLancamentoEdicao(codigoLancamento);
    }
    // console.log(this.route.snapshot.params['codigo']);

    this.carregarCategorias();
    this.carregarPessoas();
  }

  antesUploadAnexo(event: FormData) {

    //console.log(event);
    //event.xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token'));

    this.uploadEmAndamento = true;
  }

  aoTerminarUploadAnexo(event) {

    const anexo = event.originalEvent.body;

    this.formulario.patchValue({
      anexo: anexo.nome,
      urlAnexo: anexo.url
    });

    this.uploadEmAndamento = false;
  }

  erroUpload(event) {
    //this.toasty.error("Erro ao tentar enviar anexo");
    this.messageService.add({ severity: 'error', summary: 'Error Message', detail: 'Erro ao tentar enviar anexo' });

    this.uploadEmAndamento = false;
  }

  removerAnexo() {
    this.formulario.patchValue({
      anexo: null,
      urlAnexo: null
    });
  }

  get nomeAnexo() {
    const nome = this.formulario.get('anexo').value;

    if (nome) {
      return nome.substring(nome.indexOf('_') + 1, nome.length);
    }

    return '';
  }

  get urlUploadAnexo() {
    return this.lancamentoService.urlUploadAnexo();
  }

  // Método utilizado para iniciar o formulário reativo
  configurarFormulario() {
    this.formulario = this.formBuilder.group({
      codigo: [],
      tipo: ['RECEITA', Validators.required],
      dataVencimento: [null, Validators.required],
      dataPagamento: [],
      // descricao: [null, [Validators.required, Validators.minLength(5)]], // Substituído por validações customizadas
      descricao: [null, [this.validarCampoObrigatorio, this.validarTamanhoMinimo(5)]], // Validação customizada aplicada
      valor: [null, Validators.required],
      pessoa: this.formBuilder.group({
        codigo: [null, Validators.required],
        nome: []
      }),
      categoria: this.formBuilder.group({
        codigo: [null, Validators.required],
        nome: []
      }),
      observacao: [],
      anexo: [],
      urlAnexo: []
    });
  }

  validarCampoObrigatorio(intput: FormControl) {
    return (intput.value ? null : { obrigatoriedade: true });
  }

  validarTamanhoMinimo(valor: number) {
    return (input: FormControl) => {
      return (!input.value || input.value.length >= valor) ? null : {tamanhoMinimo: {tamanho: valor } };
    }
  }

  get editando() {
    //return Boolean(this.lancamento.codigo);
    return Boolean(this.formulario.get('codigo').value);
  }

  carregarLancamentoEdicao(codigo: number) {

    this.lancamentoService.buscarPorCodigo(codigo)
    .then(lancamento => {
      //this.lancamento = lancamento;
      this.formulario.patchValue(lancamento);
      this.atualizarTituloEdicao();
    })
    .catch(error => this.errorHandler.handle(error));
  }

  salvar() {
    if (this.editando) {
      this.atualizarLancamento();
    } else {
      this.adicionarLancamento();
    }
  }

  adicionarLancamento() {
    //this.lancamentoService.adicionar(this.lancamento)
    this.lancamentoService.adicionar(this.formulario.value)
      .then(lancamentoAdicionado => {
        //this.toasty.success('Lançamento adicionado com sucesso!');
        this.messageService.add({ severity: 'success', detail: 'Lançamento adicionado com sucesso!' });

        // form.reset();
        // this.lancamento = new Lancamento();
        this.router.navigate(['/lancamentos', lancamentoAdicionado.codigo]);
      })
      .catch(erro => this.errorHandler.handle(erro));
  }

  atualizarLancamento() {
    //this.lancamentoService.atualizar(this.lancamento)
    this.lancamentoService.atualizar(this.formulario.value)
      .then(lancamento => {
        //this.lancamento = lancamento;
        this.formulario.patchValue(lancamento);

        //this.toasty.success('Lançamento alterado com sucesso!');
        this.messageService.add({ severity: 'success', detail: 'Lançamento alterado com sucesso!', });

        this.atualizarTituloEdicao();
      })
      .catch(erro => this.errorHandler.handle(erro));
  }

  carregarCategorias() {
    return this.categoriaService.listarTodas()
      .then(categorias => {
        this.categorias = categorias.map(c => ({ label: c.nome, value: c.codigo }));
      })
      .catch(erro => this.errorHandler.handle(erro));
  }

  carregarPessoas() {
    return this.pessoaService.listarTodas()
      .then(pessoas => {
        this.pessoas = pessoas.map(p => ({ label: p.nome, value: p.codigo }));
      })
      .catch(erro => this.errorHandler.handle(erro));
  }

  novo() {
    //form.reset();
    this.formulario.reset();

    // setTimeout utilizado para corrigir componente RECEITA/DESPESA que não estava mantendo seu valor default
    // bind() utilizado para "this" utilizar o escopo da classe LancamentoCadastroComponent
    // ambos são recursos do javascript
    setTimeout(function() {
      this.lancamento = new Lancamento();
    }.bind(this), 1);
    this.router.navigate(['/lancamentos/novo']);
  }

  atualizarTituloEdicao() {
    //this.title.setTitle(`Edição de lançamento ${this.lancamento.descricao}`);
    this.title.setTitle(`Edição de lançamento ${this.formulario.get('descricao').value}`);
  }

}
