import { useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import useGame, { phases } from '../../../stores/useGame.jsx'
import { spawnPosition, fallHeight, getFinishZ } from '../layout.js'

export default function usePlayerPhases(body) {
    useEffect(() => {
        const reset = () => {
            if (!body.current) { return }

            const [ x, y, z ] = spawnPosition
            body.current.setTranslation({ x, y, z })
            body.current.setLinvel({ x: 0, y: 0, z: 0 })
            body.current.setAngvel({ x: 0, y: 0, z: 0 })
        }

        return useGame.subscribe(
            (state) => state.phase,
            (phase) => {
                if (phase === phases.ready) { setTimeout(reset, 0) }
            }
        )
    }, [ body ])

    useFrame(() => {
        const { blocksCount, phase, end, fall, restart } = useGame.getState()

        if (phase === phases.paused || !body.current) { return }

        const bodyPosition = body.current.translation()

        if (bodyPosition.z < getFinishZ(blocksCount) && bodyPosition.y > 0) { end() }

        if (bodyPosition.y < fallHeight) {
            if (phase === phases.playing) { fall() } else if (phase === phases.ended) { restart() }
        }
    })
}
