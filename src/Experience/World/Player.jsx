import { useRapier, RigidBody } from '@react-three/rapier'
import { useFrame } from '@react-three/fiber'
import { useKeyboardControls } from '@react-three/drei'
import { useState, useEffect, useRef } from 'react'
import * as THREE from 'three'
import useGame from '../../stores/useGame.jsx'
import usePlayer from '../../stores/usePlayer.jsx'
import useQuality from '../../stores/useQuality.jsx'
import useSound from '../../stores/useSound.jsx'
import sources from '../sources.js'

const playSound = (sound, volume = 1) => {
    if (useSound.getState().muted)
        return

    sound.currentTime = 0
    sound.volume = volume
    sound.play().catch(() => {})
}

const marbleGlassMaterial = new THREE.MeshPhysicalMaterial({
    color: 'magenta',
    roughness: 0.1,
    metalness: 0,
    transmission: 1,
    ior: 2.33,
    thickness: 0.15,
    iridescence: 1,
    iridescenceIOR: 2.33,
    reflectivity: 1,
    dispersion: 0.75,
})

const marbleGlossyMaterial = new THREE.MeshPhysicalMaterial({
    color: 'magenta',
    roughness: 0.1,
    metalness: 0,
    clearcoat: 1,
    iridescence: 1,
    iridescenceIOR: 2.33,
})

const shakeWallImpact = 3
const shakeLandingImpact = 5.5
const shakeOffset = 0.15
const shakeRoll = 0.06
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function Player() {
    const body = useRef()
    const [ subscribeKeys, getKeys ] = useKeyboardControls()
    const { rapier, world } = useRapier()
    const [ smoothedCameraPosition ] = useState(() => new THREE.Vector3(10, 10, 10))
    const [ smoothedCameraTarget ] = useState(() => new THREE.Vector3())
    const [ cameraPosition ] = useState(() => new THREE.Vector3())
    const [ cameraTarget ] = useState(() => new THREE.Vector3())
    const [ impulse ] = useState(() => ({ x: 0, y: 0, z: 0 }))
    const [ torque ] = useState(() => ({ x: 0, y: 0, z: 0 }))
    const start = useGame((state) => state.start)
    const end = useGame((state) => state.end)
    const restart = useGame((state) => state.restart)
    const fall = useGame((state) => state.fall)
    const highQuality = useQuality((state) => state.quality === 'high')

    // Sound Effects
    const [ jumpSound ] = useState(() => new Audio(sources.sounds.jump))
    const [ collisionSound ] = useState(() => new Audio(sources.sounds.collision))
    const [ fallSound ] = useState(() => new Audio(sources.sounds.fall))
    const [ finishSound ] = useState(() => new Audio(sources.sounds.finish))

    const [ previousVelocity ] = useState(() => new THREE.Vector3())
    const lastImpactTime = useRef(0)
    const cameraTrauma = useRef(0)

    const jump = () => {
        if (useGame.getState().phase === 'paused') { return }

        const origin = body.current.translation()
        origin.y -= 0.31
        const direction = { x: 0, y: - 1, z: 0 }
        const ray = new rapier.Ray(origin, direction)
        const hit = world.castRay(ray, 10, true)

        if (hit.timeOfImpact < 0.15) {
            body.current.applyImpulse({ x: 0, y: 0.5, z: 0 })

            playSound(jumpSound, Math.min(1, 2 / (smoothedCameraPosition.distanceTo(smoothedCameraTarget))))
        }
    }

    const handleCollision = ({ manifold, other }) => {
        const normal = manifold.normal()
        const otherVelocity = other.rigidBody?.linvel() ?? { x: 0, y: 0, z: 0 }

        const impact = Math.abs(
            (previousVelocity.x - otherVelocity.x) * normal.x +
            (previousVelocity.y - otherVelocity.y) * normal.y +
            (previousVelocity.z - otherVelocity.z) * normal.z
        )

        const now = performance.now()

        if (impact < 0.6 || now - lastImpactTime.current < 150) { return }

        lastImpactTime.current = now
        playSound(collisionSound, Math.min(1, impact / 4))

        const isLanding = Math.abs(normal.y) > 0.7
        const shakeThreshold = isLanding ? shakeLandingImpact : shakeWallImpact

        if (!reduceMotion && impact > shakeThreshold) {
            cameraTrauma.current = Math.min(1, cameraTrauma.current + 0.5 + (impact - shakeThreshold) * 0.15)
        }
    }

    const reset = () => {
        body.current.setTranslation({ x: 0, y: 1, z: 0 })
        body.current.setLinvel({ x: 0, y: 0, z: 0 })
        body.current.setAngvel({ x: 0, y: 0, z: 0 })
    }

    useEffect(() => {
        const unsubscribeReset = useGame.subscribe(
            (state) => state.phase,
            (value) => {
                if (value === 'ready') { setTimeout(() => { reset() }, 0)}

                if (value === 'falling') { playSound(fallSound) }

                if (value === 'ended') { playSound(finishSound) }
            }
        )

        const unsubscribeJump = subscribeKeys(
            (state) => state.jump,
            (value) => { if (value) { jump() } }
        )

        const unsubscribePlayerJump = usePlayer.subscribe(
            (state) => state.playerJump,
            (value) => { if (value) { jump() } }
        )

        const unsubscribeAny = subscribeKeys(() => { start() })

        return () => {
            unsubscribeReset()
            unsubscribeJump()
            unsubscribePlayerJump()
            unsubscribeAny()
        }
    // Subscribe once, re-subscribing every render would be wasteful (jump is recreated each render)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useFrame((state, delta) => {
        const keyboardControls = getKeys()
        const { joystickX, joystickY, playerJump } = usePlayer.getState()
        const { blocksCount, phase } = useGame.getState()

        if (phase === 'paused' || !body.current) { return }

        if (joystickX || joystickY || playerJump) { start() }

        let inputX = joystickX
        let inputZ = joystickY

        if (keyboardControls.forward) { inputZ -= 1 }
        if (keyboardControls.backward) { inputZ += 1 }
        if (keyboardControls.leftward) { inputX -= 1 }
        if (keyboardControls.rightward) { inputX += 1 }

        const impulseStrength = 0.6 * delta
        const torqueStrength = 0.2 * delta

        impulse.x = inputX * impulseStrength
        impulse.z = inputZ * impulseStrength

        torque.x = inputZ * torqueStrength
        torque.z = - inputX * torqueStrength

        body.current.applyImpulse(impulse)
        body.current.applyTorqueImpulse(torque)

        previousVelocity.copy(body.current.linvel())

        /**
         * Camera
         */
        const bodyPosition = body.current.translation()

        cameraPosition.copy(bodyPosition)
        cameraPosition.z += 2.25
        cameraPosition.y += 0.65

        cameraTarget.copy(bodyPosition)
        cameraTarget.y += 0.25

        const cameraSmoothing = 1 - Math.exp(- 5 * delta)

        smoothedCameraPosition.lerp(cameraPosition, cameraSmoothing)
        smoothedCameraTarget.lerp(cameraTarget, cameraSmoothing)

        state.camera.position.copy(smoothedCameraPosition)
        state.camera.lookAt(smoothedCameraTarget)

        if (cameraTrauma.current > 0) {
            const shake = cameraTrauma.current * cameraTrauma.current
            const time = state.clock.elapsedTime * 35

            state.camera.position.x += Math.sin(time * 1.1) * shakeOffset * shake
            state.camera.position.y += Math.sin(time * 1.7 + 1) * shakeOffset * shake
            state.camera.rotation.z += Math.sin(time * 1.3 + 2) * shakeRoll * shake

            cameraTrauma.current = Math.max(0, cameraTrauma.current - delta * 1.8)
        }

        /**
        * Phases
        */
        if (bodyPosition.z < - (blocksCount * 4 + 2) && bodyPosition.y > 0) { end() }

        if (bodyPosition.y < - 4) {
            if (phase === 'playing') { fall() } else if (phase === 'ended') { restart() }
        }
    })

    return <RigidBody
        ref={ body }
        canSleep={ false }
        colliders="ball"
        restitution={ 0.2 }
        friction={ 1 }
        linearDamping={ 0.5 }
        angularDamping={ 0.5 }
        position={ [ 0, 1, 0 ] }
        onCollisionEnter={ handleCollision }
    >
        <mesh
            material={ highQuality ? marbleGlassMaterial : marbleGlossyMaterial }
            castShadow
            receiveShadow
        >
            <sphereGeometry args={ [ 0.3, 48, 48 ] } />
        </mesh>
    </RigidBody>
}
