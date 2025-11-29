import { Physics } from '@react-three/rapier'
import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import useGame from './stores/useGame.jsx'
import Lights from './Lights.jsx'
import { Level } from './Level.jsx'
import Player from './Player.jsx'

export default function Experience()
{
    const blocksCount = useGame((state) => state.blocksCount)
    const blocksSeed = useGame(state => state.blocksSeed)
    const level = useGame(state => state.level)
    
    const { camera } = useThree()

    useEffect(() => {
        const checkIfMobile = () => {
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
            const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0)
            const isSmallScreen = window.innerWidth <= 768
            
            return isMobile || isTouchDevice || isSmallScreen;
        }

        const updateCameraFov = () => {
            const newFov = checkIfMobile() ? 90 : 45
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

        <color args={ [ '#bdedfc' ] } attach="background" />

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

    </>
}