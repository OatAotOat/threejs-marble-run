import { useState, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import useGame, { phases } from '../../../stores/useGame.jsx'

const minImpact = 0.6
const impactCooldown = 150

export default function usePlayerImpacts(body, onImpact) {
    const [ previousVelocity ] = useState(() => new THREE.Vector3())
    const lastImpactTime = useRef(0)

    useFrame(() => {
        if (useGame.getState().phase === phases.paused || !body.current) { return }

        previousVelocity.copy(body.current.linvel())
    })

    return ({ manifold, other }) => {
        const normal = manifold.normal()
        const otherVelocity = other.rigidBody?.linvel() ?? { x: 0, y: 0, z: 0 }

        const impact = Math.abs(
            (previousVelocity.x - otherVelocity.x) * normal.x +
            (previousVelocity.y - otherVelocity.y) * normal.y +
            (previousVelocity.z - otherVelocity.z) * normal.z
        )

        const now = performance.now()

        if (impact < minImpact || now - lastImpactTime.current < impactCooldown) { return }

        lastImpactTime.current = now
        onImpact(impact, Math.abs(normal.y) > 0.7)
    }
}
