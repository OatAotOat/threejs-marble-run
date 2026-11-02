import { useKeyboardControls } from '@react-three/drei'
import useGame from './stores/useGame.jsx'
import usePlayer from './stores/usePlayer.jsx'
import { useEffect, useRef, useState } from 'react'
import { addEffect } from '@react-three/fiber'
import TouchControls from './TouchControls.jsx'
import { isMobileDevice } from './device.js'

const isTouch = isMobileDevice()

const directions = {
    forward: [ 0, - 1 ],
    backward: [ 0, 1 ],
    leftward: [ - 1, 0 ],
    rightward: [ 1, 0 ],
}

function Key({ active, large = false, onPress, onRelease })
{
    return <div
        className={ `key ${ large ? 'large' : '' } ${ active ? 'active' : '' }` }
        onMouseDown={ onPress }
        onMouseUp={ onRelease }
        onMouseLeave={ onRelease }
    />
}

function DesktopControls()
{
    const forward = useKeyboardControls((state) => state.forward)
    const backward = useKeyboardControls((state) => state.backward)
    const leftward = useKeyboardControls((state) => state.leftward)
    const rightward = useKeyboardControls((state) => state.rightward)
    const jump = useKeyboardControls((state) => state.jump)

    const setJoystick = usePlayer((state) => state.setJoystick)
    const setPlayerJump = usePlayer((state) => state.setPlayerJump)
    const playerJump = usePlayer((state) => state.playerJump)

    const [ heldDirection, setHeldDirection ] = useState(null)

    const pressDirection = (direction) =>
    {
        setHeldDirection(direction)
        setJoystick(...directions[direction])
    }

    const releaseDirection = (direction) =>
    {
        if(heldDirection !== direction)
            return

        setHeldDirection(null)
        setJoystick(0, 0)
    }

    const directionKey = (direction, keyboardActive) => <Key
        active={ keyboardActive || heldDirection === direction }
        onPress={ () => pressDirection(direction) }
        onRelease={ () => releaseDirection(direction) }
    />

    return <div className="controls">
        <div className="raw">
            { directionKey('forward', forward) }
        </div>
        <div className="raw">
            { directionKey('leftward', leftward) }
            { directionKey('backward', backward) }
            { directionKey('rightward', rightward) }
        </div>
        <div className="raw">
            <Key
                large
                active={ jump || playerJump }
                onPress={ () => setPlayerJump(true) }
                onRelease={ () => setPlayerJump(false) }
            />
        </div>
    </div>
}

export default function Interface()
{
    const time = useRef()

    const restart = useGame((state) => state.restart)
    const phase = useGame((state) => state.phase)

    useEffect(() =>
    {
        const unsubscribeEffect = addEffect(() =>
        {
            const state = useGame.getState()

            let elapsedTime = 0

            if(state.phase === 'playing')
                elapsedTime = Date.now() - state.startTime
            else if(state.phase === 'ended')
                elapsedTime = state.endTime - state.startTime

            elapsedTime /= 1000

            let minutes = parseInt(elapsedTime / 60);
            let seconds = parseInt(elapsedTime % 60);
            let milliseconds = parseInt(((elapsedTime % 60) * 1000) % 1000);

            let minutesText = minutes < 10 ? "0" + minutes : minutes;
            let secondsText = seconds < 10 ? "0" + seconds : seconds;
            let millisecondsText = milliseconds < 100 ? (milliseconds < 10 ? "00" + milliseconds : "0" + milliseconds) : milliseconds;

            if(time.current)
                time.current.textContent = minutesText + " : " + secondsText + " : " + millisecondsText;
        })

        return () =>
        {
            unsubscribeEffect()
        }
    }, [])

    return (
        <div className="interface">

            {/* Controls */}
            { isTouch ? <TouchControls /> : <DesktopControls /> }

            {/* Time */}
            <div ref={ time } className="time">00 : 00 : 000</div>

            {/* Restart */}
            { phase === 'ended' && <div className="restart" onClick={ restart }>Next Level</div> }

        </div>
    );
}
