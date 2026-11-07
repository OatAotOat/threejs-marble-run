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

export const fallCauses = Object.freeze({
    fell: 'fell',
    lasered: 'lasered',
})

const respawnDelay = 800
let respawnTimeout

const getBlocksCount = (level) => {
    let count = 3

    for (let i = 1; i < level; i++) { count += count > 10 ? 2 : 1 }

    return count
}

const requestedLevel = Number.parseInt(new URLSearchParams(window.location.search).get('level'))
const initialLevel = Number.isInteger(requestedLevel) && requestedLevel > 0 ? requestedLevel : 1

export default create(subscribeWithSelector((set, get) => {
    return {
        loaded: false,

        blocksCount: getBlocksCount(initialLevel),
        blocksSeed: 0,
        level: initialLevel,

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
        fallCause: fallCauses.fell,
        fallDetail: null,
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

                clearTimeout(respawnTimeout)

                const nextState = {
                    phase: phases.ready,
                    blocksSeed: Math.random(),
                    newRecord: false
                }

                if (state.phase === phases.ended) {
                    nextState.level = state.level + 1
                    nextState.blocksCount = getBlocksCount(nextState.level)
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

        fall: (cause = fallCauses.fell, detail = null) => {
            if (get().phase !== phases.playing) { return }

            set(() => ({ phase: phases.falling, fallCause: cause, fallDetail: detail, endTime: Date.now() }))

            clearTimeout(respawnTimeout)
            respawnTimeout = setTimeout(() => {
                if (get().phase === phases.falling) { get().restart() }
            }, respawnDelay)
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
