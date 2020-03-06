import {StorageStateful} from './storage-stateful';

describe('StorageStateful', () => {
    beforeEach(() => localStorage.clear());

    it('should serialize the default state to storage', () => {
        const state = new StorageStateful('stateful', {name: 'Example'});
        expect(localStorage.getItem('stateful')).toBe(JSON.stringify({name: 'Example'}));
        expect(localStorage.length).toBe(1);
    });

    it('should serialize changes to the start', () => {
        const state = new StorageStateful('stateful', {name: 'One'});
        expect(localStorage.getItem('stateful')).toBe(JSON.stringify({name: 'One'}));
        state.patch('name', 'Two');
        expect(localStorage.getItem('stateful')).toBe(JSON.stringify({name: 'Two'}));
        state.set({name: 'Three'});
        expect(localStorage.getItem('stateful')).toBe(JSON.stringify({name: 'Three'}));
        state.reset();
        expect(localStorage.getItem('stateful')).toBe(JSON.stringify({name: 'One'}));
    });

    it('should use a custom deserializer', () => {
        localStorage.setItem('stateful', JSON.stringify({name: 'One'}));
        const state = new StorageStateful('stateful', {}, {
            deserializer: str => ({...JSON.parse(str), version: 99})
        });
        expect(state.snapshot()).toEqual({name: 'One', version: 99});
    });

    it('should use a custom serializer', () => {
        const state = new StorageStateful('stateful', {name: 'One'}, {serializer: s => 'Chicken Soup'});
        expect(localStorage.getItem('stateful')).toBe('Chicken Soup');
    });

    it('should use a custom storage object', () => {
        let store = {};
        const storage: any = {
            getItem: key => store[key] || null,
            setItem: (key, value) => store[key] = value.toString(),
            removeItem: key => delete store[key],
            clear: () => store = {}
        };
        const state = new StorageStateful('stateful', {name: 'Example'}, {storage});
        // tslint:disable-next-line
        expect(store['stateful']).toBe(JSON.stringify({name: 'Example'}));
        expect(Object.keys(store).length).toBe(1);
    });
});
