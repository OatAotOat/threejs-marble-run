import { useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import useGame, { phases } from '../../../../stores/useGame.jsx'
import { spawnPosition, fallHeight, getFinishZ } from '../../layout.js'

const resetBody = (body) => {
    if (!body) { return }

    const [ x, y, z ] = spawnPosition
    body.setTranslation({ x, y, z })
    body.setLinvel({ x: 0, y: 0, z: 0 })
    body.setAngvel({ x: 0, y: 0, z: 0 })
}

export default function usePlayerPhases(body) {
    useEffect(() => {
        return useGame.subscribe(
            (state) => state.phase,
            (phase) => {
                if (phase === phases.ready) { resetBody(body.current) }
            }
        )
    }, [ body ])

    useFrame(() => {
        const { blocksCount, phase, end, fall, restart } = useGame.getState()

        if (phase === phases.paused || !body.current) { return }

        const bodyPosition = body.current.translation()

        if (bodyPosition.z < getFinishZ(blocksCount) && bodyPosition.y > 0) { end() }

        if (bodyPosition.y < fallHeight) {
            if (phase === phases.playing) { fall() } else if (phase === phases.ended) { restart() } else if (phase === phases.ready) { resetBody(body.current) }
        }
    })
}
