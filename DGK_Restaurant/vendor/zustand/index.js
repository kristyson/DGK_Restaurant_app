const React = require('react');

const { useSyncExternalStore, useRef } = React;

function defaultSelector(state) {
  return state;
}

function defaultEquality(a, b) {
  return Object.is(a, b);
}

function create(createState) {
  if (typeof createState !== 'function') {
    throw new Error('create() espera uma função que inicializa o estado.');
  }

  let state;
  const listeners = new Set();

  const setState = (partial, replace) => {
    const nextState = typeof partial === 'function' ? partial(state) : partial;
    if (nextState === state) {
      return;
    }

    const value =
      replace || typeof nextState !== 'object' || nextState === null
        ? nextState
        : Object.assign({}, state, nextState);

    state = value;
    listeners.forEach((listener) => listener(state));
  };

  const getState = () => state;

  const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  const destroy = () => {
    listeners.clear();
  };

  const api = { setState, getState, subscribe, destroy };

  state = createState(setState, getState, api);

  function useStore(selector = defaultSelector, equalityFn = defaultEquality) {
    if (typeof selector !== 'function') {
      throw new Error('O seletor do store precisa ser uma função.');
    }

    const sliceRef = useRef();

    const getSelectedState = () => {
      const nextSlice = selector(getState());
      if (sliceRef.current === undefined || !equalityFn(sliceRef.current, nextSlice)) {
        sliceRef.current = nextSlice;
      }
      return sliceRef.current;
    };

    return useSyncExternalStore(subscribe, getSelectedState, getSelectedState);
  }

  Object.assign(useStore, api, {
    getInitialState: () => state,
  });

  return useStore;
}

module.exports = { create };
module.exports.default = create;
