// stores/globalStore.ts
import { create } from 'zustand';

const defaultFilter: filterType = {
    type: 'both',
    secret: false,
    hasLbs: false,
    withLink: false,
    withAt: false,
}


interface GlobalStore {
    state: glbStateType;
    setState: (
        updater: glbStateType | ((prev: glbStateType) => glbStateType)
    ) => void;
};
const useGlobalStore = create<GlobalStore>((set) => ({
    state: {
        usable: false,
        serverUrl: '',
        allowOnline: false,
        filter: defaultFilter,
    },
    setState: (updater) =>
        set((store) => ({
            state: typeof updater === 'function'
                ? (updater as (prev: glbStateType) => glbStateType)(store.state)
                : updater,
        })),
}));
export const useGlbState = (): [glbStateType, GlobalStore['setState']] => {
    const state = useGlobalStore((store) => store.state);
    const setState = useGlobalStore((store) => store.setState);
    return [state, setState];
};