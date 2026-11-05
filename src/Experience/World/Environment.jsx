import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const cycleDuration = 180

const sky = {
    day: new THREE.Color('#bdedfc'),
    sunset: new THREE.Color('#f6b48f'),
    night: new THREE.Color('#1c2b4d'),
}

const sunColor = {
    day: new THREE.Color('#ffffff'),
    sunset: new THREE.Color('#ffb27a'),
    night: new THREE.Color('#9fb6ff'),
}

const ambientColor = {
    day: new THREE.Color('#ffffff'),
    sunset: new THREE.Color('#ffd9c4'),
    night: new THREE.Color('#7186c9'),
}

const sunIntensity = { day: 4.5, sunset: 3, night: 1.3 }
const ambientIntensity = { day: 1.5, sunset: 1.1, night: 0.7 }

const blendColor = (target, colors, dayness) => {
    return dayness > 0.5
        ? target.lerpColors(colors.sunset, colors.day, (dayness - 0.5) * 2)
        : target.lerpColors(colors.night, colors.sunset, dayness * 2)
}

const blendValue = (values, dayness) => {
    return dayness > 0.5
        ? THREE.MathUtils.lerp(values.sunset, values.day, (dayness - 0.5) * 2)
        : THREE.MathUtils.lerp(values.night, values.sunset, dayness * 2)
}

export default function Environment() {
    const background = useRef()
    const light = useRef()
    const ambient = useRef()

    useFrame((state) => {
        light.current.position.z = state.camera.position.z + 1 - 4
        light.current.target.position.z = state.camera.position.z - 4
        light.current.target.updateMatrixWorld()

        const cycle = (state.clock.elapsedTime % cycleDuration) / cycleDuration
        const dayness = 0.5 + 0.5 * Math.cos(cycle * Math.PI * 2)

        blendColor(background.current, sky, dayness)
        blendColor(light.current.color, sunColor, dayness)
        blendColor(ambient.current.color, ambientColor, dayness)

        light.current.intensity = blendValue(sunIntensity, dayness)
        ambient.current.intensity = blendValue(ambientIntensity, dayness)
    })

    return <>
        <color ref={ background } args={ [ '#bdedfc' ] } attach="background" />

        <directionalLight
            ref={ light }
            castShadow
            position={ [ 4, 4, 1 ] }
            intensity={ 4.5 }
            shadow-mapSize={ [ 1024, 1024 ] }
            shadow-camera-near={ 1 }
            shadow-camera-far={ 10 }
            shadow-camera-top={ 10 }
            shadow-camera-right={ 10 }
            shadow-camera-bottom={ -10 }
            shadow-camera-left={ -10 }
        />
        <ambientLight ref={ ambient } intensity={ 1.5 } />
    </>
}
