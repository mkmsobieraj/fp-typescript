export interface Monad<T> {
  map: <S> (mapper: (a: T) => S) => Monad<S>
  flatMap: <S> (mapper: (a: T) => Monad<S>) => Monad<S>
  unit: (a: T) => Monad<T>
}

// importnat FROM is fixed, so we can see this as Monad<TO>
// importnat 2 FROM is our AwesomeInterface, we just postpone dependency deliverence
export interface Reader<From, To> {
  invoke: (input: From) => To
  map: <NewTo> (mapper: (a: To) => NewTo) => Reader<From, NewTo>
  flatMap: <NewTo> (mapper: (a: To) => Reader<From, NewTo>) => Reader<From, NewTo>
  unit: (a: To) => Reader<From, To>
}

export class ReaderImpl<From, To> implements Reader<From, To> {
  private readonly fn: (from: From) => To

  constructor(fn: (from: From) => To) {
    this.fn = fn
  }

  invoke: (input: From) => To = (input: From) => this.fn(input)

  map: <NewTo> (mapper: (a: To) => NewTo) => Reader<From, NewTo> =
    <NewTo> (mapper: (a: To) => NewTo) => new ReaderImpl<From, NewTo>((from: From) => mapper(this.fn(from)))

  flatMap: <NewTo> (mapper: (a: To) => Reader<From, NewTo>) => ReaderImpl<From, NewTo> =
    <NewTo> (mapper: (a: To) => Reader<From, NewTo>) =>
    new ReaderImpl<From, NewTo>((from: From) => mapper(this.fn(from)).invoke(from))

  unit: (a: To) => ReaderImpl<From, To> = (a: To) => new ReaderImpl<From, To>(() => a)
}
