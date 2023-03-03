// Lets say we have a serice, that get Offer from outside world, and we
// need to calculate unit net price, availabilit in coutries and send beck
// complete offer

import { curry2 } from '../infrastructure/curry'
import { type Reader, ReaderImpl } from '../infrastructure/reader'

/* ______________________________ MODEL __________________________________ */

// external API, like Kafka, or something like that
export interface OfferRepository {
  get: (productType: ProductType) => Offer
  getAll: (productType: ProductType) => Offer[]
  push: (offer: Offer) => Offer
}

export interface Offer {
  // known values
  id: Uuid
  name: string
  amout: Amount
  productType: ProductType
  buckedId: Uuid

  // values to calcualte
  unitNetPrice?: Currency
  availableIn: Coutry[]
}

export interface Currency {
  get: (type: CurrencyType) => number
  getByCountry: (type: Coutry) => number
}

type ProductType = 'alcohol' | 'not-important-staff' | 'weed'

type Amount = number // should be positive integer implementation

type Uuid = string

type Coutry = 'PL' | 'US' | 'GB' | 'CZ' | 'JP' | 'CN'

type CurrencyType = 'PLN' | 'USD' | 'GBP' | 'CZK' | 'JPY' | 'CNY'

export type AvailabilityCalcualtor = (offer: Offer) => Coutry[]
export type CurrencyCalculator = (offer: Offer) => Currency

/* ______________________________ IMPLEMENTATION COMMON __________________________________ */

class CurrencyImpl implements Currency {
  get: (type: CurrencyType) => number = (type: CurrencyType) => 1
  getByCountry: (type: Coutry) => number = (type: Coutry) => 1
}

class OfferRepositoryImpl implements OfferRepository {
  private readonly offers: Offer[] = []

  getAll: (productType: ProductType) => Offer[] = (productType: ProductType) => (
    this.offers.filter((offer: Offer) => offer.productType === productType)
  )

  get: (productType: ProductType) => Offer = (productType: ProductType) => (
    this.getAll(productType)[0]
  )

  push: (offer: Offer) => Offer = (offer: Offer) => {
    this.offers.push(offer)
    return offer
  }
}

const offerRepository: OfferRepository = new OfferRepositoryImpl()

const offerCreator: (amount: Amount, productType: ProductType) => Offer = (amount: Amount, productType: ProductType) => (
  {
    id: 'random',
    name: 'name',
    amout: amount,
    productType,
    buckedId: '',
    unitNetPrice: undefined,
    availableIn: []
  }
)

const dummyAvailabilityCalcualtor: AvailabilityCalcualtor = (offer: Offer) => ['PL']
const dummyCurrencyCalculator: CurrencyCalculator = (offer: Offer) => new CurrencyImpl()

/* ______________________________ FIRST APPROACH __________________________________ */

// wee already need to specyfy repository here
export type ClacculateAllAlcoholRevenewForCountry = (offerRepository: OfferRepository, country: Coutry) => Amount

export type AddOffer = (offerRepository: OfferRepository, offer: Offer) => void
export type GetOffer = (offerRepository: OfferRepository, productType: ProductType) => Offer

// we take AddOffer and GetOffer here becouse we do not want our business code to be depend on repository
export type UpdateOffer = (
  roductType: ProductType,
  availabilityCalcualtor: AvailabilityCalcualtor,
  currencyCalculator: CurrencyCalculator,
  addOffer: (offer: Offer) => void,
  getOffer: (productType: ProductType) => Offer
) => Offer

const addOffer: AddOffer = (offerRepository: OfferRepository, offer: Offer) => offerRepository.push(offer)
const getOffer: GetOffer = (offerRepository: OfferRepository, productType: ProductType) => offerRepository.get(productType)

const clacculateAllAlcoholRevenewForCountry: ClacculateAllAlcoholRevenewForCountry = (offerRepository: OfferRepository, country: Coutry) => (
  offerRepository.getAll('alcohol')
    .filter((offer: Offer) => offer.availableIn.includes(country))
    .map((offer: Offer) => offer.amout)
    .reduce((a: Amount, b: Amount) => a + b, 0)
)

const createInitialOffers: () => void = () => {
  addOffer(offerRepository, offerCreator(1, 'alcohol'))
  addOffer(offerRepository, offerCreator(2, 'not-important-staff'))
  addOffer(offerRepository, offerCreator(7, 'weed'))
}

const updateOffer: UpdateOffer = (
  productType: ProductType,
  availabilityCalcualtor: AvailabilityCalcualtor,
  currencyCalculator: CurrencyCalculator,
  addOffer: (offer: Offer) => void,
  getOffer: (productType: ProductType) => Offer
) => {
  const current: Offer = getOffer(productType)
  const newOne: Offer = {
    ...current,
    availableIn: availabilityCalcualtor(current),
    unitNetPrice: currencyCalculator(current)
  }
  addOffer(newOne)
  return newOne
}

createInitialOffers()
updateOffer('alcohol', dummyAvailabilityCalcualtor, dummyCurrencyCalculator, curry2(addOffer)(offerRepository), curry2(getOffer)(offerRepository))
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const totalRevenewForPL: Amount = clacculateAllAlcoholRevenewForCountry(offerRepository, 'PL')

/* ______________________________ SECOND OOP APPROACH __________________________________ */

// maybe we try clasic OOP aproach, and do sth with offerRepository?

class OfferService {
  private readonly offerRepository: OfferRepository

  constructor(offerRepository: OfferRepository) {
    this.offerRepository = offerRepository
  }

  readonly addOffer: (offer: Offer) => void = (offer: Offer) => this.offerRepository.push(offer)
  readonly getOffer: (productType: ProductType) => Offer = (productType: ProductType) => this.offerRepository.get(productType)

  readonly clacculateAllAlcoholRevenewForCountry: (country: Coutry) => Amount = (country: Coutry) => (
    this.offerRepository.getAll('alcohol')
      .filter((offer: Offer) => offer.availableIn.includes(country))
      .map((offer: Offer) => offer.amout)
      .reduce((a: Amount, b: Amount) => a + b, 0)
  )
}

class OfferUpdater {
  private readonly offerService: OfferService

  constructor(offerService: OfferService) {
    this.offerService = offerService
  }

  readonly updateOffer: (
    roductType: ProductType,
    availabilityCalcualtor: AvailabilityCalcualtor,
    currencyCalculator: CurrencyCalculator,
  ) => Offer =
      (
        productType: ProductType,
        availabilityCalcualtor: AvailabilityCalcualtor,
        currencyCalculator: CurrencyCalculator
      ) => {
        const current: Offer = this.offerService.getOffer(productType)
        const newOne: Offer = {
          ...current,
          availableIn: availabilityCalcualtor(current),
          unitNetPrice: currencyCalculator(current)
        }
        this.offerService.addOffer(newOne)
        return newOne
      }

  readonly createInitialOffers: () => void = () => {
    this.offerService.addOffer(offerCreator(1, 'alcohol'))
    this.offerService.addOffer(offerCreator(2, 'not-important-staff'))
    this.offerService.addOffer(offerCreator(7, 'weed'))
  }
}

const offerService: OfferService = new OfferService(offerRepository) // everything nice, but I already need to know offerRepository here
const offerUpdater: OfferUpdater = new OfferUpdater(offerService) // and what if i decided that i need anothere repository here?

offerUpdater.createInitialOffers()
offerUpdater.updateOffer('alcohol', dummyAvailabilityCalcualtor, dummyCurrencyCalculator)

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const totalRevenewForPL2: Amount = offerService.clacculateAllAlcoholRevenewForCountry('PL')

/* ______________________________ THIRD MORE FP APPROACH __________________________________ */

export type ClacculateAllAlcoholRevenewForCountryFp = (country: Coutry) => (offerRepository: OfferRepository) => Amount

export type AddOfferFp = (offer: Offer) => (offerRepository: OfferRepository) => void
export type GetOfferFp = (productType: ProductType) => (offerRepository: OfferRepository) => Offer

const addOfferFp: AddOfferFp = (offer: Offer) => (offerRepository: OfferRepository) => offerRepository.push(offer)
const getOfferFp: GetOfferFp = (productType: ProductType) => (offerRepository: OfferRepository) => offerRepository.get(productType)

export type UpdateOfferFp = (
  roductType: ProductType,
  availabilityCalcualtor: AvailabilityCalcualtor,
  currencyCalculator: CurrencyCalculator,
  addOffer: AddOfferFp,
  getOffer: GetOfferFp
) => (offerRepository: OfferRepository) => Offer

const clacculateAllAlcoholRevenewForCountryFp: ClacculateAllAlcoholRevenewForCountryFp = (country: Coutry) => (offerRepository: OfferRepository) => (
  offerRepository.getAll('alcohol')
    .filter((offer: Offer) => offer.availableIn.includes(country))
    .map((offer: Offer) => offer.amout)
    .reduce((a: Amount, b: Amount) => a + b, 0)
)

const createInitialOffersFp: (offerRepository: OfferRepository) => void = (offerRepository: OfferRepository) => {
  addOfferFp(offerCreator(1, 'alcohol'))(offerRepository)
  addOfferFp(offerCreator(2, 'not-important-staff'))(offerRepository)
  addOfferFp(offerCreator(7, 'weed'))(offerRepository) // not nice, I have to pass offer repository three times :(
}

const updateOfferFp: UpdateOfferFp = (
  productType: ProductType,
  availabilityCalcualtor: AvailabilityCalcualtor,
  currencyCalculator: CurrencyCalculator,
  addOffer: AddOfferFp,
  getOffer: GetOfferFp
) => (offerRepository: OfferRepository) => {
  const current: Offer = getOffer(productType)(offerRepository)
  const newOne: Offer = {
    ...current,
    availableIn: availabilityCalcualtor(current),
    unitNetPrice: currencyCalculator(current)
  }
  addOffer(newOne)(offerRepository)
  return newOne
}

createInitialOffersFp(offerRepository)

const offerUpdaterFp: (offerRepository: OfferRepository) => Offer = updateOfferFp('alcohol', dummyAvailabilityCalcualtor, dummyCurrencyCalculator, addOfferFp, getOfferFp) // I do not need Repo and curry2 here!
// ...
// some business code
// ...
// ond on infrastracture level
offerUpdaterFp(offerRepository)

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const totalRevenewForPL3: Amount = clacculateAllAlcoholRevenewForCountryFp('PL')(offerRepository) // I can deliver repo right away if I want

/* ______________________________ FFOURTH ABSTRACT OVER THIRD APPROACH __________________________________ */

export type OfferReader<T> = Reader<OfferRepository, T>

export type ClacculateAllAlcoholRevenewForCountryR = (country: Coutry) => OfferReader<Amount>

export type AddOfferR = (offer: Offer) => OfferReader<void>
export type GetOfferR = (productType: ProductType) => OfferReader<Offer>

const addOfferR: AddOfferR = (offer: Offer) => new ReaderImpl(
  (offerRepository: OfferRepository) => { offerRepository.push(offer) }
)
const getOfferR: GetOfferR = (productType: ProductType) => new ReaderImpl(
  (offerRepository: OfferRepository) => offerRepository.get(productType)
)

export type UpdateOfferR = (
  roductType: ProductType,
  availabilityCalcualtor: AvailabilityCalcualtor,
  currencyCalculator: CurrencyCalculator,
  addOffer: AddOfferR,
  getOffer: GetOfferR
) => OfferReader<Offer>

const clacculateAllAlcoholRevenewForCountryR: ClacculateAllAlcoholRevenewForCountryR = (country: Coutry) => new ReaderImpl(
  (offerRepository: OfferRepository) => (
    offerRepository.getAll('alcohol')
      .filter((offer: Offer) => offer.availableIn.includes(country))
      .map((offer: Offer) => offer.amout)
      .reduce((a: Amount, b: Amount) => a + b, 0)
  )
)

const createInitialOffersR: (offerRepository: OfferRepository) => void = (offerRepository: OfferRepository) => {
  addOfferR(offerCreator(1, 'alcohol'))
    .flatMap(() => (addOfferR(offerCreator(2, 'not-important-staff'))))
    .flatMap(() => (addOfferR(offerCreator(7, 'weed')))).invoke(offerRepository) // only one offerRepository reference
}

const updateOfferR: UpdateOfferR = (
  productType: ProductType,
  availabilityCalcualtor: AvailabilityCalcualtor,
  currencyCalculator: CurrencyCalculator,
  addOffer: AddOfferR,
  getOffer: GetOfferR
) => getOffer(productType) // compere to before, how much nicer is that ;)
  .map<Offer>((current: Offer) => (
  {
    ...current,
    availableIn: availabilityCalcualtor(current),
    unitNetPrice: currencyCalculator(current)
  }
))
  .also((newOne: Offer) => addOffer(newOne))

createInitialOffersR(offerRepository)

const offerUpdaterR: OfferReader<Offer> = updateOfferR('alcohol', dummyAvailabilityCalcualtor, dummyCurrencyCalculator, addOfferR, getOfferR)
// ...
// some business code
// ...
// ond on infrastracture level
offerUpdaterR.invoke(offerRepository)

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const totalRevenewForPL4: Amount = clacculateAllAlcoholRevenewForCountryR('PL').invoke(offerRepository) // I can deliver repo right away if I want
