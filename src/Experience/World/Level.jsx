import { RigidBody, CuboidCollider } from '@react-three/rapier'
import { useMemo } from 'react'
import { BlockStart, BlockEnd, obstacleTypes } from './Blocks/index.js'
import { boxGeometry, wallMaterial } from './Blocks/Shared.jsx'

function Bounds({ length = 1 }) {
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
                position={ [ 0, 1, - (length * 4) + 2 ] }
                geometry={ boxGeometry }
                material={ wallMaterial }
                scale={ [ 4, 2, 0.3 ] }
                receiveShadow
            />
            { /* Invisible Walls */ }
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
                position={ [ 0, 3.5, - (length * 4) + 2 ] }
                restitution={ 0.2 }
                friction={ 0 }
            />
            { /* <CuboidCollider
                type="fixed"
                args={ [ 2, 0.1, 2 * length ] }
                position={ [ 0, -0.1, - (length * 2) + 2 ] }
                restitution={ 0.2 }
                friction={ 1 }
            /> */ }
        </RigidBody>
    </>
}

export function Level({
    count = 5,
    types = obstacleTypes,
    seed = 0,
    level = 1
}) {
    const blocks = useMemo(() => {
        const blocks = []

        for (let i = 0; i < count; i++) {
            const type = types[ Math.floor(Math.random() * types.length) ]
            blocks.push(type)
        }

        return blocks
    // seed and level are intentional: changing either re-rolls the random blocks
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ count, types, seed, level ])

    return <>
        <BlockStart position={ [ 0, 0, 0 ] } level={ level } />

        { blocks.map((Block, index) => <Block key={ index } position={ [ 0, 0, - (index + 1) * 4 ] } />) }

        <BlockEnd position={ [ 0, 0, - (count + 1) * 4 ] } level={ level } key={ level } />

        <Bounds length={ count + 2 } />
    </>
}
