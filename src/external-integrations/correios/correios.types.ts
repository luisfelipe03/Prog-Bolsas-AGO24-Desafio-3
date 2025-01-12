export interface CorreiosResponseItem {
  status: number;
  mensagemPrecoAgencia: string;
  prazo: string;
  url: string;
  mensagemPrecoPPN: string;
  codProdutoAgencia: string;
  precoPPN: string;
  codProdutoPPN: string;
  mensagemPrazo: string;
  msg: string;
  precoAgencia: string;
  urlTitulo: string;
}

export type CorreiosResponse = CorreiosResponseItem[];

export interface ClientFreightResponse {
  prazo: string;
  codProdutoAgencia: string;
  price: string;
  description: string;
}
