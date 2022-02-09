export class Estado {
  codigo: number;
  nome: string;
}

export class Cidade {
  codigo: number;
  nome: string;
  estado = new Estado();
}

export class Endereco {
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cep: string;
  cidade = new Cidade();
}

export class Contato {
  codigo: number;
  nome: string;
  email: string;
  telefone: string;

  constructor(
    codigo?: number,
    nome?: string,
    email?: string,
    telefone?: string) {
      this.codigo = codigo;
      this.nome = nome;
      this.email = email;
      this.telefone = telefone;
  }
}

export class Pessoa {
  codigo: number;
  nome: string;
  endereco = new Endereco();
  ativo = true;
  contatos = new Array<Contato>();
}

export class Categoria {
  codigo: number;
}

export class Lancamento {
  codigo: number;
  tipo = 'RECEITA';
  descricao: string;
  dataVencimento: Date;
  dataPagamento: Date;
  valor: number;
  observacao: string;
  pessoa = new Pessoa();
  categoria = new Categoria();
  anexo: string;
  urlAnexo: string;
}

export class AgroApiKey {
  codigo: number;
  nome: string;
  apikey: string;
  ativo = true;
  usuario: string;
}

export class Area {
  id: number;
  geo_json = {};
  name: string;
  center = [];
  area: number;
  user_id: string;
  created_at: Date;
}

export class AreaImagem {
  dt: Date;
  type: string;
  dc: number;
  cl: number;
  sun: {};
  image: {
    truecolor: string;
    falsecolor: string;
    ndvi: string;
    evi: string;
    evi2: string;
    dswi: string;
    ndwi: string;
    nri: string;
  };
  tile: {
    truecolor: string;
    falsecolor: string;
    ndvi: string;
    evi: string;
    evi2: string;
    dswi: string;
    ndwi: string;
    nri: string;
  };
  stats: {
    ndvi: string;
    evi: string;
    evi2: string;
    dswi: string;
    ndwi: string;
    nri: string;
  };
  data: {
    truecolor: string;
    falsecolor: string;
    ndvi: string;
    evi: string;
    evi2: string;
    dswi: string;
    ndwi: string;
    nri: string;
  };
}

export class Historico {
  dt: Date;
  type: string;
  zoom: number;
  dc: number;
  cl: number;
  data: {
    std: string;
    p75: string;
    min: string;
    max: string;
    median: string;
    p25: string;
    num: string;
    mean: string;
  };
}

export class AreaEstatisticas {
  std: number;
  p25: number;
  num: number;
  min: number;
  max: number;
  median: number;
  p75: number;
  mean: number;
}

export class EstatisticaTable {
  key: string;
  value: string;
}

export class TreeImagens {
  data = new Array<TreeDados>();
}

export class TreeDados {
  label: string;
  data: string;
  expandedIcon: string;
  collapsedIcon: string;
  children = new Array<TreeDados>();
}

export interface Product {
  id?:string;
  code?:string;
  name?:string;
  description?:string;
  price?:number;
  quantity?:number;
  inventoryStatus?:string;
  category?:string;
  image?:string;
  rating?:number;
}
