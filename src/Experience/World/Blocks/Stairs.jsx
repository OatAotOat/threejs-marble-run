import { useRef } from 'react'
import { BlockFloor, Obstacle, ObstacleBox, useBlockAnimation, setNextTranslation } from './Shared.jsx'

export function BlockStairs1({ position = [ 0, 0, 0 ] }) {
    const obstacle1 = useRef()
    const obstacle2 = useRef()
    const obstacle3 = useRef()
    const obstacle4 = useRef()

    useBlockAnimation((time) => {
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

export function BlockStairs2({ position = [ 0, 0, 0 ] }) {
    const obstacle1 = useRef()
    const obstacle2 = useRef()

    useBlockAnimation((time) => {
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
