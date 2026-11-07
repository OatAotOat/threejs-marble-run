import * as THREE from 'three'
import { useMemo } from 'react'
import { RigidBody, ConvexHullCollider } from '@react-three/rapier'
import { marbleRadius } from '../layout.js'

const separationSpeed = 1.2
const tumbleSpeed = 3
const cutGap = 0.02

const halfGeometry = new THREE.SphereGeometry(marbleRadius, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2)
const capGeometry = new THREE.CircleGeometry(marbleRadius, 32).rotateX(Math.PI / 2)
const hullPoints = halfGeometry.attributes.position.array

const cutMaterial = new THREE.MeshBasicMaterial({ color: new THREE.Color('#ff5a2a').multiplyScalar(3), toneMapped: false })

const up = new THREE.Vector3(0, 1, 0)

function MarbleHalf({ position, velocity, normal, side, material }) {
    const body = useMemo(() => {
        const direction = new THREE.Vector3(...normal).multiplyScalar(side)
        const rotation = new THREE.Euler().setFromQuaternion(new THREE.Quaternion().setFromUnitVectors(up, direction))
        const tumble = () => (Math.random() - 0.5) * 2 * tumbleSpeed

        return {
            position: new THREE.Vector3(...position).addScaledVector(direction, cutGap).toArray(),
            rotation: [ rotation.x, rotation.y, rotation.z ],
            linearVelocity: new THREE.Vector3(...velocity).addScaledVector(direction, separationSpeed).toArray(),
            angularVelocity: [ tumble(), tumble(), tumble() ],
        }
    }, [ position, velocity, normal, side ])

    return <RigidBody { ...body } colliders={ false } restitution={ 0.2 } friction={ 1 }>
        <ConvexHullCollider args={ [ hullPoints ] } />
        <mesh geometry={ halfGeometry } material={ material } castShadow />
        <mesh geometry={ capGeometry } material={ cutMaterial } />
    </RigidBody>
}

export default function SlicedMarble({ slice, material }) {
    return <>
        <MarbleHalf { ...slice } side={ 1 } material={ material } />
        <MarbleHalf { ...slice } side={ - 1 } material={ material } />
    </>
}
