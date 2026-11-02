import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { loadBestTimes, saveBestTimes } from '../bestTimes.js'

export default create(subscribeWithSelector((set, get) =>
{
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
        bestTimes: loadBestTimes(),
        newRecord: false,

        /**
         * Phases
         */
        phase: 'ready',
        hasStarted: false,

        setLoaded: () => set(() => ({ loaded: true })),

        start: () =>
        {
            set((state) =>
            {
                if(state.phase === 'ready')
                    return {
                        phase: 'playing',
                        startTime: Date.now(),
                        hasStarted: true
                    }

                return state // Same object, So No Listeners Are Notified
            })
        },

        restart: () =>
        {
            set((state) =>
            {
                const nextState = {
                    phase: 'ready',
                    blocksSeed: Math.random(),
                    newRecord: false
                }

                if (state.phase === 'ended')
                {
                    nextState.blocksCount = state.blocksCount + (state.blocksCount > 10 ? 2 : 1)
                    nextState.level = state.level + 1
                }

                if ([ 'playing', 'ended', 'paused', 'falling' ].includes(state.phase))
                    return nextState

                return state // Same object, So No Listeners Are Notified
            })
        },

        end: () =>
        {
            set((state) =>
            {
                if(state.phase !== 'playing')
                    return state // Same object, So No Listeners Are Notified

                const endTime = Date.now()
                const time = endTime - state.startTime
                const bestTime = state.bestTimes[state.level]

                if(bestTime !== undefined && time >= bestTime)
                    return { phase: 'ended', endTime }

                const bestTimes = { ...state.bestTimes, [state.level]: time }
                saveBestTimes(bestTimes)

                return { phase: 'ended', endTime, bestTimes, newRecord: true }
            })
        },

        fall: () =>
        {
            if(get().phase !== 'playing')
                return

            set(() => ({ phase: 'falling', endTime: Date.now() }))

            setTimeout(() =>
            {
                if(get().phase === 'falling')
                    get().restart()
            }, 1000)
        },

        pause: () =>
        {
            set((state) =>
            {
                if(state.phase === 'playing')
                    return { phase: 'paused', pausedAt: Date.now() }

                return state // Same object, So No Listeners Are Notified
            })
        },

        resume: () =>
        {
            set((state) =>
            {
                if(state.phase === 'paused')
                    return { phase: 'playing', startTime: state.startTime + Date.now() - state.pausedAt }

                return state // Same object, So No Listeners Are Notified
            })
        },

        togglePause: () =>
        {
            if(get().phase === 'paused')
                get().resume()
            else
                get().pause()
        },

    }
}))
