import { Physics } from '@react-three/rapier'
import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import useGame from './stores/useGame.jsx'
import Lights from './Lights.jsx'
import { Level } from './Level.jsx'
import Player from './Player.jsx'
import { Perf } from 'r3f-perf'
import { Vignette, Bloom, EffectComposer, ToneMapping } from '@react-three/postprocessing'
import { BlendFunction, ToneMappingMode } from 'postprocessing'
import { Environment } from '@react-three/drei'

export default function Experience()
{
    const blocksCount = useGame((state) => state.blocksCount)
    const blocksSeed = useGame(state => state.blocksSeed)
    const level = useGame(state => state.level)
    
    const { camera } = useThree();

    const checkIfMobile = () => {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0)
        const isSmallScreen = window.innerWidth <= 768
        
        return isMobile || isTouchDevice || isSmallScreen;
    }

    const checkIfMediumScreen = () => {
        return window.innerWidth > 768 && window.innerWidth <= 1024;
    }

    useEffect(() => {
        const updateCameraFov = () => {
            const newFov = checkIfMobile() ? 100 : checkIfMediumScreen() ? 75 : 45;
            camera.fov = newFov
            camera.updateProjectionMatrix()
        }

        updateCameraFov()

        window.addEventListener('resize', updateCameraFov)

        return () => {
            window.removeEventListener('resize', updateCameraFov)
        }
    }, [camera])

    return <>
        <Environment 
            background
            // files="./citrus_orchard_road_puresky_4k.hdr"
        >
            <color args={ [ '#bdedfc' ] } attach="background" />

            <EffectComposer multisampling={ 0 }>
                <Vignette
                    offset={ 0.15 }
                    darkness={ 0.75 }
                    blendFunction={ BlendFunction.NORMAL }
                />
                <Bloom
                    mipmapBlur
                    intensity={ 1 }
                    luminanceThreshold={ 0.9 }
                />
                <ToneMapping 
                    mode={ ToneMappingMode.ACES_FILMIC }
                />
            </EffectComposer>

            { !checkIfMobile() && <Perf position="top-left" />}

            <Physics debug={ true }>
                <Lights />
                <Level 
                    count={ blocksCount } 
                    seed={ blocksSeed } 
                    level={ level }
                    key={ level } 
                />
                <Player />
            </Physics>
        </Environment>
    </>
}