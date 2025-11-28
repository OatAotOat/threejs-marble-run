import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

export default create(subscribeWithSelector((set) =>
{
    return {
        blocksCount: 3,
        blocksSeed: 0,
        level: 1,
        
        /**
         * Time
         */
        startTime: 0,
        endTime: 0,

        /**
         * Phases
         */
        phase: 'ready',
        
        start: () =>
        {
            set((state) =>
            {
                if(state.phase === 'ready')
                    return { 
                        phase: 'playing', 
                        startTime: Date.now()
                    }

                return {}
            })
        },
        
        restart: () =>
        {
            set((state) =>
            {
                const nextState = { 
                    phase: 'ready', 
                    blocksSeed: Math.random() 
                }

                if (state.phase === 'ended') 
                {
                    nextState.blocksCount = state.blocksCount + (state.blocksCount > 10 ? 2 : 1)
                    nextState.level = state.level + 1
                }

                if (state.phase === 'playing' || state.phase === 'ended')
                    return nextState

                return {}
            })
        },

        end: () =>
        {
            set((state) =>
            {
                if(state.phase === 'playing')
                    return { phase: 'ended',  endTime: Date.now() }
                return {}
            })
        },
        
    }
}))