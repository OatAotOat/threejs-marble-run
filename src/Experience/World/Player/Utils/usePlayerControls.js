import { useState, useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useKeyboardControls } from '@react-three/drei'
import { useRapier } from '@react-three/rapier'
import useGame, { phases } from '../../../../stores/useGame.jsx'
import usePlayer from '../../../../stores/usePlayer.jsx'
import { isMovementPressed } from '../../../../Utils/controls.js'

export default function usePlayerControls(body, { onJump }) {
    const [ subscribeKeys, getKeys ] = useKeyboardControls()
    const { rapier, world } = useRapier()
    const start = useGame((state) => state.start)
    const [ impulse ] = useState(() => ({ x: 0, y: 0, z: 0 }))
    const [ torque ] = useState(() => ({ x: 0, y: 0, z: 0 }))

    const onJumpRef = useRef(onJump)
    useEffect(() => { onJumpRef.current = onJump })

    useEffect(() => {
        const jump = () => {
            if (useGame.getState().phase === phases.paused || !body.current) { return }

            const origin = body.current.translation()
            origin.y -= 0.31
            const ray = new rapier.Ray(origin, { x: 0, y: - 1, z: 0 })
            const hit = world.castRay(ray, 10, true)

            if (hit && hit.timeOfImpact < 0.15) {
                body.current.applyImpulse({ x: 0, y: 0.5, z: 0 })
                onJumpRef.current?.()
            }
        }

        const unsubscribeJump = subscribeKeys(
            (state) => state.jump,
            (value) => { if (value) { jump() } }
        )

        const unsubscribePlayerJump = usePlayer.subscribe(
            (state) => state.playerJump,
            (value) => { if (value) { jump() } }
        )

        return () => {
            unsubscribeJump()
            unsubscribePlayerJump()
        }
    }, [ body, subscribeKeys, rapier, world ])

    useFrame((_, delta) => {
        const { phase } = useGame.getState()

        if (phase === phases.paused || !body.current) { return }

        const keys = getKeys()
        const { joystickX, joystickY, playerJump } = usePlayer.getState()

        if (phase === phases.ready && (joystickX || joystickY || playerJump || isMovementPressed(keys))) { start() }

        let inputX = joystickX
        let inputZ = joystickY

        if (keys.forward) { inputZ -= 1 }
        if (keys.backward) { inputZ += 1 }
        if (keys.leftward) { inputX -= 1 }
        if (keys.rightward) { inputX += 1 }

        const impulseStrength = 0.6 * delta
        const torqueStrength = 0.2 * delta

        impulse.x = inputX * impulseStrength
        impulse.z = inputZ * impulseStrength

        torque.x = inputZ * torqueStrength
        torque.z = - inputX * torqueStrength

        body.current.applyImpulse(impulse)
        body.current.applyTorqueImpulse(torque)
    })
}
