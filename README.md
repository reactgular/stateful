[![Build Status](https://travis-ci.org/reactgular/stateful.svg?branch=master)](https://travis-ci.org/reactgular/stateful)
[![Coverage Status](https://coveralls.io/repos/github/reactgular/stateful/badge.svg?branch=master)](https://coveralls.io/github/reactgular/stateful?branch=master)
[![npm version](https://badge.fury.io/js/%40reactgular%2Fstateful.svg)](https://badge.fury.io/js/%40reactgular%2Fstateful)

## What is Stateful?

Stateful is a tiny state manager for TypeScript and [RxJS](https://github.com/ReactiveX/RxJS) projects. It's a class that encapsulates a [BehaviorSubject](https://www.learnrxjs.io/subjects/behaviorsubject.html) and 
provides basic store manipulation methods. It's indented for use in small classes that don't need the complexity of a larger state manager.

Stateful is about **1kb** in size after *minification*. 

## Installation

To get started, install the package from npm.

```bash
npm install --save @reactgular/stateful
```

## Usage

Stateful is small, simple and easy to use.

- You construct a Stateful object with a *default state* and use an interface to define the *state object* type.
- You can then `patch()`, `set()` and `reset()` the internal state.
- You use `select()` to create observables of state property changes, and `selector()` to create custom selectors.

```typescript
import {Stateful} from '@reactgular/stateful';

interface ExampleState {name: string; count: number; }
const state = new Stateful<ExampleState>({name: "Example", count: 4});
state.patch({name: 'Something'});
state.select('name').subscribe(value => console.log(value)); // prints "Something"
```

# Stateful Class

Usage documentation for the `Stateful<TState>` class.

#### Properties

- `state$`: An observable that emits all changes to the state.

#### Methods

- `complete()`: Stops emitting changes made to the state.
- `default()`: Returns the default state used with the constructor or reset.
- `patch(state: Partial<TState>)`: Patches the current state with partial values.
- `patch<TKey extends keyof TState>(name: TKey, value: TState[TKey])`: Patches a single property on the state with a value.
- `reset(defaultState?: TState)`: Resets the state to the original state used by the constructor, or updates the original state with the passed argument.
- `select<TKey extends keyof TState>(name: TKey): Observable<TState[TKey]>`: Creates an observable that emits values from a property on the state object.
- `selector<TValue>(selector: (s: TState) => TValue): Observable<TValue>`: Creates an observable that emits values produced by the selector function. 
- `set(state: TState)`: Sets the current state.
- `snapshot(): TState`: Peeks at the current internal state.

## Examples

You can create *selectors* from the state by using property names. TypeScript will *infer* the correct `Observable<Type>` from the property key.

```typescript
import {Stateful} from '@reactgular/stateful';

interface ExampleState {name: string; count: number; }
const state = new Stateful<ExampleState>({name: "Example", count: 4});

const name$ = state.select('name'); // Observable<string>
name$.subscribe(value => console.log(value)); // prints "Example", "Hello World"

state.patch({name: "Hello World"});
```

You can write your own custom *selectors*.

```typescript
import {Stateful} from '@reactgular/stateful';

interface ExampleState {name: string; count: number; }
const state = new Stateful<ExampleState>({name: "Example", count: 4});

const nameAndCount$ = state.selector(state => `${state.name} AND ${state.count}`);
nameAndCount$.subscribe(value => console.log(value)); // prints "Example AND 4"
```

## Example Angular Service

You can use Stateful as a base class for an Angular service.

```typescript
import {Observable} from 'rxjs'; 
import {Stateful} from '@reactgular/stateful';

interface ExampleState { counter: number }

@Injectable()
export class ExampleService extends Stateful<ExampleState> {
    public constructor() {
        super({counter: 0})
    }
 
    public counter(): Observable<number> {
        return this.select('counter');
    }

    public increment() {
        const counter = this.snapshot().counter + 1;
        this.patch({counter});
    }

    public decrement() {
        const counter = this.snapshot().counter - 1;
        this.patch({counter});
    }
}
```

## Example Angular Component

You can use Stateful as an internal state manager for an Angular component. By patching incoming `@Input()` properties into the Stateful
object you can more easily work with observables.

```typescript
interface ProductState {
    productId?: number;
    price?: number;
}

@Component({
    selector: 'project',
    template: `<span>Price: {{price$ | async}}</span>
               <span>Taxes: {{taxes$ | async}}</span>`
})
export class ProductComponent implements OnInit {
    private state: Stateful<ProductState> = new Stateful<ProductState>({});

    public price$ = this.state.select('price');

    public taxes$ = this.state.select('price').pipe(
        map(price => price * 0.07)    
    );

    @Input()
    public set productId(productId: string) {
        this.state.patch({productId});    
    }
  
    @Input()
    public set price(price: string) {
        this.state.patch({price});    
    }
}
```

# StorageStateful Class

StorageStateful extends Stateful and offers persistence of state to a storage service like `localStorage` or `sessionStorage`.

```typescript
import {StorageStateful} from '@reactgular/stateful';

interface ExampleState {name: string; count: number; }
const state = new StorageStateful<ExampleState>('app', {name: "Example", count: 4});
```

Pass the storage `key` as the first parameter to the constructor, and the default state as the second parameter. The state will
be persisted to `localStorage` by default under that `key`. Any changes patched to the state are serialized to storage.

You can configure custom serializers and storage objects using the `StorageStatefulConfig<TState extends {}>` interface as the third parameter.

```typescript
/**
 * Configuration options for the StorageStateful class.
 */
export interface StorageStatefulConfig<TState extends {}> {
    /**
     * A deserialize function that converts a string into a state object.
     */
    deserializer?: (state: string) => TState;

    /**
     * A serialize function that converts a state object into a string.
     */
    serializer?: (state: TState) => string;

    /**
     * The storage object to use (can be localStorage or sessionStorage).
     */
    storage?: Storage;
}
```
