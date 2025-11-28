import * as THREE from 'three'
import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { useMemo, useState, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, Text, useGLTF } from '@react-three/drei'

const boxGeometry = new THREE.BoxGeometry(1, 1, 1)

const floor1Material = new THREE.MeshStandardMaterial({ color: 'limegreen' })
const floor2Material = new THREE.MeshStandardMaterial({ color: 'yellow' })
const obstacleMaterial = new THREE.MeshStandardMaterial({ color: 'red', roughness: 1 })
const wallMaterial = new THREE.MeshStandardMaterial({ color: 'grey' })
const invisibleWallMaterial = new THREE.MeshStandardMaterial({ color: 'black', opacity: 0, transparent: true, castShadow: false, blendAlpha: 0 })

export function BlockStart({ position = [ 0, 0, 0 ], level = 1 })
{
    return <group position={ position }>
        <Float floatIntensity={ 0.25 } rotationIntensity={ 0.25 }>
            <Text
                font="/bebas-neue-v9-latin-regular.woff"
                scale={ 0.5 }
                maxWidth={ 0.25 }
                lineHeight={ 0.75 }
                textAlign="right"
                position={ [ 0.75, 0.65, 0 ] }
                rotation-y={ - 0.25 }
            >
                Marble Run Lv.{ level }
                <meshBasicMaterial toneMapped={ false } />
            </Text>
        </Float>
        <RigidBody type="fixed" restitution={ 0.2 } friction={ 1 }>
            <mesh geometry={ boxGeometry } material={ floor1Material } position={ [ 0, -0.1, 0 ] } scale={ [ 4, 0.2, 4 ] }  receiveShadow />
        </RigidBody>
    </group>
}

export function BlockEnd({ position = [ 0, 0, 0 ], level = 1 })
{
    const trophy = useGLTF('/trophy.glb')

    trophy.scene.children.forEach((mesh) =>
    {
        mesh.castShadow = true
    })

    return <group position={ position }>
        <Text
            font="/bebas-neue-v9-latin-regular.woff"
            scale={ 1 }
            position={ [ 0, 2.25, 2 ] }
        >
            FINISH
            <meshBasicMaterial toneMapped={ false } />
        </Text>
        <RigidBody type="fixed" restitution={ 0.2 } friction={ 1 }>
            <mesh geometry={ boxGeometry } material={ floor1Material } position={ [ 0, -0.1, 0 ] } scale={ [ 4, 0.2, 4 ] } />
        </RigidBody>
        <mesh geometry={ boxGeometry } material={ floor1Material } position={ [ 0, 0, 0 ] } scale={ [ 4, 0.2, 4 ] } receiveShadow />
        <RigidBody type="fixed" colliders="hull" position={ [ 0, 0.25, 0 ] } restitution={ 0.2 } friction={ 0 }>
            <primitive object={ trophy.scene } scale={ 0.099 + level / 100 } />
        </RigidBody>
    </group>
}

export function BlockSpinner({ position = [ 0, 0, 0 ] })
{
    const obstacle = useRef()
    const [ speed ] = useState(() => (Math.random() + 0.2) * (Math.random() < 0.5 ? - 1 : 1))

    useFrame((state) =>
    {
        const time = state.clock.getElapsedTime()

        const rotation = new THREE.Quaternion()
        rotation.setFromEuler(new THREE.Euler(0, time * speed, 0))
        obstacle.current.setNextKinematicRotation(rotation)
    })

    return <group position={ position }>
        <RigidBody type="fixed" restitution={ 0.2 } friction={ 1 }>
            <mesh geometry={ boxGeometry } material={ floor2Material } position={ [ 0, - 0.1, 0 ] } scale={ [ 4, 0.2, 4 ] }  receiveShadow />
        </RigidBody>
        <RigidBody ref={ obstacle } type="kinematicPosition" position={ [ 0, 0.3, 0 ] } restitution={ 0.2 } friction={ 0 }>
            <mesh geometry={ boxGeometry } material={ obstacleMaterial } scale={ [ 3.5, 0.3, 0.3 ] } castShadow receiveShadow />
        </RigidBody>
    </group>
}

export function BlockSpinner2({ position = [ 0, 0, 0 ] })
{
    const obstacle = useRef()
    const [ speed ] = useState(() => (Math.random() + 0.2) * (Math.random() < 0.5 ? - 1 : 1))

    useFrame((state) =>
    {
        const time = state.clock.getElapsedTime()

        const rotation = new THREE.Quaternion()
        rotation.setFromEuler(new THREE.Euler(0, 0, time * speed))
        obstacle.current.setNextKinematicRotation(rotation)
    })

    return <group position={ position }>
        <RigidBody type="fixed" restitution={ 0.2 } friction={ 1 }>
            <mesh geometry={ boxGeometry } material={ floor2Material } position={ [ 0, - 0.1, 0 ] } scale={ [ 4, 0.2, 4 ] }  receiveShadow />
        </RigidBody>
        <RigidBody ref={ obstacle } type="kinematicPosition" position={ [ 0, 0.75, 0 ] } restitution={ 0.2 } friction={ 0 }>
            <mesh geometry={ boxGeometry } material={ obstacleMaterial } scale={ [ 3.5, 0.5, 0.5 ] } castShadow receiveShadow />
            <mesh geometry={ boxGeometry } material={ obstacleMaterial } scale={ [ 0.5, 3.5, 0.5 ] } castShadow receiveShadow />
        </RigidBody>
    </group>
}

export function BlockLimbo({ position = [ 0, 0, 0 ] })
{
    const obstacle = useRef()
    const [ timeOffset ] = useState(() => Math.random() * Math.PI * 2)

    useFrame((state) =>
    {
        const time = state.clock.getElapsedTime()

        const y = Math.sin(time + timeOffset) + 1.15
        obstacle.current.setNextKinematicTranslation({ x: position[0], y: position[1] + y, z: position[2] })
    })

    return <group position={ position }>
        <RigidBody type="fixed" restitution={ 0.2 } friction={ 1 }>
            <mesh geometry={ boxGeometry } material={ floor2Material } position={ [ 0, - 0.1, 0 ] } scale={ [ 4, 0.2, 4 ] }  receiveShadow />
        </RigidBody>
        <RigidBody ref={ obstacle } type="kinematicPosition" position={ [ 0, 0.3, 0 ] } restitution={ 0.2 } friction={ 0 }>
            <mesh geometry={ boxGeometry } material={ obstacleMaterial } scale={ [ 3.5, 0.3, 0.3 ] } castShadow receiveShadow />
        </RigidBody>
    </group>
}

export function BlockAxe({ position = [ 0, 0, 0 ] })
{
    const obstacle = useRef()
    const [ timeOffset ] = useState(() => Math.random() * Math.PI * 2)

    useFrame((state) =>
    {
        const time = state.clock.getElapsedTime()

        const x = Math.sin(time + timeOffset) * 1.25
        obstacle.current.setNextKinematicTranslation({ x: position[0] + x, y: position[1] + 0.75, z: position[2] })
    })

    return <group position={ position }>
        <RigidBody type="fixed" restitution={ 0.2 } friction={ 1 }>
            <mesh geometry={ boxGeometry } material={ floor2Material } position={ [ 0, - 0.1, 0 ] } scale={ [ 4, 0.2, 4 ] }  receiveShadow />
        </RigidBody>
        <RigidBody ref={ obstacle } type="kinematicPosition" position={ [ 0, 0.3, 0 ] } restitution={ 0.2 } friction={ 0 }>
            <mesh geometry={ boxGeometry } material={ obstacleMaterial } scale={ [ 1.5, 1.5, 0.3 ] } castShadow receiveShadow />
        </RigidBody>
    </group>
}

export function BlockStrip({ position = [ 0, 0, 0 ] })
{
    const obstacle1 = useRef()
    const obstacle2 = useRef()
    const [ timeOffset ] = useState(() => Math.random() * Math.PI * 2)

    useFrame((state) =>
    {
        const time = state.clock.getElapsedTime()

        const y = Math.sin(time + timeOffset) + 1.15;
        obstacle1.current.setNextKinematicTranslation({ x: position[0], y: position[1] + y, z: position[2] });
        obstacle2.current.setNextKinematicTranslation({ x: position[0], y: position[1] - y, z: position[2] });
    })

    return <group position={ position }>
        <RigidBody type="fixed" restitution={ 0.2 } friction={ 1 }>
            <mesh geometry={ boxGeometry } material={ floor2Material } position={ [ 0, -0.1, 0 ] } scale={ [ 4, 0.2, 4 ] }  receiveShadow />
        </RigidBody>
        <RigidBody ref={ obstacle1 } type="kinematicPosition" position={ [ 0, 0.3, 0 ] } restitution={ 0.2 } friction={ 0 }>
            <mesh position={[ 0, 0, 1 ]} geometry={ boxGeometry } material={ obstacleMaterial } scale={ [ 3.5, 0.5, 0.5 ] } castShadow receiveShadow />
            <mesh position={[ 0, 0, 0 ]} geometry={ boxGeometry } material={ obstacleMaterial } scale={ [ 3.5, 0.5, 0.5 ] } castShadow receiveShadow />
            <mesh position={[ 0, 0, -1 ]} geometry={ boxGeometry } material={ obstacleMaterial } scale={ [ 3.5, 0.5, 0.5 ] } castShadow receiveShadow />
        </RigidBody>
        <RigidBody ref={ obstacle2 } type="kinematicPosition" position={ [ 0, 0.3, 0 ] } restitution={ 0.2 } friction={ 0 }>
            <mesh position={[ 0, 2.5, 0.5 ]} geometry={ boxGeometry } material={ obstacleMaterial } scale={ [ 3.5, 0.5, 0.5 ] } castShadow receiveShadow />
            <mesh position={[ 0, 2.5, -0.5 ]} geometry={ boxGeometry } material={ obstacleMaterial } scale={ [ 3.5, 0.5, 0.5 ] } castShadow receiveShadow />
        </RigidBody>
    </group>
}

export function BlockPlatform({ position = [ 0, 0, 0 ] })
{
    const obstacle = useRef()
    const [ timeOffset ] = useState(() => Math.random() * Math.PI * 2)

    useFrame((state) =>
    {
        const time = state.clock.getElapsedTime()

        const x = Math.sin(time + timeOffset)
        obstacle.current.setNextKinematicTranslation({ x: position[0] + x, y: position[1], z: position[2] })
    })

    return <group position={ position }>
        <RigidBody ref={ obstacle } type="kinematicPosition" position={ [ 0, 0.3, 0 ] } restitution={ 0.2 } friction={ 0 }>
            <mesh position={ [ 0, -0.1, 0 ] } geometry={ boxGeometry } material={ obstacleMaterial } scale={ [ 2, 0.2, 4 ] } castShadow receiveShadow />
        </RigidBody>
    </group>
}

export function BlockPlatform2({ position = [ 0, 0, 0 ] })
{
    const obstacle1 = useRef();
    const obstacle2 = useRef();
    const [ timeOffset ] = useState(() => Math.random() * Math.PI * 2)

    useFrame((state) =>
    {
        const time = state.clock.getElapsedTime()

        const x = Math.sin(time + timeOffset)
        obstacle1.current.setNextKinematicTranslation({ x: position[0] + x, y: position[1], z: position[2] })
        obstacle2.current.setNextKinematicTranslation({ x: position[0] - x, y: position[1], z: position[2] })
    })

    return <group position={ position }>
        <RigidBody ref={ obstacle1 } type="kinematicPosition" position={ [ 0, 0.3, 0 ] } restitution={ 0.2 } friction={ 0 }>
            <mesh position={ [ 0, -0.1, 1 ] } geometry={ boxGeometry } material={ obstacleMaterial } scale={ [ 1, 0.2, 1 ] } castShadow receiveShadow />
        </RigidBody>
        <RigidBody ref={ obstacle2 } type="kinematicPosition" position={ [ 0, 0.3, 0 ] } restitution={ 0.2 } friction={ 0 }>
            <mesh position={ [ 0, -0.1, -1 ] } geometry={ boxGeometry } material={ obstacleMaterial } scale={ [ 1, 0.2, 1 ] } castShadow receiveShadow />
        </RigidBody>
    </group>
}

export function BlockPlatform3({ position = [ 0, 0, 0 ] })
{
    const obstacle = useRef()
    const [ timeOffset ] = useState(() => Math.random() * Math.PI * 2)

    useFrame((state) =>
    {
        const time = state.clock.getElapsedTime()

        const x = Math.cos(time + timeOffset)
        const z = Math.sin(time + timeOffset)
        obstacle.current.setNextKinematicTranslation({ x: position[0] + x, y: position[1], z: position[2] + z })
    })

    return <group position={ position }>
        <RigidBody ref={ obstacle } type="kinematicPosition" position={ [ 0, 0.3, 0 ] } restitution={ 0.2 } friction={ 0 }>
            <mesh position={ [ 0, -0.1, 0 ] } geometry={ boxGeometry } material={ obstacleMaterial } scale={ [ 1.5, 0.2, 1.5 ] } castShadow receiveShadow />
        </RigidBody>
    </group>
}

export function BlockStairs1({ position = [ 0, 0, 0 ] })
{
    const obstacle1 = useRef()
    const obstacle2 = useRef()
    const obstacle3 = useRef()
    const obstacle4 = useRef()
    const [ timeOffset ] = useState(() => Math.random() * Math.PI * 2)

    useFrame((state) =>
    {
        const time = state.clock.getElapsedTime()

        const y = Math.sin(time + timeOffset) + 1.15;
        obstacle1.current.setNextKinematicTranslation({ x: position[0], y: position[1] - y, z: position[2] });
        obstacle2.current.setNextKinematicTranslation({ x: position[0], y: position[1] + y / 2, z: position[2] });
        obstacle3.current.setNextKinematicTranslation({ x: position[0], y: position[1] - y / 2, z: position[2] });
        obstacle4.current.setNextKinematicTranslation({ x: position[0], y: position[1] + y, z: position[2] });
    })

    return <group position={ position }>
        <RigidBody type="fixed" restitution={ 0.2 } friction={ 1 }>
            <mesh geometry={ boxGeometry } material={ floor2Material } position={ [ 0, -0.1, 1.5 ] } scale={ [ 4, 0.2, 1 ] }  receiveShadow />
        </RigidBody>
        <RigidBody ref={ obstacle1 } type="kinematicPosition" position={ [ 0, 0.3, 0 ] } restitution={ 0.2 } friction={ 0 }>
            <mesh position={[ 0, 2.25, 1 ]} geometry={ boxGeometry } material={ obstacleMaterial } scale={ [ 3.5, 0.5, 0.5 ] } castShadow receiveShadow />
        </RigidBody>
        <RigidBody ref={ obstacle2 } type="kinematicPosition" position={ [ 0, 0.3, 0 ] } restitution={ 0.2 } friction={ 0 }>
            <mesh position={[ 0, 0, 0.5 ]} geometry={ boxGeometry } material={ obstacleMaterial } scale={ [ 3.5, 0.5, 0.5 ] } castShadow receiveShadow />
        </RigidBody>
        <RigidBody ref={ obstacle3 } type="kinematicPosition" position={ [ 0, 0.3, 0 ] } restitution={ 0.2 } friction={ 0 }>
            <mesh position={[ 0, 2.25, 0 ]} geometry={ boxGeometry } material={ obstacleMaterial } scale={ [ 3.5, 0.5, 0.5 ] } castShadow receiveShadow />
        </RigidBody>
        <RigidBody ref={ obstacle4 } type="kinematicPosition" position={ [ 0, 0.3, 0 ] } restitution={ 0.2 } friction={ 0 }>
            <mesh position={[ 0, 0, -0.5 ]} geometry={ boxGeometry } material={ obstacleMaterial } scale={ [ 3.5, 0.5, 0.5 ] } castShadow receiveShadow />
        </RigidBody>
        <RigidBody type="kinematicPosition" position={ [ 0, 0.3, 0 ] } restitution={ 0.2 } friction={ 0 }>
            <mesh position={[ 0, 0.5, -1 ]} geometry={ boxGeometry } material={ obstacleMaterial } scale={ [ 3.5, 0.5, 0.5 ] } castShadow receiveShadow />
            <mesh position={[ 0, 1.5, -1 ]} geometry={ boxGeometry } material={ obstacleMaterial } scale={ [ 3.5, 0.5, 0.5 ] } castShadow receiveShadow />
            <mesh position={[ 0, 2.5, -1 ]} geometry={ boxGeometry } material={ obstacleMaterial } scale={ [ 3.5, 0.75, 0.5 ] } castShadow receiveShadow />
        </RigidBody>
    </group>
}

export function BlockStairs2({ position = [ 0, 0, 0 ] })
{
    const obstacle1 = useRef()
    const obstacle2 = useRef()
    const [ timeOffset ] = useState(() => Math.random() * Math.PI * 2)

    useFrame((state) =>
    {
        const time = state.clock.getElapsedTime()

        const y = Math.sin(time + timeOffset) + 1.15;
        obstacle1.current.setNextKinematicTranslation({ x: position[0], y: position[1] - y, z: position[2] });
        obstacle2.current.setNextKinematicTranslation({ x: position[0], y: position[1] + y / 2, z: position[2] });
    })

    return <group position={ position }>
        <RigidBody type="fixed" restitution={ 0.2 } friction={ 1 }>
            <mesh geometry={ boxGeometry } material={ floor2Material } position={ [ 0, -0.1, 0 ] } scale={ [ 4, 0.2, 4 ] }  receiveShadow />
        </RigidBody>
        <RigidBody ref={ obstacle1 } type="kinematicPosition" position={ [ 0, 0.3, 0 ] } restitution={ 0.2 } friction={ 0 }>
            <mesh position={[ 0, 2.25, 1 ]} geometry={ boxGeometry } material={ obstacleMaterial } scale={ [ 3.5, 0.5, 0.5 ] } castShadow receiveShadow />
            <mesh position={[ 0, 2.25, -1 ]} geometry={ boxGeometry } material={ obstacleMaterial } scale={ [ 3.5, 0.5, 0.5 ] } castShadow receiveShadow />
        </RigidBody>
        <RigidBody type="kinematicPosition" position={ [ 0, 0.3, 0 ] } restitution={ 0.2 } friction={ 0 }>
            <mesh position={[ 0, 0.5, 0 ]} geometry={ boxGeometry } material={ obstacleMaterial } scale={ [ 3.5, 0.5, 0.5 ] } castShadow receiveShadow />
            <mesh position={[ 0, 1.5, 0 ]} geometry={ boxGeometry } material={ obstacleMaterial } scale={ [ 3.5, 0.75, 0.5 ] } castShadow receiveShadow />
        </RigidBody>
        <RigidBody ref={ obstacle2 } type="kinematicPosition" position={ [ 0, 0.3, 0 ] } restitution={ 0.2 } friction={ 0 }>
            <mesh position={[ 0, 0, 0.5 ]} geometry={ boxGeometry } material={ obstacleMaterial } scale={ [ 3.5, 0.5, 0.5 ] } castShadow receiveShadow />
            <mesh position={[ 0, 0, -0.5 ]} geometry={ boxGeometry } material={ obstacleMaterial } scale={ [ 3.5, 0.5, 0.5 ] } castShadow receiveShadow />
        </RigidBody>
    </group>
}

function Bounds({ length = 1 })
{
    return <>
        <RigidBody type="fixed" restitution={ 0.2 } friction={ 0 }>
            <mesh
                position={ [ 2.15, 1, - (length * 2) + 2 ] }
                geometry={ boxGeometry }
                material={ wallMaterial }
                scale={ [ 0.3, 2, 4 * length ] }
                castShadow
            />
            <mesh
                position={ [ - 2.15, 1, - (length * 2) + 2 ] }
                geometry={ boxGeometry }
                material={ wallMaterial }
                scale={ [ 0.3, 2, 4 * length ] }
                receiveShadow
            />
            <mesh
                position={ [ 0, 1, - (length * 4) + 2] }
                geometry={ boxGeometry }
                material={ wallMaterial }
                scale={ [ 4, 2, 0.3 ] }
                receiveShadow
            />
            <mesh
                position={ [ 2.15, 3.5, - (length * 2) + 2 ] }
                geometry={ boxGeometry }
                material={ invisibleWallMaterial }
                scale={ [ 0.3, 3, 4 * length ] }
            />
            <mesh
                position={ [ - 2.15, 3.5, - (length * 2) + 2 ] }
                geometry={ boxGeometry }
                material={ invisibleWallMaterial }
                scale={ [ 0.3, 3, 4 * length ] }
            />
            <mesh
                position={ [ 0, 3.5, - (length * 4) + 2] }
                geometry={ boxGeometry }
                material={ invisibleWallMaterial }
                scale={ [ 4, 3, 0.3 ] }
            />
            {/* <CuboidCollider
                type="fixed"
                args={ [ 2, 0.1, 2 * length ] }
                position={ [ 0, -0.1, - (length * 2) + 2 ] }
                restitution={ 0.2 }
                friction={ 1 }
            /> */}
        </RigidBody>
    </>
}

export function Level({
    count = 5,
    types = [ BlockSpinner, BlockSpinner2, BlockAxe, BlockLimbo, BlockStrip, BlockPlatform, BlockPlatform2, BlockPlatform3, BlockStairs1, BlockStairs2 ],
    seed = 0,
    level = 1
})
{
    const blocks = useMemo(() =>
    {
        const blocks = []

        for(let i = 0; i < count; i++)
        {
            const type = types[ Math.floor(Math.random() * types.length) ]
            blocks.push(type)
        }

        return blocks
    }, [ count, types, seed, level ])
    
    return <>
        <BlockStart position={ [ 0, 0, 0 ] } level={ level } />

        { blocks.map((Block, index) => <Block key={ index } position={ [ 0, 0, - (index + 1) * 4 ] } />) }
        
        <BlockEnd position={ [ 0, 0, - (count + 1) * 4 ] } level={ level } key={ level } />

        <Bounds length={ count + 2 } />
    </>
}