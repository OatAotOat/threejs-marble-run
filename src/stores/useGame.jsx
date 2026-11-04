import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { readJson, writeJson, storageKeys } from '../Utils/storage.js'

export const phases = Object.freeze({
    ready: 'ready',
    playing: 'playing',
    paused: 'paused',
    falling: 'falling',
    ended: 'ended',
})

export default create(subscribeWithSelector((set, get) => {
    return {
        loaded: false,

        blocksCount: 3,
        blocksSeed: 0,
        level: 1,

        /**
         * Time
         */
        startTime: 0,
        endTime: 0,
        pausedAt: 0,
        bestTimes: readJson(storageKeys.bestTimes, {}),
        newRecord: false,

        /**
         * Phases
         */
        phase: phases.ready,
        hasStarted: false,

        setLoaded: () => set(() => ({ loaded: true })),

        start: () => {
            set((state) => {
                if (state.phase === phases.ready) {
                    return {
                        phase: phases.playing,
                        startTime: Date.now(),
                        hasStarted: true
                    }
                }

                return state // Same object, So No Listeners Are Notified
            })
        },

        restart: () => {
            set((state) => {
                if (state.phase === phases.ready) { return state } // Same object, So No Listeners Are Notified

                const nextState = {
                    phase: phases.ready,
                    blocksSeed: Math.random(),
                    newRecord: false
                }

                if (state.phase === phases.ended) {
                    nextState.blocksCount = state.blocksCount + (state.blocksCount > 10 ? 2 : 1)
                    nextState.level = state.level + 1
                }

                return nextState
            })
        },

        end: () => {
            set((state) => {
                if (state.phase !== phases.playing) { return state } // Same object, So No Listeners Are Notified

                const endTime = Date.now()
                const time = endTime - state.startTime
                const bestTime = state.bestTimes[state.level]

                if (bestTime !== undefined && time >= bestTime) { return { phase: phases.ended, endTime } }

                const bestTimes = { ...state.bestTimes, [state.level]: time }
                writeJson(storageKeys.bestTimes, bestTimes)

                return { phase: phases.ended, endTime, bestTimes, newRecord: true }
            })
        },

        fall: () => {
            if (get().phase !== phases.playing) { return }

            set(() => ({ phase: phases.falling, endTime: Date.now() }))

            setTimeout(() => {
                if (get().phase === phases.falling) { get().restart() }
            }, 1000)
        },

        pause: () => {
            set((state) => {
                if (state.phase === phases.playing) { return { phase: phases.paused, pausedAt: Date.now() } }

                return state // Same object, So No Listeners Are Notified
            })
        },

        resume: () => {
            set((state) => {
                if (state.phase === phases.paused) { return { phase: phases.playing, startTime: state.startTime + Date.now() - state.pausedAt } }

                return state // Same object, So No Listeners Are Notified
            })
        },

        togglePause: () => {
            if (get().phase === phases.paused) { get().resume() } else { get().pause() }
        },

    }
}))
