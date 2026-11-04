import * as THREE from 'three'
import { useState, useRef } from 'react'
import { BlockFloor, Obstacle, ObstacleBox, useBlockAnimation, setNextTranslation } from './Shared.jsx'

export function BlockLimbo({ position = [ 0, 0, 0 ] }) {
    const obstacle = useRef()

    useBlockAnimation((time) => {
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

export function BlockAxe({ position = [ 0, 0, 0 ] }) {
    const obstacle = useRef()
    const [ axe1On ] = useState(() => Math.random() > 0.5 ? true : false)
    const [ axe2On ] = useState(() => Math.random() < 0.5 ? true : false)

    const boxPosition = new THREE.Vector3(0, 0, 0)
    const boxScale = new THREE.Vector3(1.375, 1.5, 0.3)

    if (axe1On && axe2On) {
        boxScale.set(1.25, 1.5, 0.3)
    } else if (!axe2On) {
        boxPosition.set(0.0625, 0, 0)
    } else if (!axe1On) {
        boxPosition.set(-0.0625, 0, 0)
    } else {
        boxScale.set(1.5, 1.5, 0.3)
    }

    useBlockAnimation((time) => {
        const x = Math.sin(time) * 1.25
        setNextTranslation(obstacle.current, position[0] + x, position[1] + 0.75, position[2])
    })

    return <group position={ position }>
        <BlockFloor />
        <Obstacle ref={ obstacle }>
            { axe1On && <ObstacleBox position={ [ -0.625, 0, 0 ] } scale={ [ 0.15 * 1.414, 1.5, 0.15 * 1.414 ] } rotation={ [ 0, Math.PI / 4, 0 ] } /> }
            <ObstacleBox position={ boxPosition } scale={ boxScale } />
            { axe2On && <ObstacleBox position={ [ 0.625, 0, 0 ] } scale={ [ 0.15 * 1.414, 1.5, 0.15 * 1.414 ] } rotation={ [ 0, Math.PI / 4, 0 ] } /> }
        </Obstacle>
    </group>
}

export function BlockStrip({ position = [ 0, 0, 0 ] }) {
    const obstacle1 = useRef()
    const obstacle2 = useRef()

    useBlockAnimation((time) => {
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
