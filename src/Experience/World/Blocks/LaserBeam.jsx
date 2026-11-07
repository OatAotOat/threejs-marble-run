import * as THREE from 'three'
import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody, CuboidCollider } from '@react-three/rapier'
import useGame, { phases, fallCauses } from '../../../stores/useGame.jsx'

export const laserSpan = 3.7

const hitRadius = 0.04
const warningFlickerSpeed = 50

export const coreGeometry = new THREE.CylinderGeometry(0.025, 0.025, 1, 8).rotateZ(Math.PI / 2)
const glowGeometry = new THREE.CylinderGeometry(0.07, 0.07, 1, 12).rotateZ(Math.PI / 2)
export const emitterGeometry = new THREE.BoxGeometry(0.12, 0.2, 0.2)
export const cylinderYGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 16)
export const cylinderXGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 16).rotateX(Math.PI / 2).rotateZ(Math.PI / 2)

export const coreMaterial = new THREE.MeshBasicMaterial({ color: new THREE.Color('#ff2a2a').multiplyScalar(6), toneMapped: false })
const glowMaterial = new THREE.MeshBasicMaterial({
    color: '#ff2a2a',
    transparent: true,
    opacity: 0.3,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
})
export const emitterMaterial = new THREE.MeshStandardMaterial({ color: '#2b2b2b', roughness: 0.6 })

const isPlayer = ({ other }) => other.rigidBodyObject?.name === 'player'

const beamRotation = new THREE.Quaternion()

const getBeamAxis = (mesh) => {
    const axis = new THREE.Vector3(1, 0, 0).applyQuaternion(mesh.getWorldQuaternion(beamRotation))
    return { x: axis.x, y: axis.y, z: axis.z }
}

export const zapPlayer = (detail) => {
    const game = useGame.getState()

    if (game.phase === phases.playing) { game.fall(fallCauses.lasered, detail) }
}

export function useLaserContact() {
    const touching = useRef(0)
    const player = useRef(null)

    useEffect(() => {
        return useGame.subscribe(
            (state) => state.phase,
            (phase) => { if (phase === phases.ready) { touching.current = 0 } }
        )
    }, [])

    const onIntersectionEnter = (payload) => {
        if (!isPlayer(payload)) { return }

        touching.current++
        player.current = payload.other.rigidBody
    }

    const onIntersectionExit = (payload) => {
        if (isPlayer(payload)) { touching.current = Math.max(0, touching.current - 1) }
    }

    return { touching, player, onIntersectionEnter, onIntersectionExit }
}

export function LaserBeam({ ref, position, rotation, length = laserSpan, emitters = true, power }) {
    const core = useRef()
    const glow = useRef()
    const { touching, onIntersectionEnter, onIntersectionExit } = useLaserContact()

    useFrame((state) => {
        const level = power ? power.current : 1
        const lethal = level >= 1
        const warning = level > 0 && !lethal

        core.current.visible = lethal || (warning && Math.sin(state.clock.elapsedTime * warningFlickerSpeed) > 0)
        glow.current.visible = lethal

        if (lethal && touching.current > 0) { zapPlayer({ axis: getBeamAxis(core.current) }) }
    })

    return <RigidBody ref={ ref } type="kinematicPosition" colliders={ false } position={ position } rotation={ rotation }>
        <mesh ref={ core } geometry={ coreGeometry } material={ coreMaterial } scale-x={ length } />
        <mesh ref={ glow } geometry={ glowGeometry } material={ glowMaterial } scale-x={ length } />

        { emitters && <>
            <mesh geometry={ emitterGeometry } material={ emitterMaterial } position-x={ -length / 2 } />
            <mesh geometry={ emitterGeometry } material={ emitterMaterial } position-x={ length / 2 } />
        </> }

        <CuboidCollider
            sensor
            args={ [ length / 2, hitRadius, hitRadius ] }
            onIntersectionEnter={ onIntersectionEnter }
            onIntersectionExit={ onIntersectionExit }
        />
    </RigidBody>
}
