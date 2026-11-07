import { useState, useEffect } from 'react'
import * as THREE from 'three'
import useGame, { phases, fallCauses } from '../../../../stores/useGame.jsx'
import useQuality, { isQualityAtLeast } from '../../../../stores/useQuality.jsx'

const up = new THREE.Vector3(0, 1, 0)

const getCutNormal = (detail, velocity) => {
    if (detail?.normal) {
        const { x, y, z } = detail.normal
        return [ x, y, z ]
    }

    const beam = new THREE.Vector3(1, 0, 0)
    if (detail?.axis) { beam.set(detail.axis.x, detail.axis.y, detail.axis.z) }

    const normal = beam.clone().cross(new THREE.Vector3(velocity.x, velocity.y, velocity.z))

    if (normal.lengthSq() < 0.0001) { normal.copy(beam).cross(up) }
    if (normal.lengthSq() < 0.0001) { normal.copy(up) }

    normal.normalize()
    if (normal.y < 0) { normal.negate() }

    return normal.toArray()
}

export default function usePlayerSlice(body) {
    const [ slice, setSlice ] = useState(null)

    useEffect(() => {
        return useGame.subscribe(
            (state) => state.phase,
            (phase) => {
                const marble = body.current
                if (!marble) { return }

                if (phase === phases.falling) {
                    const { fallCause, fallDetail } = useGame.getState()
                    const canSlice = isQualityAtLeast(useQuality.getState().quality, 'high')

                    if (fallCause !== fallCauses.lasered || !canSlice) { return }

                    const position = marble.translation()
                    const velocity = marble.linvel()

                    marble.setEnabled(false)

                    setSlice({
                        id: performance.now(),
                        position: [ position.x, position.y, position.z ],
                        velocity: [ velocity.x, velocity.y, velocity.z ],
                        normal: getCutNormal(fallDetail, velocity),
                    })
                }

                if (phase === phases.ready) {
                    marble.setEnabled(true)
                    setSlice(null)
                }
            }
        )
    }, [ body ])

    return slice
}
