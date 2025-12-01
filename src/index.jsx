import './style.css'
import ReactDOM from 'react-dom/client'
import { Canvas } from '@react-three/fiber'
import Experience from './Experience.jsx'
import { KeyboardControls } from '@react-three/drei'
import Interface from './Interface.jsx'

const isMobileDevice = () => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0)
    const isSmallScreen = window.innerWidth <= 768
    
    return isMobile || isTouchDevice || isSmallScreen;
}

const isMediumScreen = () => {
    return window.innerWidth > 768 && window.innerWidth <= 1024;
}

const initialFov = isMobileDevice() ? 100 : isMediumScreen() ? 75 : 45;

const preventDrag = (e) => {
    e.preventDefault()
}

const preventScroll = (e) => {
    e.preventDefault()
}

document.addEventListener('touchmove', preventScroll, { passive: false })
document.addEventListener('gesturestart', preventDrag, { passive: false })
document.addEventListener('gesturechange', preventDrag, { passive: false })
document.addEventListener('gestureend', preventDrag, { passive: false })
document.addEventListener('contextmenu', preventDrag)

const root = ReactDOM.createRoot(document.querySelector('#root'))

root.render(
    <KeyboardControls
        map={ [
            { name: 'forward', keys: [ 'ArrowUp', 'KeyW' ] },
            { name: 'backward', keys: [ 'ArrowDown', 'KeyS' ] },
            { name: 'leftward', keys: [ 'ArrowLeft', 'KeyA' ] },
            { name: 'rightward', keys: [ 'ArrowRight', 'KeyD' ] },
            { name: 'jump', keys: [ 'Space' ] },
        ] }
    >
        <Canvas
            shadows
            camera={ {
                fov: initialFov,
                near: 0.1,
                far: 200,
                position: [ 2.5, 4, 6 ]
            } }
        >
            <Experience />
        </Canvas>
        <Interface />
    </KeyboardControls>
)