import * as THREE from 'three'
import { useState, useRef } from 'react'
import { RigidBody, CuboidCollider } from '@react-three/rapier'
import { BlockFloor, Obstacle, ObstacleBox, useBlockAnimation, setNextTranslation, setNextRotation } from './Shared.jsx'
import {
    cylinderYGeometry,
    cylinderXGeometry,
    LaserBeam,
    laserSpan,
    coreGeometry,
    coreMaterial,
    emitterGeometry,
    emitterMaterial,
    useLaserContact,
    zapPlayer,
} from './LaserBeam.jsx'

const marbleHeight = 0.3

const randomSpeed = () => (Math.random() * 0.6 + 0.6) * (Math.random() < 0.5 ? - 1 : 1)

export function BlockLaserLimbo({ position = [ 0, 0, 0 ] }) {
    const laser = useRef()

    useBlockAnimation((time) => {
        const y = Math.sin(time) + 1.15
        setNextTranslation(laser.current, position[0], position[1] + y, position[2])
    })

    return <group position={ position }>
        <BlockFloor />
        <LaserBeam ref={ laser } />
    </group>
}

export function BlockLaserSweeper({ position = [ 0, 0, 0 ] }) {
    const laser = useRef()
    const [ speed ] = useState(randomSpeed)

    useBlockAnimation((time) => {
        setNextRotation(laser.current, 0, time * speed, 0)
    })

    return <group position={ position }>
        <BlockFloor />
        <Obstacle position={ [ 0, 0, 0 ] }>
            <ObstacleBox geometry={ cylinderYGeometry } position={ [ 0, 0.35, 0 ] } scale={ [ 0.3, 0.7, 0.3 ] } material={ emitterMaterial } />
        </Obstacle>
        <LaserBeam ref={ laser } position={ [ 0, marbleHeight, 0 ] } length={ 3.6 } />
    </group>
}

export function BlockHurdles({ position = [ 0, 0, 0 ] }) {
    return <group position={ position }>
        <BlockFloor />
        <LaserBeam position={ [ 0, marbleHeight, 1 ] } />
        <LaserBeam position={ [ 0, marbleHeight, -1 ] } />
    </group>
}

const pulsePeriod = 3
const pulseOnDuration = 1.2
const pulseWarningDuration = 0.5

const getPulsePower = (time) => {
    const cycle = ((time % pulsePeriod) + pulsePeriod) % pulsePeriod

    if (cycle < pulseOnDuration) { return 1 }
    if (cycle > pulsePeriod - pulseWarningDuration) { return 0.5 }

    return 0
}

export function BlockPulseGates({ position = [ 0, 0, 0 ] }) {
    const [ powers ] = useState(() => [ { current: 0 }, { current: 0 }, { current: 0 } ])

    useBlockAnimation((time) => {
        powers.forEach((power, index) => {
            power.current = getPulsePower(time - index * pulsePeriod / powers.length)
        })
    })

    return <group position={ position }>
        <BlockFloor />
        <LaserBeam position={ [ 0, marbleHeight, 1.25 ] } power={ powers[0] } />
        <LaserBeam position={ [ 0, marbleHeight, 0 ] } power={ powers[1] } />
        <LaserBeam position={ [ 0, marbleHeight, -1.25 ] } power={ powers[2] } />
    </group>
}

export function BlockLaserWindmill({ position = [ 0, 0, 0 ] }) {
    const laser1 = useRef()
    const laser2 = useRef()
    const [ speed ] = useState(randomSpeed)

    useBlockAnimation((time) => {
        setNextRotation(laser1.current, 0, 0, time * speed)
        setNextRotation(laser2.current, 0, 0, time * speed + Math.PI / 2)
    })

    return <group position={ position }>
        <BlockFloor />
        <Obstacle position={ [ 0, 0, 0 ] }>
            <ObstacleBox geometry={ cylinderXGeometry } position={ [ 0, 0.75, 0 ] } scale={ [ 0.35, 0.35, 0.35 ] } material={ emitterMaterial } />
        </Obstacle>
        <LaserBeam ref={ laser1 } position={ [ 0, 0.75, 0 ] } length={ 3.5 } />
        <LaserBeam ref={ laser2 } position={ [ 0, 0.75, 0 ] } length={ 3.5 } />
    </group>
}

const axeHalfWidth = 0.75
const axeBeamLength = 3.3
const axeBladeOffset = 0.625
const axeBladeSize = 0.15 * Math.SQRT2
const wallEmitterX = 1.94

export function BlockLaserAxe({ position = [ 0, 0, 0 ] }) {
    const axe = useRef()
    const laser = useRef()
    const [ side ] = useState(() => Math.random() < 0.5 ? - 1 : 1)
    const [ bladeOn ] = useState(() => Math.random() < 0.5)

    useBlockAnimation((time) => {
        const x = Math.sin(time) * 1.25
        setNextTranslation(axe.current, position[0] + x, position[1] + 0.75, position[2])
        setNextTranslation(laser.current, position[0] + x + side * (axeHalfWidth + axeBeamLength / 2), position[1] + marbleHeight, position[2])
    })

    return <group position={ position }>
        <BlockFloor />
        <Obstacle ref={ axe }>
            { bladeOn
                ? <>
                    <ObstacleBox position={ [ side * 0.0625, 0, 0 ] } scale={ [ 1.375, 1.5, 0.3 ] } />
                    <ObstacleBox
                        position={ [ - side * axeBladeOffset, 0, 0 ] }
                        scale={ [ axeBladeSize, 1.5, axeBladeSize ] }
                        rotation={ [ 0, Math.PI / 4, 0 ] }
                    />
                </>
                : <ObstacleBox scale={ [ axeHalfWidth * 2, 1.5, 0.3 ] } />
            }
            <mesh geometry={ emitterGeometry } material={ emitterMaterial } position={ [ side * (axeHalfWidth + 0.06), marbleHeight - 0.75, 0 ] } />
        </Obstacle>
        <LaserBeam ref={ laser } length={ axeBeamLength } emitters={ false } />
        <mesh geometry={ emitterGeometry } material={ emitterMaterial } position={ [ side * wallEmitterX, marbleHeight, 0 ] } />
    </group>
}

export function BlockLaserStairs({ position = [ 0, 0, 0 ] }) {
    const obstacle1 = useRef()
    const obstacle2 = useRef()
    const [ power ] = useState(() => ({ current: 0 }))

    useBlockAnimation((time) => {
        const y = Math.sin(time) + 1.15
        setNextTranslation(obstacle1.current, position[0], position[1] - y, position[2])
        setNextTranslation(obstacle2.current, position[0], position[1] + y / 2, position[2])
        power.current = getPulsePower(time)
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
        <LaserBeam position={ [ 0, 2.05, 0 ] } power={ power } />
    </group>
}

const scanSweepDuration = 3
const scanHeight = 1
const scanThickness = 0.05
const scanEdge = laserSpan / 2
const coverSize = [ 1, 1.5, 1 ]

const scanGeometry = new THREE.PlaneGeometry(1, 1)
const scanMaterial = new THREE.MeshBasicMaterial({
    color: '#ff2a2a',
    transparent: true,
    opacity: 0.25,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
})

function ScanPart({ ref, from, to }) {
    const width = to - from

    return <group ref={ ref } position-x={ (from + to) / 2 }>
        <mesh geometry={ scanGeometry } material={ scanMaterial } scale={ [ width, scanHeight, 1 ] } position-y={ scanHeight / 2 } />
        <mesh geometry={ coreGeometry } material={ coreMaterial } scale={ [ width, scanHeight * 17.5, 1, 1, 16 ] } position-y={ scanHeight / 2 } />
    </group>
}

export function BlockScanner({ position = [ 0, 0, 0 ] }) {
    const scanner = useRef()
    const shadowedPart = useRef()
    const { touching, player, onIntersectionEnter, onIntersectionExit } = useLaserContact()
    const [ coverX ] = useState(() => Math.random() < 0.5 ? - 0.5 : 0.5)
    const shelterSide = coverX < 0 ? 1 : - 1
    const coverEdge = coverX + shelterSide * coverSize[0] / 2

    useBlockAnimation((time) => {
        const scanZ = - Math.cos(time * Math.PI / scanSweepDuration) * 2

        setNextTranslation(scanner.current, position[0], position[1], position[2] + scanZ)

        shadowedPart.current.visible = Math.abs(scanZ) > coverSize[2] / 2

        if (touching.current === 0 || !player.current) { return }

        const marble = player.current.translation()
        const sheltered = shelterSide * (marble.x - position[0] - coverEdge) > 0 && Math.abs(marble.z - position[2]) < coverSize[2] / 2

        if (!sheltered) { zapPlayer({ normal: { x: 0, y: 0, z: 1 } }) }
    })

    return <group position={ position }>
        <BlockFloor />
        <Obstacle position={ [ 0, 0, 0 ] }>
            <ObstacleBox position={ [ coverX, coverSize[1] / 2, 0 ] } scale={ coverSize } />
        </Obstacle>
        <RigidBody ref={ scanner } type="kinematicPosition" colliders={ false } position={ [ 0, 0, - 2 ] }>
            <ScanPart from={ Math.min(- shelterSide * scanEdge, coverEdge) } to={ Math.max(- shelterSide * scanEdge, coverEdge) } />
            <ScanPart ref={ shadowedPart } from={ Math.min(coverEdge, shelterSide * scanEdge) } to={ Math.max(coverEdge, shelterSide * scanEdge) } />
            <mesh geometry={ emitterGeometry } material={ emitterMaterial } position={ [ -scanEdge, scanHeight / 2, 0 ] } scale-y={ (scanHeight + 0.1) / 0.2 } />
            <mesh geometry={ emitterGeometry } material={ emitterMaterial } position={ [ scanEdge, scanHeight / 2, 0 ] } scale-y={ (scanHeight + 0.1) / 0.2 } />
            <CuboidCollider
                sensor
                args={ [ scanEdge, scanHeight / 2, scanThickness ] }
                position={ [ 0, scanHeight / 2, 0 ] }
                onIntersectionEnter={ onIntersectionEnter }
                onIntersectionExit={ onIntersectionExit }
            />
        </RigidBody>
    </group>
}

export function BlockTripwire({ position = [ 0, 0, 0 ] }) {
    const platform = useRef()

    useBlockAnimation((time) => {
        const x = Math.sin(time)
        setNextTranslation(platform.current, position[0] + x, position[1], position[2])
    })

    return <group position={ position }>
        <Obstacle ref={ platform }>
            <ObstacleBox position={ [ 0, -0.1, 0 ] } scale={ [ 2, 0.2, 4 ] } />
        </Obstacle>
        <LaserBeam position={ [ 0, marbleHeight, 0 ] } />
    </group>
}
