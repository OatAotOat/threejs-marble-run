import * as THREE from 'three'
import { RigidBody, CuboidCollider } from '@react-three/rapier'
import { useMemo, useState, useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, Text, useGLTF, Sparkles } from '@react-three/drei'
import useGame from './stores/useGame.jsx'
import { isMobileDevice } from './device.js'

const fontURL = `${import.meta.env.BASE_URL}bebas-neue-v9-latin-regular.woff`

const startHints = isMobileDevice()
    ? 'Left Side : Roll\nButton : Jump'
    : 'WASD / Arrows : Roll\nSpace : Jump\nR : Restart\nEsc : Pause'

const boxGeometry = new THREE.BoxGeometry(1, 1, 1)

const floor1Material = new THREE.MeshStandardMaterial({ color: 'limegreen' })
const floor2Material = new THREE.MeshStandardMaterial({ color: 'yellow' })
const obstacleMaterial = new THREE.MeshStandardMaterial({ color: 'red', roughness: 1, transparent: true, opacity: 0.75 })
const wallMaterial = new THREE.MeshStandardMaterial({ color: 'grey' })

const kinematicEuler = new THREE.Euler()
const kinematicRotation = new THREE.Quaternion()
const kinematicTranslation = { x: 0, y: 0, z: 0 }

const setNextRotation = (body, x, y, z) =>
{
    if(!body)
        return

    kinematicEuler.set(x, y, z)
    kinematicRotation.setFromEuler(kinematicEuler)
    body.setNextKinematicRotation(kinematicRotation)
}

const setNextTranslation = (body, x, y, z) =>
{
    if(!body)
        return

    kinematicTranslation.x = x
    kinematicTranslation.y = y
    kinematicTranslation.z = z
    body.setNextKinematicTranslation(kinematicTranslation)
}

/**
 * Block building pieces
 */
function useBlockAnimation(animate)
{
    const time = useRef(Math.random() * Math.PI * 2)

    useFrame((state, delta) =>
    {
        if(useGame.getState().phase === 'paused')
            return

        time.current += delta
        animate(time.current)
    })
}

function BlockFloor({ material = floor2Material, position = [ 0, -0.1, 0 ], scale = [ 4, 0.2, 4 ] })
{
    return <RigidBody type="fixed" restitution={ 0.2 } friction={ 1 }>
        <mesh geometry={ boxGeometry } material={ material } position={ position } scale={ scale } receiveShadow />
    </RigidBody>
}

function Obstacle({ ref, position = [ 0, 0.3, 0 ], children })
{
    return <RigidBody ref={ ref } type="kinematicPosition" position={ position } restitution={ 0.2 } friction={ 0 }>
        { children }
    </RigidBody>
}

function ObstacleBox(props)
{
    return <mesh geometry={ boxGeometry } material={ obstacleMaterial } castShadow receiveShadow { ...props } />
}

/**
 * Blocks
 */
export function BlockStart({ position = [ 0, 0, 0 ], level = 1 })
{
    return <group position={ position }>
        <Sparkles
            size={ 4 }
            scale={ [ 4, 2, 4 ] }
            position-y={ 1 }
            speed={ 0.2 }
            count={ 30 }
            color='aqua'
            noise={ 0.5 }
            type='sphere'
        />

        <Float floatIntensity={ 0.25 } rotationIntensity={ 0.25 }>
            <Text
                font={ fontURL }
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

        <Float floatIntensity={ 0.25 } rotationIntensity={ 0.25 }>
            <Text
                font={ fontURL }
                scale={ 0.12 }
                lineHeight={ 1.1 }
                textAlign="left"
                anchorX="right"
                position={ [ - 0.45, 0.65, 0 ] }
                rotation-y={ 0.25 }
            >
                { startHints }
                <meshBasicMaterial toneMapped={ false } />
            </Text>
        </Float>
        <BlockFloor material={ floor1Material } />
    </group>
}

export function BlockEnd({ position = [ 0, 0, 0 ], level = 1 })
{
    const trophy = useGLTF(`${import.meta.env.BASE_URL}trophy.glb`)

    useEffect(() =>
    {
        trophy.scene.children.forEach((mesh) =>
        {
            mesh.castShadow = true
        })
    }, [ trophy ])

    const trophyRef = useRef();

    useFrame((state) =>
    {
        const time = state.clock.getElapsedTime()

        setNextRotation(trophyRef.current, 0, time * -level * 0.01, 0)
    })

    return <group position={ position }>
        <Sparkles
            size={ 4 }
            scale={ [ 4, 2, 4 ] }
            position-y={ 1 }
            speed={ 0.2 }
            count={ 30 }
            color='hotpink'
            noise={ 0.5 }
            type='sphere'
        />

        <Text
            font={ fontURL }
            scale={ 1 }
            position={ [ 0, 2.25, 2 ] }
        >
            FINISH
            <meshBasicMaterial toneMapped={ false } />
        </Text>
        <BlockFloor material={ floor1Material } />
        <RigidBody ref={ trophyRef } type="kinematicPosition" colliders="hull" position={ [ 0, 0.25, 0 ] } restitution={ 0.2 } friction={ 0 }>
            <primitive object={ trophy.scene } scale={ 0.099 + level / 100 } />
        </RigidBody>
    </group>
}

export function BlockSpinner({ position = [ 0, 0, 0 ] })
{
    const obstacle = useRef()
    const [ speed ] = useState(() => (Math.random() + 0.2) * (Math.random() < 0.5 ? - 1 : 1))

    useBlockAnimation((time) =>
    {
        setNextRotation(obstacle.current, 0, time * speed, 0)
    })

    return <group position={ position }>
        <BlockFloor />
        <Obstacle ref={ obstacle }>
            <ObstacleBox scale={ [ 3.5, 0.3, 0.3 ] } />
        </Obstacle>
    </group>
}

export function BlockSpinner2({ position = [ 0, 0, 0 ] })
{
    const obstacle = useRef()
    const [ speed ] = useState(() => (Math.random() + 0.2) * (Math.random() < 0.5 ? - 1 : 1))

    useBlockAnimation((time) =>
    {
        setNextRotation(obstacle.current, 0, 0, time * speed)
    })

    return <group position={ position }>
        <BlockFloor />
        <Obstacle ref={ obstacle } position={ [ 0, 0.75, 0 ] }>
            <ObstacleBox scale={ [ 3.5, 0.5, 0.5 ] } />
            <ObstacleBox scale={ [ 0.5, 3.5, 0.5 ] } />
        </Obstacle>
    </group>
}

export function BlockLimbo({ position = [ 0, 0, 0 ] })
{
    const obstacle = useRef()

    useBlockAnimation((time) =>
    {
        const y = Math.sin(time) + 1.15
        setNextTranslation(obstacle.current, position[0], position[1] + y, position[2])
    })

    return <group position={ position }>
        <BlockFloor />
        <Obstacle ref={ obstacle }>
            <ObstacleBox scale={ [ 3.5, 0.3, 0.3 ] } />
        </Obstacle>
    </group>
}

export function BlockAxe({ position = [ 0, 0, 0 ] })
{
    const obstacle = useRef()
    const [ axe1On ] = useState(() => Math.random() > 0.5 ? true : false);
    const [ axe2On ] = useState(() => Math.random() < 0.5 ? true : false);

    const boxPosition = new THREE.Vector3(0, 0, 0);
    const boxScale = new THREE.Vector3(1.375, 1.5, 0.3);

    if (axe1On && axe2On) {
        boxScale.set(1.25, 1.5, 0.3);
    } else if (!axe2On) {
        boxPosition.set(0.0625, 0, 0);
    } else if (!axe1On) {
        boxPosition.set(-0.0625, 0, 0);
    } else {
        boxScale.set(1.5, 1.5, 0.3);
    }

    useBlockAnimation((time) =>
    {
        const x = Math.sin(time) * 1.25
        setNextTranslation(obstacle.current, position[0] + x, position[1] + 0.75, position[2])
    })

    return <group position={ position }>
        <BlockFloor />
        <Obstacle ref={ obstacle }>
            { axe1On && <ObstacleBox position={ [ -0.625, 0, 0 ] } scale={ [ 0.15 * 1.414, 1.5, 0.15 * 1.414 ] } rotation={ [0, Math.PI / 4, 0] } /> }
            <ObstacleBox position={ boxPosition } scale={ boxScale } />
            { axe2On && <ObstacleBox position={ [ 0.625, 0, 0 ] } scale={ [ 0.15 * 1.414, 1.5, 0.15 * 1.414 ] } rotation={ [0, Math.PI / 4, 0] } /> }
        </Obstacle>
    </group>
}

export function BlockStrip({ position = [ 0, 0, 0 ] })
{
    const obstacle1 = useRef()
    const obstacle2 = useRef()

    useBlockAnimation((time) =>
    {
        const y = Math.sin(time) + 1.15
        setNextTranslation(obstacle1.current, position[0], position[1] + y, position[2])
        setNextTranslation(obstacle2.current, position[0], position[1] - y, position[2])
    })

    return <group position={ position }>
        <BlockFloor />
        <Obstacle ref={ obstacle1 }>
            <ObstacleBox position={ [ 0, 0, 1 ] } scale={ [ 3.5, 0.5, 0.5 ] } />
            <ObstacleBox position={ [ 0, 0, 0 ] } scale={ [ 3.5, 0.5, 0.5 ] } />
            <ObstacleBox position={ [ 0, 0, -1 ] } scale={ [ 3.5, 0.5, 0.5 ] } />
        </Obstacle>
        <Obstacle ref={ obstacle2 }>
            <ObstacleBox position={ [ 0, 2.5, 0.5 ] } scale={ [ 3.5, 0.5, 0.5 ] } />
            <ObstacleBox position={ [ 0, 2.5, -0.5 ] } scale={ [ 3.5, 0.5, 0.5 ] } />
        </Obstacle>
    </group>
}

export function BlockPlatform({ position = [ 0, 0, 0 ] })
{
    const obstacle = useRef()

    useBlockAnimation((time) =>
    {
        const x = Math.sin(time)
        setNextTranslation(obstacle.current, position[0] + x, position[1], position[2])
    })

    return <group position={ position }>
        <Obstacle ref={ obstacle }>
            <ObstacleBox position={ [ 0, -0.1, 0 ] } scale={ [ 2, 0.2, 4 ] } />
        </Obstacle>
    </group>
}

export function BlockPlatform2({ position = [ 0, 0, 0 ] })
{
    const obstacle1 = useRef()
    const obstacle2 = useRef()

    useBlockAnimation((time) =>
    {
        const x = Math.sin(time)
        setNextTranslation(obstacle1.current, position[0] + x, position[1], position[2])
        setNextTranslation(obstacle2.current, position[0] - x, position[1], position[2])
    })

    return <group position={ position }>
        <Obstacle ref={ obstacle1 }>
            <ObstacleBox position={ [ 0, -0.1, 1 ] } scale={ [ 1, 0.2, 1 ] } />
        </Obstacle>
        <Obstacle ref={ obstacle2 }>
            <ObstacleBox position={ [ 0, -0.1, -1 ] } scale={ [ 1, 0.2, 1 ] } />
        </Obstacle>
    </group>
}

export function BlockPlatform3({ position = [ 0, 0, 0 ] })
{
    const obstacle = useRef()

    useBlockAnimation((time) =>
    {
        const x = Math.cos(time)
        const z = Math.sin(time)
        setNextTranslation(obstacle.current, position[0] + x, position[1], position[2] + z)
    })

    return <group position={ position }>
        <Obstacle ref={ obstacle }>
            <ObstacleBox position={ [ 0, -0.1, 0 ] } scale={ [ 1.5, 0.2, 1.5 ] } />
        </Obstacle>
    </group>
}

export function BlockStairs1({ position = [ 0, 0, 0 ] })
{
    const obstacle1 = useRef()
    const obstacle2 = useRef()
    const obstacle3 = useRef()
    const obstacle4 = useRef()

    useBlockAnimation((time) =>
    {
        const y = Math.sin(time) + 1.15
        setNextTranslation(obstacle1.current, position[0], position[1] - y, position[2])
        setNextTranslation(obstacle2.current, position[0], position[1] + y / 2, position[2])
        setNextTranslation(obstacle3.current, position[0], position[1] - y / 2, position[2])
        setNextTranslation(obstacle4.current, position[0], position[1] + y, position[2])
    })

    return <group position={ position }>
        <BlockFloor position={ [ 0, -0.1, 1.5 ] } scale={ [ 4, 0.2, 1 ] } />
        <Obstacle ref={ obstacle1 }>
            <ObstacleBox position={ [ 0, 2.25, 1 ] } scale={ [ 3.5, 0.5, 0.5 ] } />
        </Obstacle>
        <Obstacle ref={ obstacle2 }>
            <ObstacleBox position={ [ 0, 0, 0.5 ] } scale={ [ 3.5, 0.5, 0.5 ] } />
        </Obstacle>
        <Obstacle ref={ obstacle3 }>
            <ObstacleBox position={ [ 0, 2.25, 0 ] } scale={ [ 3.5, 0.5, 0.5 ] } />
        </Obstacle>
        <Obstacle ref={ obstacle4 }>
            <ObstacleBox position={ [ 0, 0, -0.5 ] } scale={ [ 3.5, 0.5, 0.5 ] } />
        </Obstacle>
        <Obstacle>
            <ObstacleBox position={ [ 0, 1.5, -1 ] } scale={ [ 3.5, 2.75, 0.5 ] } />
        </Obstacle>
    </group>
}

export function BlockStairs2({ position = [ 0, 0, 0 ] })
{
    const obstacle1 = useRef()
    const obstacle2 = useRef()

    useBlockAnimation((time) =>
    {
        const y = Math.sin(time) + 1.15
        setNextTranslation(obstacle1.current, position[0], position[1] - y, position[2])
        setNextTranslation(obstacle2.current, position[0], position[1] + y / 2, position[2])
    })

    return <group position={ position }>
        <BlockFloor />
        <Obstacle ref={ obstacle1 }>
            <ObstacleBox position={ [ 0, 2.25, 1 ] } scale={ [ 3.5, 0.5, 0.5 ] } />
            <ObstacleBox position={ [ 0, 2.25, -1 ] } scale={ [ 3.5, 0.5, 0.5 ] } />
        </Obstacle>
        <Obstacle>
            <ObstacleBox position={ [ 0, 0.75, 0 ] } scale={ [ 3.5, 2, 0.5 ] } />
        </Obstacle>
        <Obstacle ref={ obstacle2 }>
            <ObstacleBox position={ [ 0, 0, 0.5 ] } scale={ [ 3.5, 0.5, 0.5 ] } />
            <ObstacleBox position={ [ 0, 0, -0.5 ] } scale={ [ 3.5, 0.5, 0.5 ] } />
        </Obstacle>
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
            {/* Invisible Walls - colliders only, nothing to render */}
            <CuboidCollider
                args={ [ 0.15, 1.5, 2 * length ] }
                position={ [ 2.15, 3.5, - (length * 2) + 2 ] }
                restitution={ 0.2 }
                friction={ 0 }
            />
            <CuboidCollider
                args={ [ 0.15, 1.5, 2 * length ] }
                position={ [ - 2.15, 3.5, - (length * 2) + 2 ] }
                restitution={ 0.2 }
                friction={ 0 }
            />
            <CuboidCollider
                args={ [ 2, 1.5, 0.15 ] }
                position={ [ 0, 3.5, - (length * 4) + 2] }
                restitution={ 0.2 }
                friction={ 0 }
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

// Defined once so the useMemo below isn't invalidated by a new array on every render
const defaultTypes = [ BlockSpinner, BlockSpinner2, BlockAxe, BlockLimbo, BlockStrip, BlockPlatform, BlockPlatform2, BlockPlatform3, BlockStairs1, BlockStairs2 ]

export function Level({
    count = 5,
    types = defaultTypes,
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
