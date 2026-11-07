import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { isMobileDevice } from '../Utils/device.js'
import { readStorage, writeStorage, storageKeys } from '../Utils/storage.js'

const modes = [ 'auto', 'low', 'high', 'ultra' ]

const qualityRank = { low: 0, high: 1, ultra: 2 }

export const isQualityAtLeast = (quality, level) => qualityRank[quality] >= qualityRank[level]

export const selectSceneryShadows = (state) => isQualityAtLeast(state.quality, 'high')

const loadMode = () => {
    const mode = readStorage(storageKeys.quality)
    return modes.includes(mode) ? mode : 'auto'
}

const forcedQuality = new URLSearchParams(window.location.search).get('quality')
const initialMode = [ 'ultra', 'high', 'low' ].includes(forcedQuality) ? forcedQuality : loadMode()

const autoQuality = (quality) => quality === 'ultra' ? 'high' : quality

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
                quality: mode === 'auto' ? autoQuality(state.quality) : mode,
            }
        }),
    }
}))
