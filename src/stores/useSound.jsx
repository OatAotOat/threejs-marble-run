import { create } from 'zustand'
import { readStorage, writeStorage, storageKeys } from '../Utils/storage.js'

export default create((set) => {
    return {
        muted: readStorage(storageKeys.muted) === 'true',

        toggleMuted: () => set((state) => {
            writeStorage(storageKeys.muted, String(!state.muted))

            return { muted: !state.muted }
        }),
    }
})
