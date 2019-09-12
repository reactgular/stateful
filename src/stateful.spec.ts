import {finalize, first, skip, tap} from 'rxjs/operators';
import {Stateful} from './stateful';

describe('stateful', () => {
    it('should set the state via the constructor', () => {
        const state = new Stateful({name: 'Example'});
        expect(state.snapshot()).toEqual({name: 'Example'});
    });

    it('should emit initial value via state$ property', done => {
        const state = new Stateful({name: 'Example'});
        state.state$.pipe(
            first(),
            finalize(() => done())
        ).subscribe(value => expect(value).toEqual({name: 'Example'}));
    });

    it('should emit state changes via state$ property', done => {
        const state = new Stateful({name: 'Example'});
        state.state$.pipe(
            skip(1),
            finalize(done)
        ).subscribe(value => expect(value).toEqual({name: 'Other'}));
        state.patch({name: 'Other'});
        state.complete();
    });

    it('should emit only once after a patch', done => {
        const state = new Stateful({name: 'Example'});
        let count = 0;
        state.state$.pipe(
            skip(1),
            tap(() => count++),
            finalize(done)
        ).subscribe(() => expect(count).toBe(1));
        state.patch({name: 'Other'});
        state.complete();
    });

    it('should select changes for a state property', done => {
        const state = new Stateful({a: 'one', b: 'two', c: 'three'});
        state.select('b').pipe(
            skip(1),
            finalize(done)
        ).subscribe(value => expect(value).toBe('four'));
        state.patch({b: 'four'});
        state.complete();
    });

    it('should ignore duplicate values of a state property', done => {
        const state = new Stateful({a: 'one', b: 'two', c: 'three'});
        state.select('b').pipe(
            skip(1),
            finalize(done)
        ).subscribe(value => expect(value).toBe('four'));
        state.patch({b: 'four'});
        state.set({a: 'fish', b: 'four', c: 'mouse'});
        state.patch({b: 'four'});
        state.set({a: 'house', b: 'four', c: 'chicken'});
        state.complete();
    });

    it('should use returned value from selector function', done => {
        const state = new Stateful({});
        state.selector(() => 'Something').pipe(
            first(),
            finalize(done)
        ).subscribe(value => expect(value).toBe('Something'));
    });

    it('should pass state object to selector function', done => {
        const state = new Stateful({name: 'Example'});
        state.selector(state => {
            expect(state).toEqual({name: 'Example'});
            return state.name;
        }).pipe(
            first(),
            finalize(done)
        ).subscribe(value => expect(value).toBe('Example'));
    });
});
