import {BehaviorSubject, Observable} from 'rxjs';
import {distinctUntilChanged, map} from 'rxjs/operators';

/**
 * Encapsulates a BehaviorSubject and provides minimal methods for managing a state object.
 */
export class Stateful<TState extends {}> {
    /**
     * Internal state
     */
    protected readonly _state$: BehaviorSubject<TState>;

    /**
     * Constructor sets the initial state.
     */
    public constructor(private readonly _defaultState: TState) {
        this._state$ = new BehaviorSubject<TState>(_defaultState);
    }

    /**
     * Emits changes to the state object.
     */
    public get state$(): Observable<TState> {
        return this._state$.asObservable();
    }

    /**
     * Stops the emission of state changes.
     */
    public complete() {
        this._state$.complete();
    }

    /**
     * Patches the state.
     */
    public patch(state: Partial<TState>) {
        this.set({...this.snapshot(), ...state});
    }

    /**
     * Resets the state to the default value.
     */
    public reset() {
        this.set(this._defaultState);
    }

    /**
     * Creates an observable by selecting the property name from the state object.
     */
    public select<TKey extends keyof TState>(name: TKey): Observable<TState[TKey]> {
        return this.selector(state => state[name]);
    }

    /**
     * Creates an observable by selecting a value from the state object.
     */
    public selector<TValue>(selector: (s: TState) => TValue): Observable<TValue> {
        return this._state$.pipe(
            map(state => selector(state)),
            distinctUntilChanged()
        );
    }

    /**
     * Sets the next state.
     */
    public set(state: TState) {
        this._state$.next(state);
    }

    /**
     * Gets a snapshot of the current state.
     */
    public snapshot(): TState {
        return this._state$.getValue();
    }
}
