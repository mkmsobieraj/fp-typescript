export interface Product {
  id: uuid
};

export interface Offer {
  id: uuid
  amout: Amount
  unitNetPrice: Currency
  availableIn: Coutry[]
}

export interface Currency {
  get: (type: CurrencyType) => number
  getByCountry: (type: Coutry) => number
}

type Amount = number // should be positive integer implementation

type uuid = string

type Coutry = 'PL' | 'US' | 'GB' | 'CZ' | 'JP' | 'CN'

type CurrencyType = 'PLN' | 'USD' | 'GBP' | 'CZK' | 'JPY' | 'CNY'

export type availabilityCalcualtor = () => Coutry[]
export type currencyCalculator = () => number
export type getCurrencyExchangeRate = (currencyType: CurrencyType) => number[]
export type createGetCurrentExchangeRate = (repository: any) => getCurrencyExchangeRate
