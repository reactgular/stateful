import {Stateful} from './stateful';

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

/**
 * Stateful class that persists state to a storage service.
 */
export class StorageStateful<TState extends {}> extends Stateful<TState> {
    /**
     * Converts the string to a state object.
     */
    private readonly _deserializer: (state: string) => TState;

    /**
     * Converts a state object to a string.
     */
    private readonly _serializer: (state: TState) => string;

    /**
     * Browser storage interface.
     */
    private readonly _storage: Storage;

    /**
     * Constructor sets the initial state.
     */
    public constructor(
        public readonly storageKey: string,
        defaultState: TState,
        config?: StorageStatefulConfig<TState>
    ) {
        super(defaultState);

        config = {
            deserializer: a => {
                try {
                    return JSON.parse(a);
                } catch (err) {
                    return defaultState;
                }
            },
            serializer: a => JSON.stringify(a),
            storage: localStorage,
            ...(config || {})
        };

        this._storage = config.storage;
        this._serializer = config.serializer;
        this._deserializer = config.deserializer;

        if (this._storage.getItem(storageKey)) {
            this._read();
        } else {
            this._write();
        }
    }

    /**
     * Sets the next state.
     */
    public set(state: TState) {
        try {
            super.set(state);
        } finally {
            this._write();
        }
    }

    /**
     * Restores the state from storage.
     */
    private _read() {
        const item = this._storage.getItem(this.storageKey);
        if (item) {
            const state = this._deserializer(item);
            if (typeof state === 'object') {
                this.set(state);
            }
        }
    }

    /**
     * Persists the state to storage.
     */
    private _write() {
        const item = this._serializer(this.snapshot());
        this._storage.setItem(this.storageKey, item);
    }
}
