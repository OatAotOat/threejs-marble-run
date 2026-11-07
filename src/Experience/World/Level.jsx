import { RigidBody, CuboidCollider } from '@react-three/rapier'
import { useMemo } from 'react'
import { BlockStart, BlockEnd, getBlockTypes } from './Blocks/index.js'
import { boxGeometry, wallMaterial } from './Blocks/Shared.jsx'
import { blockLength, getBlockZ } from './layout.js'
import useQuality, { selectSceneryShadows } from '../../stores/useQuality.jsx'

function Bounds({ length = 1 }) {
    const castShadow = useQuality(selectSceneryShadows)
    const trackLength = length * blockLength
    const centerZ = getBlockZ(0) + blockLength / 2 - trackLength / 2
    const backZ = getBlockZ(0) + blockLength / 2 - trackLength

    return <>
        <RigidBody type="fixed" restitution={ 0.2 } friction={ 0 }>
            <mesh
                position={ [ 2.15, 1, centerZ ] }
                geometry={ boxGeometry }
                material={ wallMaterial }
                scale={ [ 0.3, 2, trackLength ] }
                castShadow={ castShadow }
            />
            <mesh
                position={ [ - 2.15, 1, centerZ ] }
                geometry={ boxGeometry }
                material={ wallMaterial }
                scale={ [ 0.3, 2, trackLength ] }
                receiveShadow
            />
            <mesh
                position={ [ 0, 1, backZ ] }
                geometry={ boxGeometry }
                material={ wallMaterial }
                scale={ [ 4, 2, 0.3 ] }
                receiveShadow
            />
            { /* Invisible Walls */ }
            <CuboidCollider
                args={ [ 0.15, 1.5, trackLength / 2 ] }
                position={ [ 2.15, 3.5, centerZ ] }
                restitution={ 0.2 }
                friction={ 0 }
            />
            <CuboidCollider
                args={ [ 0.15, 1.5, trackLength / 2 ] }
                position={ [ - 2.15, 3.5, centerZ ] }
                restitution={ 0.2 }
                friction={ 0 }
            />
            <CuboidCollider
                args={ [ 2, 1.5, 0.15 ] }
                position={ [ 0, 3.5, backZ ] }
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
    seed = 0,
    level = 1
}) {
    const types = getBlockTypes(level)

    const blocks = useMemo(() => {
        const blocks = []

        for (let i = 0; i < count; i++) {
            const type = types[ Math.floor(Math.random() * types.length) ]
            blocks.push(type)
        }

        return blocks
    }, [ count, types, seed, level ])

    return <>
        <BlockStart position={ [ 0, 0, getBlockZ(0) ] } level={ level } />

        { blocks.map((Block, index) => <Block key={ index } position={ [ 0, 0, getBlockZ(index + 1) ] } />) }

        <BlockEnd position={ [ 0, 0, getBlockZ(count + 1) ] } level={ level } key={ level } />

        <Bounds length={ count + 2 } />
    </>
}
