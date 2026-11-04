import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { isMobileDevice } from '../Utils/device.js'
import { readStorage, writeStorage, storageKeys } from '../Utils/storage.js'

const modes = [ 'auto', 'high', 'low' ]

const loadMode = () => {
    const mode = readStorage(storageKeys.quality)
    return modes.includes(mode) ? mode : 'auto'
}

const forcedQuality = new URLSearchParams(window.location.search).get('quality')
const initialMode = [ 'high', 'low' ].includes(forcedQuality) ? forcedQuality : loadMode()

export default create(subscribeWithSelector((set) => {
    return {
        mode: initialMode,
        quality: initialMode === 'auto' ? (isMobileDevice() ? 'low' : 'high') : initialMode,
        adaptive: initialMode === 'auto',

        setQuality: (quality) => set(() => ({ quality })),

        cycleMode: () => set((state) => {
            const mode = modes[(modes.indexOf(state.mode) + 1) % modes.length]
            writeStorage(storageKeys.quality, mode)

            return {
                mode,
                adaptive: mode === 'auto',
                quality: mode === 'auto' ? state.quality : mode,
            }
        }),
    }
}))
