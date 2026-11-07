import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import useQuality from '../../stores/useQuality.jsx'

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

const fitAces = (value) => (value * (value + 0.0245786) - 0.000090537) / (value * (0.983729 * value + 0.4329510) + 0.238081)

const toneMapAces = (color) => {
    const r = color.r / 0.6
    const g = color.g / 0.6
    const b = color.b / 0.6

    const x = fitAces(0.59719 * r + 0.35458 * g + 0.04823 * b)
    const y = fitAces(0.07600 * r + 0.90834 * g + 0.01566 * b)
    const z = fitAces(0.02840 * r + 0.13383 * g + 0.83777 * b)

    return color.setRGB(
        THREE.MathUtils.clamp(1.60475 * x - 0.53108 * y - 0.07367 * z, 0, 1),
        THREE.MathUtils.clamp(- 0.10208 * x + 1.10813 * y - 0.00605 * z, 0, 1),
        THREE.MathUtils.clamp(- 0.00327 * x - 0.07276 * y + 1.07602 * z, 0, 1)
    )
}

export default function Environment() {
    const background = useRef()
    const light = useRef()
    const ambient = useRef()
    const lowQuality = useQuality((state) => state.quality === 'low')
    const shadowMapSize = lowQuality ? 512 : 1024

    useEffect(() => {
        const shadow = light.current.shadow

        shadow.mapSize.set(shadowMapSize, shadowMapSize)
        shadow.map?.dispose()
        shadow.map = null
    }, [ shadowMapSize ])

    useFrame((state) => {
        light.current.position.z = state.camera.position.z + 1 - 4
        light.current.target.position.z = state.camera.position.z - 4
        light.current.target.updateMatrixWorld()

        const cycle = (state.clock.elapsedTime % cycleDuration) / cycleDuration
        const dayness = 0.5 + 0.5 * Math.cos(cycle * Math.PI * 2)

        blendColor(background.current, sky, dayness)

        if (lowQuality) { toneMapAces(background.current) }
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
