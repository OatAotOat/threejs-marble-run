import * as THREE from 'three'
import { RigidBody } from '@react-three/rapier'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import useGame, { phases } from '../../../stores/useGame.jsx'

export const boxGeometry = new THREE.BoxGeometry(1, 1, 1)

export const floor1Material = new THREE.MeshStandardMaterial({ color: 'limegreen' })
export const floor2Material = new THREE.MeshStandardMaterial({ color: 'yellow' })
export const obstacleMaterial = new THREE.MeshStandardMaterial({ color: 'red', roughness: 1, transparent: true, opacity: 0.75 })
export const wallMaterial = new THREE.MeshStandardMaterial({ color: 'grey' })

const kinematicEuler = new THREE.Euler()
const kinematicRotation = new THREE.Quaternion()
const kinematicTranslation = { x: 0, y: 0, z: 0 }

export const setNextRotation = (body, x, y, z) => {
    if (!body)
        return

    kinematicEuler.set(x, y, z)
    kinematicRotation.setFromEuler(kinematicEuler)
    body.setNextKinematicRotation(kinematicRotation)
}

export const setNextTranslation = (body, x, y, z) => {
    if (!body)
        return

    kinematicTranslation.x = x
    kinematicTranslation.y = y
    kinematicTranslation.z = z
    body.setNextKinematicTranslation(kinematicTranslation)
}

/**
 * Block Building Pieces
 */
export function useBlockAnimation(animate) {
    const time = useRef(Math.random() * Math.PI * 2)

    useFrame((_, delta) => {
        if (useGame.getState().phase === phases.paused)
            return

        time.current += delta
        animate(time.current)
    })
}

export function BlockFloor({ material = floor2Material, position = [ 0, -0.1, 0 ], scale = [ 4, 0.2, 4 ] }) {
    return <RigidBody type="fixed" restitution={ 0.2 } friction={ 1 }>
        <mesh geometry={ boxGeometry } material={ material } position={ position } scale={ scale } receiveShadow />
    </RigidBody>
}

export function Obstacle({ ref, position = [ 0, 0.3, 0 ], children }) {
    return <RigidBody ref={ ref } type="kinematicPosition" position={ position } restitution={ 0.2 } friction={ 0 }>
        { children }
    </RigidBody>
}

export function ObstacleBox(props) {
    return <mesh geometry={ boxGeometry } material={ obstacleMaterial } castShadow receiveShadow { ...props } />
}
