import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { isMobileDevice } from '../device.js'

const qualities = [ 'high', 'low' ]

const forcedQuality = new URLSearchParams(window.location.search).get('quality')
const isForced = qualities.includes(forcedQuality)

export default create(subscribeWithSelector((set) =>
{
    return {
        quality: isForced ? forcedQuality : (isMobileDevice() ? 'low' : 'high'),

        adaptive: !isForced,

        setQuality: (quality) => set(() => ({ quality })),
    }
}))
