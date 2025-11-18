import { MutableRefObject } from 'react';

export type StateCreator<T> = (
  set: (partial: T | Partial<T> | ((state: T) => T | Partial<T>), replace?: boolean) => void,
  get: () => T,
  api: StoreApi<T>,
) => T;

export type StateSelector<T, U> = (state: T) => U;
export type EqualityChecker<T> = (state: T, newState: T) => boolean;

export interface StoreApi<T> {
  setState: (partial: T | Partial<T> | ((state: T) => T | Partial<T>), replace?: boolean) => void;
  getState: () => T;
  subscribe: (listener: (state: T, previousState: T) => void) => () => void;
  destroy: () => void;
  getInitialState?: () => T;
}

export type UseBoundStore<T> = {
  (): T;
  <U>(selector: StateSelector<T, U>, equalityFn?: EqualityChecker<U>): U;
} & StoreApi<T>;

export declare function create<T>(initializer: StateCreator<T>): UseBoundStore<T>;

export default create;
