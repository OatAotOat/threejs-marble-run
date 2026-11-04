import { useRef } from 'react'
import { Obstacle, ObstacleBox, useBlockAnimation, setNextTranslation } from './Shared.jsx'

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
