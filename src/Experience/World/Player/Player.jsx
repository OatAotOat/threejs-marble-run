import { RigidBody, BallCollider } from '@react-three/rapier'
import { useRef } from 'react'
import * as THREE from 'three'
import useQuality, { isQualityAtLeast } from '../../../stores/useQuality.jsx'
import { spawnPosition, marbleRadius } from '../layout.js'
import usePlayerSounds from './usePlayerSounds.js'
import useFollowCamera from './useFollowCamera.js'
import usePlayerControls from './usePlayerControls.js'
import usePlayerImpacts from './usePlayerImpacts.js'
import usePlayerSquash from './usePlayerSquash.js'
import usePlayerSlice from './usePlayerSlice.js'
import usePlayerPhases from './usePlayerPhases.js'
import SlicedMarble from './SlicedMarble.jsx'

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

const marbleGlossyMaterial = new THREE.MeshStandardMaterial({
    color: 'magenta',
    roughness: 0.1,
    metalness: 0,
})

export default function Player() {
    const body = useRef()
    const highQuality = useQuality((state) => isQualityAtLeast(state.quality, 'high'))

    const playSound = usePlayerSounds()
    const camera = useFollowCamera(body)

    usePlayerControls(body, {
        onJump: () => playSound('jump', Math.min(1, 2 / camera.distance()))
    })

    const squash = usePlayerSquash()

    const handleCollision = usePlayerImpacts(body, (impact, isLanding, direction) => {
        playSound('collision', Math.min(1, impact / 4))
        camera.shake(impact, isLanding)
        squash.impact(impact, direction)
    })

    const slice = usePlayerSlice(body)

    usePlayerPhases(body)

    const marbleMaterial = highQuality ? marbleGlassMaterial : marbleGlossyMaterial

    return <>
        <RigidBody
            ref={ body }
            name="player"
            canSleep={ false }
            colliders={ false }
            restitution={ 0.2 }
            friction={ 1 }
            linearDamping={ 0.5 }
            angularDamping={ 0.5 }
            position={ spawnPosition }
            onCollisionEnter={ handleCollision }
            onContactForce={ squash.press }
        >
            <BallCollider args={ [ marbleRadius ] } />
            <group ref={ squash.outer } visible={ !slice }>
                <group ref={ squash.inner }>
                    <mesh
                        material={ marbleMaterial }
                        castShadow
                        receiveShadow
                    >
                        <sphereGeometry args={ highQuality ? [ marbleRadius, 48, 48 ] : [ marbleRadius, 32, 24 ] } />
                    </mesh>
                </group>
            </group>
        </RigidBody>

        { slice && <SlicedMarble key={ slice.id } slice={ slice } material={ marbleMaterial } /> }
    </>
}
