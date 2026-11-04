import { useState, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import useGame, { phases } from '../../../stores/useGame.jsx'
import { prefersReducedMotion } from '../../../Utils/device.js'

const shakeWallImpact = 3
const shakeLandingImpact = 5.5
const shakeOffset = 0.15
const shakeRoll = 0.06
const reduceMotion = prefersReducedMotion()

export default function useFollowCamera(body) {
    const [ smoothedPosition ] = useState(() => new THREE.Vector3(10, 10, 10))
    const [ smoothedTarget ] = useState(() => new THREE.Vector3())
    const [ position ] = useState(() => new THREE.Vector3())
    const [ target ] = useState(() => new THREE.Vector3())
    const trauma = useRef(0)

    useFrame((state, delta) => {
        if (useGame.getState().phase === phases.paused || !body.current) { return }

        const bodyPosition = body.current.translation()

        position.copy(bodyPosition)
        position.z += 2.25
        position.y += 0.65

        target.copy(bodyPosition)
        target.y += 0.25

        const smoothing = 1 - Math.exp(- 5 * delta)

        smoothedPosition.lerp(position, smoothing)
        smoothedTarget.lerp(target, smoothing)

        state.camera.position.copy(smoothedPosition)
        state.camera.lookAt(smoothedTarget)

        if (trauma.current > 0) {
            const shake = trauma.current * trauma.current
            const time = state.clock.elapsedTime * 35

            state.camera.position.x += Math.sin(time * 1.1) * shakeOffset * shake
            state.camera.position.y += Math.sin(time * 1.7 + 1) * shakeOffset * shake
            state.camera.rotation.z += Math.sin(time * 1.3 + 2) * shakeRoll * shake

            trauma.current = Math.max(0, trauma.current - delta * 1.8)
        }
    })

    const shake = (impact, isLanding) => {
        const threshold = isLanding ? shakeLandingImpact : shakeWallImpact

        if (!reduceMotion && impact > threshold) {
            trauma.current = Math.min(1, trauma.current + 0.5 + (impact - threshold) * 0.15)
        }
    }

    const distance = () => smoothedPosition.distanceTo(smoothedTarget)

    return { shake, distance }
}
