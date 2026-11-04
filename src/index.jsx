import './style.css'
import ReactDOM from 'react-dom/client'
import { Canvas } from '@react-three/fiber'
import { lazy, Suspense } from 'react'
import { KeyboardControls } from '@react-three/drei'
import Interface from './Interface/Interface.jsx'
import { getCameraFov } from './Utils/device.js'

const Experience = lazy(() => import('./Experience/Experience.jsx'))

const initialFov = getCameraFov()

const preventDrag = (e) => { e.preventDefault() }

const preventScroll = (e) => { e.preventDefault() }

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
            dpr={ [ 1, 1.5 ] }
            camera={ {
                fov: initialFov,
                near: 0.1,
                far: 200,
                position: [ 2.5, 4, 6 ]
            } }
        >
            <Suspense fallback={ null }>
                <Experience />
            </Suspense>
        </Canvas>
        <Interface />
    </KeyboardControls>
)
