import { useRapier, RigidBody } from '@react-three/rapier'
import { useFrame } from '@react-three/fiber'
import { useKeyboardControls } from '@react-three/drei'
import { useState, useEffect, useRef } from 'react'
import * as THREE from 'three'
import useGame from './stores/useGame.jsx'
import usePlayer from './stores/usePlayer.jsx'
import useQuality from './stores/useQuality.jsx'

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

export default function Player()
{
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
    const highQuality = useQuality((state) => state.quality === 'high')

    const [ jumpSound ] = useState(() => new Audio(`${import.meta.env.BASE_URL}action_jump.mp3`))

    const jump = () =>
    {
        const origin = body.current.translation()
        origin.y -= 0.31
        const direction = { x: 0, y: - 1, z: 0 }
        const ray = new rapier.Ray(origin, direction)
        const hit = world.castRay(ray, 10, true)

        if(hit.timeOfImpact < 0.15)
        {
            body.current.applyImpulse({ x: 0, y: 0.5, z: 0 });

            jumpSound.currentTime = 0;
            jumpSound.volume = Math.min(1, 2 / (smoothedCameraPosition.distanceTo(smoothedCameraTarget)));
            jumpSound.play();
        }
    }
    
    const reset = () =>
    {
        body.current.setTranslation({ x: 0, y: 1, z: 0 })
        body.current.setLinvel({ x: 0, y: 0, z: 0 })
        body.current.setAngvel({ x: 0, y: 0, z: 0 })
    }

    useEffect(() =>
    {
        const unsubscribeReset = useGame.subscribe(
            (state) => state.phase,
            (value) =>
            {
                if(value === 'ready')
                {
                    setTimeout(() => { reset() }, 0);
                }
            }
        )

        const unsubscribeJump = subscribeKeys(
            (state) => state.jump,
            (value) =>
            {
                if(value)
                    jump()
            }
        )

        const unsubscribePlayerJump = usePlayer.subscribe(
            (state) => state.playerJump,
            (value) =>
            {
                if(value)
                    jump()
            }
        )

        const unsubscribeAny = subscribeKeys(
            () =>
            {
                start()
            }
        )

        return () =>
        {
            unsubscribeReset()
            unsubscribeJump()
            unsubscribePlayerJump()
            unsubscribeAny()
        }
    }, [])

    useFrame((state, delta) =>
    {
        const keyboardControls = getKeys()
        const { joystickX, joystickY, playerJump } = usePlayer.getState()
        const { blocksCount, phase } = useGame.getState()

        if(joystickX || joystickY || playerJump)
            start()

        let inputX = joystickX
        let inputZ = joystickY

        if(keyboardControls.forward)
            inputZ -= 1
        if(keyboardControls.backward)
            inputZ += 1
        if(keyboardControls.leftward)
            inputX -= 1
        if(keyboardControls.rightward)
            inputX += 1

        const impulseStrength = 0.6 * delta
        const torqueStrength = 0.2 * delta

        impulse.x = inputX * impulseStrength
        impulse.z = inputZ * impulseStrength

        torque.x = inputZ * torqueStrength
        torque.z = - inputX * torqueStrength

        body.current.applyImpulse(impulse)
        body.current.applyTorqueImpulse(torque)

        /**
         * Camera
         */
        const bodyPosition = body.current.translation()
    
        cameraPosition.copy(bodyPosition)
        cameraPosition.z += 2.25
        cameraPosition.y += 0.65

        cameraTarget.copy(bodyPosition)
        cameraTarget.y += 0.25

        smoothedCameraPosition.lerp(cameraPosition, 5 * delta)
        smoothedCameraTarget.lerp(cameraTarget, 5 * delta)

        state.camera.position.copy(smoothedCameraPosition)
        state.camera.lookAt(smoothedCameraTarget)

        /**
        * Phases
        */
        if(bodyPosition.z < - (blocksCount * 4 + 2) && bodyPosition.y > 0)
            end()

        if(bodyPosition.y < - 4 && phase !== 'ready')
            restart()
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