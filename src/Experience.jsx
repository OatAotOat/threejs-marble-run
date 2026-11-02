import { Physics } from '@react-three/rapier'
import { useThree } from '@react-three/fiber'
import { useEffect, lazy, Suspense } from 'react'
import useGame from './stores/useGame.jsx'
import Lights from './Lights.jsx'
import { Level } from './Level.jsx'
import Player from './Player.jsx'
import Effects from './Effects.jsx'
import { PerformanceMonitor } from '@react-three/drei'
import useQuality from './stores/useQuality.jsx'
import { getCameraFov, isMobileDevice } from './device.js'

const debug = window.location.hash === '#debug'

const Perf = lazy(() => import('r3f-perf').then((module) => ({ default: module.Perf })))

export default function Experience()
{
    const blocksCount = useGame((state) => state.blocksCount)
    const blocksSeed = useGame(state => state.blocksSeed)
    const level = useGame(state => state.level)
    const adaptive = useQuality((state) => state.adaptive)
    const setQuality = useQuality((state) => state.setQuality)

    const { camera } = useThree();

    useEffect(() => {
        const updateCameraFov = () => {
            camera.fov = getCameraFov()
            camera.updateProjectionMatrix()
        }

        updateCameraFov()

        window.addEventListener('resize', updateCameraFov)

        return () => {
            window.removeEventListener('resize', updateCameraFov)
        }
    }, [camera])

    return <>
        <color args={ [ '#bdedfc' ] } attach="background" />

        { adaptive && <PerformanceMonitor
            onIncline={ () => setQuality('high') }
            onDecline={ () => setQuality('low') }
            flipflops={ 3 }
            onFallback={ () => setQuality('low') }
        /> }

        <Effects />

        { debug && !isMobileDevice() && <Suspense fallback={ null }><Perf position="top-left" /></Suspense> }

        <Physics debug={ debug }>
            <Lights />
            <Level
                count={ blocksCount }
                seed={ blocksSeed }
                level={ level }
                key={ level }
            />
            <Player />
        </Physics>
    </>
}
