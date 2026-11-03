import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { isMobileDevice } from '../device.js'

const modes = [ 'auto', 'high', 'low' ]
const modeKey = 'marble-run-quality'

const loadMode = () =>
{
    try
    {
        const mode = localStorage.getItem(modeKey)
        return modes.includes(mode) ? mode : 'auto'
    }
    catch
    {
        return 'auto'
    }
}

const saveMode = (mode) =>
{
    try
    {
        localStorage.setItem(modeKey, mode)
    }
    catch
    {
        // Preference then only lasts for the session
    }
}

const forcedQuality = new URLSearchParams(window.location.search).get('quality')
const initialMode = [ 'high', 'low' ].includes(forcedQuality) ? forcedQuality : loadMode()

export default create(subscribeWithSelector((set) =>
{
    return {
        mode: initialMode,
        quality: initialMode === 'auto' ? (isMobileDevice() ? 'low' : 'high') : initialMode,
        adaptive: initialMode === 'auto',

        setQuality: (quality) => set(() => ({ quality })),

        cycleMode: () => set((state) =>
        {
            const mode = modes[(modes.indexOf(state.mode) + 1) % modes.length]
            saveMode(mode)

            return {
                mode,
                adaptive: mode === 'auto',
                quality: mode === 'auto' ? state.quality : mode,
            }
        }),
    }
}))
