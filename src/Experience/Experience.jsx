import { useThree } from '@react-three/fiber'
import { useEffect, lazy, Suspense } from 'react'
import { PerformanceMonitor } from '@react-three/drei'
import useGame from '../stores/useGame.jsx'
import useQuality from '../stores/useQuality.jsx'
import { getCameraFov, isMobileDevice } from '../Utils/device.js'
import Effects from './Effects.jsx'
import World from './World/World.jsx'

const debug = window.location.hash === '#debug'

const Perf = lazy(() => import('r3f-perf').then((module) => ({ default: module.Perf })))

export default function Experience()
{
    const setLoaded = useGame((state) => state.setLoaded)
    const adaptive = useQuality((state) => state.adaptive)
    const setQuality = useQuality((state) => state.setQuality)

    const { camera } = useThree();

    useEffect(() => { setLoaded() }, [])

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
        { adaptive && <PerformanceMonitor
            onIncline={ () => setQuality('high') }
            onDecline={ () => setQuality('low') }
            flipflops={ 3 }
            onFallback={ () => setQuality('low') }
        /> }

        <Effects />

        { debug && !isMobileDevice() && <Suspense fallback={ null }><Perf position="top-left" /></Suspense> }

        <World debug={ debug } />
    </>
}
