import { useKeyboardControls } from '@react-three/drei'
import { useState } from 'react'
import usePlayer from '../stores/usePlayer.jsx'

const directions = {
    forward: [ 0, - 1 ],
    backward: [ 0, 1 ],
    leftward: [ - 1, 0 ],
    rightward: [ 1, 0 ],
}

function Key({ active, large = false, onPress, onRelease }) {
    return <div
        className={ `key ${ large ? 'large' : '' } ${ active ? 'active' : '' }` }
        onMouseDown={ onPress }
        onMouseUp={ onRelease }
        onMouseLeave={ onRelease }
    />
}

export default function DesktopControls() {
    const forward = useKeyboardControls((state) => state.forward)
    const backward = useKeyboardControls((state) => state.backward)
    const leftward = useKeyboardControls((state) => state.leftward)
    const rightward = useKeyboardControls((state) => state.rightward)
    const jump = useKeyboardControls((state) => state.jump)

    const setJoystick = usePlayer((state) => state.setJoystick)
    const setPlayerJump = usePlayer((state) => state.setPlayerJump)
    const playerJump = usePlayer((state) => state.playerJump)

    const [ heldDirection, setHeldDirection ] = useState(null)

    const pressDirection = (direction) => {
        setHeldDirection(direction)
        setJoystick(...directions[direction])
    }

    const releaseDirection = (direction) => {
        if (heldDirection !== direction) { return }

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
