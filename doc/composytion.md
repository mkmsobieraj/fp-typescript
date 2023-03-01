# Composition

First exaple defitinon from the internet define compoosition as follows

> Composition is the design technique in object-oriented programming to implement has-a relationship between objects. Composition in java is achieved by using instance variables of other objects. For example, a person who has a Job is implemented like below in java object-oriented programming.
>
> [digitalocean](https://www.digitalocean.com/community/tutorials/composition-vs-inheritance)

# Dependecy Injection

> In software engineering, dependency injection is a design pattern in which an object or function receives other objects or functions that it depends on. A form of inversion of control, dependency injection aims to separate the concerns of constructing objects and using them, leading to loosely coupled programs. The pattern ensures that an object or function which wants to use a given service should not have to know how to construct those services. Instead, the receiving 'client' (object or function) is provided with its dependencies by external code (an 'injector'), which it is not aware of.
>
> [wikipedia](https://en.wikipedia.org/wiki/Dependency_injection)


# How do we do it in classic oop

```ts
class AwesomeClass implements AwesomeInterface {
  private readonly service: Service
  
  constructor(service: Service) { // why this is "class argument"?
    this.service = service;
  }

  method1: (arg1: Arg1, arg2: Arg2) => number = // and this are method arguments?
    (arg1: Arg1, arg2: Arg2) => arg1.getSth + arg2.getSth + service.findSth


  method2: (arg1: Arg3) => number = 
    (arg1: Arg3) => arg13.getSth + service.findSthElse
}

// ...

const serviceImpl: Service = new ServiceImpl(/* someargs */)
const awesomeClass: AwesomeInterface= new AwesomeClass(serviceImpl)

```

Almost but not realy, we use DI tools to inject AwesomeClass for us. Why do we do it?

# How do we do itin fn

## Bed approach

```ts

  const method1: (arg1: Arg1, arg2: Arg2) => number = 
    (arg1: Arg1, arg2: Arg2) => arg1.getSth() + new Service().findSth(arg2)


  const method2: (arg1: Arg3) => number = 
    (arg1: Arg3) => arg3.getSth() + new Service().findSthElse()

 // or

  const method1: (arg1: Arg1, arg2: Arg2) => number = (arg1: Arg1, arg2: Arg2) => {
      const findSth: (arg2: Arg2) => number = (arg2: Arg2) => {/*implementation*/}
      return arg1.getSth() + findSth(arg2)
  }


  const method2: (arg1: Arg3) => number = (arg1: Arg3) => {
    const findSthElse: () => number = () => {/*implementation*/}
    return arg3.getSth() + findSthElse()
  }

```

## Better approach

```ts
```

### Best? approach

```ts
```