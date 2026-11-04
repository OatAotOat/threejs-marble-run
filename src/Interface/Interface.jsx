import useGame, { phases } from '../stores/useGame.jsx'
import usePlayer from '../stores/usePlayer.jsx'
import { useEffect, useRef } from 'react'
import { addEffect } from '@react-three/fiber'
import { useKeyboardControls } from '@react-three/drei'
import DesktopControls from './DesktopControls.jsx'
import TouchControls from './TouchControls.jsx'
import { isMobileDevice, supportsTilt } from '../Utils/device.js'
import useSound from '../stores/useSound.jsx'
import useQuality from '../stores/useQuality.jsx'

const isTouch = isMobileDevice()
const canTilt = supportsTilt()

const toggleTilt = async () => {
    const { tiltEnabled, setTiltEnabled } = usePlayer.getState()

    if (tiltEnabled) {
        setTiltEnabled(false)
        return
    }

    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        try {
            if (await DeviceOrientationEvent.requestPermission() !== 'granted')
                return
        } catch {
            return
        }
    }

    setTiltEnabled(true)
}

const pad = (value, length) => String(value).padStart(length, '0')

const formatTime = (milliseconds) => {
    const minutes = Math.floor(milliseconds / 60000)
    const seconds = Math.floor(milliseconds / 1000) % 60

    return `${ pad(minutes, 2) } : ${ pad(seconds, 2) } : ${ pad(Math.floor(milliseconds % 1000), 3) }`
}

export default function Interface() {
    const time = useRef()

    const restart = useGame((state) => state.restart)
    const resume = useGame((state) => state.resume)
    const togglePause = useGame((state) => state.togglePause)
    const phase = useGame((state) => state.phase)
    const loaded = useGame((state) => state.loaded)
    const bestTime = useGame((state) => state.bestTimes[state.level])
    const newRecord = useGame((state) => state.newRecord)
    const hasStarted = useGame((state) => state.hasStarted)

    const muted = useSound((state) => state.muted)
    const toggleMuted = useSound((state) => state.toggleMuted)
    const qualityMode = useQuality((state) => state.mode)
    const cycleQualityMode = useQuality((state) => state.cycleMode)
    const tiltEnabled = usePlayer((state) => state.tiltEnabled)

    const [ subscribeKeys ] = useKeyboardControls()

    useEffect(() => {
        const unsubscribeEffect = addEffect(() => {
            const state = useGame.getState()

            let elapsedTime = 0

            if (state.phase === phases.playing) {
                elapsedTime = Date.now() - state.startTime
            } else if (state.phase === phases.paused) {
                elapsedTime = state.pausedAt - state.startTime
            } else if (state.phase === phases.ended || state.phase === phases.falling) {
                elapsedTime = state.endTime - state.startTime
            }

            if (time.current) { time.current.textContent = formatTime(elapsedTime) }
        })

        return () => { unsubscribeEffect() }
    }, [])

    useEffect(() => {
        const onPress = (action) => (pressed) => { if (pressed) { action() } }

        const unsubscribeKeys = [
            subscribeKeys((state) => state.restart, onPress(() => {
                const { phase, restart } = useGame.getState()
                if (phase !== phases.ended) { restart() }
            })),
            subscribeKeys((state) => state.pause, onPress(() => useGame.getState().togglePause())),
            subscribeKeys((state) => state.mute, onPress(() => useSound.getState().toggleMuted())),
        ]

        const handleVisibilityChange = () => {
            if (document.hidden) { useGame.getState().pause() }
        }

        document.addEventListener('visibilitychange', handleVisibilityChange)

        return () => {
            unsubscribeKeys.forEach((unsubscribe) => unsubscribe())
            document.removeEventListener('visibilitychange', handleVisibilityChange)
        }
    }, [ subscribeKeys ])

    return (
        <div className="interface">

            { /* Controls */ }
            { isTouch ? <TouchControls /> : <DesktopControls /> }

            { /* Time */ }
            <div className="time">
                <span ref={ time }>00 : 00 : 000</span>
                { bestTime !== undefined && <div className="best">Best { formatTime(bestTime) }</div> }
            </div>

            { /* Start */ }
            <div className={ `start-overlay ${ loaded && phase === phases.ready && !hasStarted ? 'visible' : '' }` }>
                <div className="title">{ isTouch ? 'Move To Start' : 'Press Any Key To Start' }</div>
            </div>

            { /* Fall */ }
            <div className={ `fall ${ phase === phases.falling ? 'visible' : '' }` }>Fell!</div>

            { /* Restart */ }
            { phase === phases.ended && newRecord && <div className="new-record">New Record!</div> }
            { phase === phases.ended && <div className="restart" onClick={ restart }>Next Level</div> }

            { /* Settings */ }
            <div className="settings">
                <button className="setting-button" onClick={ toggleMuted }>{ muted ? '🔇' : '🔊' }</button>
                <button className="setting-button text" onClick={ cycleQualityMode }>{ qualityMode }</button>
                { canTilt && <button className={ `setting-button text ${ tiltEnabled ? 'active' : '' }` } onClick={ toggleTilt }>Tilt</button> }
            </div>

            { /* Pause */ }
            { phase === phases.playing && <button className="pause-button" onClick={ togglePause }>II</button> }

            { phase === phases.paused && <div className="pause-menu">
                <div className="title">Paused</div>
                <button className="menu-button" onClick={ resume }>Resume</button>
                <button className="menu-button" onClick={ restart }>Restart</button>
            </div> }

            { /* Loading */ }
            <div className={ `loader ${ loaded ? 'hidden' : '' }` }>
                <div>Loading</div>
                <div className="loader-bar" />
            </div>

        </div>
    )
}
