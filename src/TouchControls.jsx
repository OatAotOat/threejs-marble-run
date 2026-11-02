import { useRef, useState } from 'react'
import usePlayer from './stores/usePlayer.jsx'

const stickRadius = 45
const deadZone = 0.1

export default function TouchControls()
{
    const setJoystick = usePlayer((state) => state.setJoystick)
    const setPlayerJump = usePlayer((state) => state.setPlayerJump)
    const playerJump = usePlayer((state) => state.playerJump)

    const [ origin, setOrigin ] = useState(null)
    const knob = useRef()
    const activePointer = useRef(null)

    const handleStickDown = (event) =>
    {
        if(activePointer.current !== null)
            return

        activePointer.current = event.pointerId
        event.currentTarget.setPointerCapture(event.pointerId)
        setOrigin({ x: event.clientX, y: event.clientY })
    }

    const handleStickMove = (event) =>
    {
        if(event.pointerId !== activePointer.current || !origin)
            return

        let x = event.clientX - origin.x
        let y = event.clientY - origin.y

        const distance = Math.hypot(x, y)

        if(distance > stickRadius)
        {
            x *= stickRadius / distance
            y *= stickRadius / distance
        }

        knob.current.style.transform = `translate(${ x }px, ${ y }px)`

        if(distance / stickRadius < deadZone)
            setJoystick(0, 0)
        else
            setJoystick(x / stickRadius, y / stickRadius)
    }

    const handleStickEnd = (event) =>
    {
        if(event.pointerId !== activePointer.current)
            return

        activePointer.current = null
        knob.current.style.transform = ''
        setOrigin(null)
        setJoystick(0, 0)
    }

    const handleJumpDown = (event) =>
    {
        event.currentTarget.setPointerCapture(event.pointerId)
        setPlayerJump(true)
    }

    const handleJumpEnd = () =>
    {
        setPlayerJump(false)
    }

    return <>
        <div
            className="joystick-zone"
            onPointerDown={ handleStickDown }
            onPointerMove={ handleStickMove }
            onPointerUp={ handleStickEnd }
            onPointerCancel={ handleStickEnd }
        >
            <div
                className={ `joystick ${ origin ? '' : 'idle' }` }
                style={ origin ? { left: origin.x, top: origin.y } : undefined }
            >
                <div ref={ knob } className="joystick-knob" />
            </div>
        </div>

        <div
            className={ `jump-button ${ playerJump ? 'active' : '' }` }
            onPointerDown={ handleJumpDown }
            onPointerUp={ handleJumpEnd }
            onPointerCancel={ handleJumpEnd }
        />
    </>
}
