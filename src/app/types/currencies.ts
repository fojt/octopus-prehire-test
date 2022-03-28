export interface Currency {
  readonly code: string;
  readonly country: string;
}

export interface CurrenciesResponse {
  readonly currencies: Currency[]
}

export interface CurrencyDetailResponse {
  readonly rates: number[]
}
