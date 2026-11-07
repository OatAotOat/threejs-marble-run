import { useState, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import useGame, { phases } from '../../../../stores/useGame.jsx'
import { prefersReducedMotion } from '../../../../Utils/device.js'
import { marbleRadius } from '../../layout.js'

const stiffness = 500
const damping = 20
const minSquashImpact = 5
const impactKick = 3.75
const maxSquash = 0.5
const maxStretch = 0.125
const pressStart = 5
const pressFull = 15
const minPress = 0.25
const maxPress = 0.5
const pressDelay = 0.075
const reduceMotion = prefersReducedMotion()

const up = new THREE.Vector3(0, 1, 0)

export default function usePlayerSquash() {
    const outer = useRef()
    const inner = useRef()

    const [ axis ] = useState(() => new THREE.Vector3(0, 1, 0))
    const [ axisRotation ] = useState(() => new THREE.Quaternion())
    const [ bodyInverse ] = useState(() => new THREE.Quaternion())
    const [ offset ] = useState(() => new THREE.Vector3())
    const [ pressAxis ] = useState(() => new THREE.Vector3(0, 1, 0))

    const spring = useRef({ amount: 0, velocity: 0, anchor: 0, pressForce: 0, pressTime: 0 })

    useFrame((_, delta) => {
        if (useGame.getState().phase === phases.paused || !outer.current) { return }

        const s = spring.current
        const dt = Math.min(delta, 1 / 30)

        s.pressTime = s.pressForce > 0 ? s.pressTime + dt : 0

        let pressTarget = 0

        if (s.pressTime > pressDelay) {
            const pressStrength = THREE.MathUtils.clamp((s.pressForce - pressStart) / (pressFull - pressStart), 0, 1)
            pressTarget = THREE.MathUtils.lerp(minPress, maxPress, pressStrength)
            axis.copy(pressAxis)
            s.anchor = 0
        }

        s.pressForce = 0

        s.velocity += (stiffness * (pressTarget - s.amount) - damping * s.velocity) * dt
        s.amount = THREE.MathUtils.clamp(s.amount + s.velocity * dt, - maxStretch, maxSquash)

        if (Math.abs(s.amount) < 0.001 && Math.abs(s.velocity) < 0.01) {
            s.amount = 0
            s.velocity = 0
            outer.current.position.set(0, 0, 0)
            outer.current.quaternion.identity()
            outer.current.scale.setScalar(1)
            inner.current.quaternion.identity()
            return
        }

        const bodyRotation = outer.current.parent.quaternion
        bodyInverse.copy(bodyRotation).invert()
        axisRotation.setFromUnitVectors(up, axis)

        const along = 1 - s.amount
        const across = 1 / Math.sqrt(along)

        outer.current.quaternion.copy(bodyInverse).multiply(axisRotation)
        outer.current.scale.set(across, along, across)
        inner.current.quaternion.copy(axisRotation).invert().multiply(bodyRotation)

        offset.copy(axis).multiplyScalar(s.amount * marbleRadius * s.anchor).applyQuaternion(bodyInverse)
        outer.current.position.copy(offset)
    })

    const impact = (strength, direction) => {
        if (reduceMotion || strength < minSquashImpact) { return }

        axis.copy(direction)
        spring.current.anchor = 1
        spring.current.velocity += (strength - minSquashImpact) * impactKick
    }

    const press = ({ totalForceMagnitude, maxForceDirection }) => {
        if (reduceMotion || totalForceMagnitude < pressStart) { return }

        const s = spring.current

        if (totalForceMagnitude > s.pressForce && (maxForceDirection.x || maxForceDirection.y || maxForceDirection.z)) {
            s.pressForce = totalForceMagnitude
            pressAxis.copy(maxForceDirection).normalize()
        }
    }

    return { outer, inner, impact, press }
}
