import { useEffect } from 'react'
import usePlayer from '../stores/usePlayer.jsx'

const fullTiltAngle = 20
const deadZoneAngle = 2

const wrapAngle = (angle) => ((angle + 540) % 360) - 180

const toScreenTilt = (beta, gamma) => {
    const angle = screen.orientation?.angle ?? window.orientation ?? 0

    switch ((angle + 360) % 360) {
        case 90:
            return { x: beta, y: - gamma }
        case 180:
            return { x: - gamma, y: - beta }
        case 270:
            return { x: - beta, y: gamma }
        default:
            return { x: gamma, y: beta }
    }
}

export default function GyroControls() {
    const setJoystick = usePlayer((state) => state.setJoystick)

    useEffect(() => {
        let neutral = null

        const handleOrientation = (event) => {
            if (event.beta === null || event.gamma === null) { return }

            const tilt = toScreenTilt(event.beta, event.gamma)

            if (!neutral) { neutral = tilt }

            let x = wrapAngle(tilt.x - neutral.x) / fullTiltAngle
            let y = wrapAngle(tilt.y - neutral.y) / fullTiltAngle

            const length = Math.hypot(x, y)

            if (length * fullTiltAngle < deadZoneAngle) {
                setJoystick(0, 0)
                return
            }

            if (length > 1) {
                x /= length
                y /= length
            }

            setJoystick(x, y)
        }

        const handleRotation = () => { neutral = null }

        window.addEventListener('deviceorientation', handleOrientation)
        window.addEventListener('orientationchange', handleRotation)

        return () => {
            window.removeEventListener('deviceorientation', handleOrientation)
            window.removeEventListener('orientationchange', handleRotation)
            setJoystick(0, 0)
        }
    }, [ setJoystick ])

    return null
}
