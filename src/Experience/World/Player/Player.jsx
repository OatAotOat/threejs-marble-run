import { RigidBody, BallCollider } from '@react-three/rapier'
import { useRef } from 'react'
import * as THREE from 'three'
import useQuality from '../../../stores/useQuality.jsx'
import { spawnPosition, marbleRadius } from '../layout.js'
import usePlayerSounds from './usePlayerSounds.js'
import useFollowCamera from './useFollowCamera.js'
import usePlayerControls from './usePlayerControls.js'
import usePlayerImpacts from './usePlayerImpacts.js'
import usePlayerSquash from './usePlayerSquash.js'
import usePlayerPhases from './usePlayerPhases.js'

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

export default function Player() {
    const body = useRef()
    const highQuality = useQuality((state) => state.quality === 'high')

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

    usePlayerPhases(body)

    return <RigidBody
        ref={ body }
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
        <group ref={ squash.outer }>
            <group ref={ squash.inner }>
                <mesh
                    material={ highQuality ? marbleGlassMaterial : marbleGlossyMaterial }
                    castShadow
                    receiveShadow
                >
                    <sphereGeometry args={ [ marbleRadius, 48, 48 ] } />
                </mesh>
            </group>
        </group>
    </RigidBody>
}
