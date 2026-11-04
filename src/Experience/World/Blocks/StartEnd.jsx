import { RigidBody } from '@react-three/rapier'
import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, Text, useGLTF, Sparkles } from '@react-three/drei'
import { isMobileDevice } from '../../../Utils/device.js'
import usePlayer from '../../../stores/usePlayer.jsx'
import sources from '../../sources.js'
import { BlockFloor, floor1Material, setNextRotation } from './Shared.jsx'

const isTouch = isMobileDevice()
const desktopHints = 'WASD / Arrows : Roll\nSpace : Jump\nR : Restart\nEsc : Pause\nM : Mute'

export function BlockStart({ position = [ 0, 0, 0 ], level = 1 }) {
    const tiltEnabled = usePlayer((state) => state.tiltEnabled)

    const startHints = isTouch
        ? `${ tiltEnabled ? 'Tilt' : 'Left Side' } : Roll\nRight Button : Jump`
        : desktopHints

    return <group position={ position }>
        <Sparkles
            size={ 4 }
            scale={ [ 4, 2, 4 ] }
            position-y={ 1 }
            speed={ 0.2 }
            count={ 30 }
            color="aqua"
            noise={ 0.5 }
            type="sphere"
        />

        <Float floatIntensity={ 0.25 } rotationIntensity={ 0.25 }>
            <Text
                font={ sources.font }
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
                font={ sources.font }
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

export function BlockEnd({ position = [ 0, 0, 0 ], level = 1 }) {
    const trophy = useGLTF(sources.trophy)

    useEffect(() => {
        trophy.scene.children.forEach((mesh) => {
            mesh.castShadow = true
        })
    }, [ trophy ])

    const trophyRef = useRef()

    useFrame((state) => {
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
            color="hotpink"
            noise={ 0.5 }
            type="sphere"
        />

        <Text
            font={ sources.font }
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
