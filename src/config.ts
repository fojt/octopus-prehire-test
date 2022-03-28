export const config =  {
  api: {
    currenciesList: './assets/data/currencies.json',
    currenciesListDelay: 500,
    currencyDetail: (currencyCode:string) => './assets/data/' + currencyCode.toLocaleLowerCase() + '.json',
    currencyDetailDelay: 300
  },
  detail: {
    numberOfMonths: 12
  }
};
