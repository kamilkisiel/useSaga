import {useReducer, useEffect, useRef, useMemo, useCallback} from 'react';
import {runSaga, stdChannel} from 'redux-saga';

export const useSaga = (rootSaga, reducer, initialState) => {
    const [state, reactDispatch] = useReducer(reducer, initialState);
    const stateRef = useRef(state);

    useEffect(() => {
        stateRef.current = state;
    }, [state]);

    const channel = useMemo(() => stdChannel(), []);
    const dispatch = useCallback((action) => {
        channel.put(action);
        reactDispatch(action)
    }, []);
    const getState = useCallback(() => stateRef.current, []);

    useEffect(() => {
        if (Array.isArray(rootSaga)) {
            const tasks = rootSaga.map((saga) => runSaga({channel, dispatch, getState}, saga));
            return () => tasks.forEach((task) => task.cancel());
        } else {
            const task = runSaga({channel, dispatch, getState}, rootSaga);
            return () => task.cancel();
        }
    }, []);

    return [state, dispatch];
}
