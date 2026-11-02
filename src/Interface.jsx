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

const pad = (value, length) => String(value).padStart(length, '0')

const formatTime = (milliseconds) =>
{
    const minutes = Math.floor(milliseconds / 60000)
    const seconds = Math.floor(milliseconds / 1000) % 60

    return `${ pad(minutes, 2) } : ${ pad(seconds, 2) } : ${ pad(Math.floor(milliseconds % 1000), 3) }`
}

export default function Interface()
{
    const time = useRef()

    const restart = useGame((state) => state.restart)
    const resume = useGame((state) => state.resume)
    const togglePause = useGame((state) => state.togglePause)
    const phase = useGame((state) => state.phase)
    const loaded = useGame((state) => state.loaded)
    const bestTime = useGame((state) => state.bestTimes[state.level])
    const newRecord = useGame((state) => state.newRecord)
    const hasStarted = useGame((state) => state.hasStarted)

    useEffect(() =>
    {
        const unsubscribeEffect = addEffect(() =>
        {
            const state = useGame.getState()

            let elapsedTime = 0

            if(state.phase === 'playing')
                elapsedTime = Date.now() - state.startTime
            else if(state.phase === 'paused')
                elapsedTime = state.pausedAt - state.startTime
            else if(state.phase === 'ended' || state.phase === 'falling')
                elapsedTime = state.endTime - state.startTime

            if(time.current)
                time.current.textContent = formatTime(elapsedTime)
        })

        return () =>
        {
            unsubscribeEffect()
        }
    }, [])

    useEffect(() =>
    {
        const handleKeyDown = (event) =>
        {
            if(event.repeat)
                return

            const { phase, restart, togglePause } = useGame.getState()

            if(event.code === 'KeyR' && phase !== 'ended')
                restart()

            if(event.code === 'Escape' || event.code === 'KeyP')
                togglePause()
        }

        const handleVisibilityChange = () =>
        {
            if(document.hidden)
                useGame.getState().pause()
        }

        window.addEventListener('keydown', handleKeyDown)
        document.addEventListener('visibilitychange', handleVisibilityChange)

        return () =>
        {
            window.removeEventListener('keydown', handleKeyDown)
            document.removeEventListener('visibilitychange', handleVisibilityChange)
        }
    }, [])

    return (
        <div className="interface">

            {/* Controls */}
            { isTouch ? <TouchControls /> : <DesktopControls /> }

            {/* Time */}
            <div className="time">
                <span ref={ time }>00 : 00 : 000</span>
                { bestTime !== undefined && <div className="best">Best { formatTime(bestTime) }</div> }
            </div>

            {/* Start */}
            <div className={ `start-overlay ${ loaded && phase === 'ready' && !hasStarted ? 'visible' : '' }` }>
                <div className="title">{ isTouch ? 'Move To Start' : 'Press Any Key To Start' }</div>
            </div>

            {/* Fall */}
            <div className={ `fall ${ phase === 'falling' ? 'visible' : '' }` }>Fell!</div>

            {/* Restart */}
            { phase === 'ended' && newRecord && <div className="new-record">New Record!</div> }
            { phase === 'ended' && <div className="restart" onClick={ restart }>Next Level</div> }

            {/* Pause */}
            { phase === 'playing' && <button className="pause-button" onClick={ togglePause }>II</button> }

            { phase === 'paused' && <div className="pause-menu">
                <div className="title">Paused</div>
                <button className="menu-button" onClick={ resume }>Resume</button>
                <button className="menu-button" onClick={ restart }>Restart</button>
            </div> }

            {/* Loading */}
            <div className={ `loader ${ loaded ? 'hidden' : '' }` }>
                <div>Loading</div>
                <div className="loader-bar" />
            </div>

        </div>
    );
}
