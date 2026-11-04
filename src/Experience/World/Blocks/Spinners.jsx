import { useState, useRef } from 'react'
import { BlockFloor, Obstacle, ObstacleBox, useBlockAnimation, setNextRotation } from './Shared.jsx'

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
