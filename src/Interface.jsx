import { useKeyboardControls } from '@react-three/drei'
import useGame from './stores/useGame.jsx'
import usePlayer from './stores/usePlayer.jsx'
import { useEffect, useRef } from 'react'
import { addEffect } from '@react-three/fiber'

export default function Interface()
{
    const time = useRef()

    const restart = useGame((state) => state.restart)
    const phase = useGame((state) => state.phase)

    const forward = useKeyboardControls((state) => state.forward)
    const backward = useKeyboardControls((state) => state.backward)
    const leftward = useKeyboardControls((state) => state.leftward)
    const rightward = useKeyboardControls((state) => state.rightward)
    const jump = useKeyboardControls((state) => state.jump)

    const setPlayerForward = usePlayer((state) => state.setPlayerForward)
    const setPlayerBackward = usePlayer((state) => state.setPlayerBackward)
    const setPlayerLeftward = usePlayer((state) => state.setPlayerLeftward)
    const setPlayerRightward = usePlayer((state) => state.setPlayerRightward)
    const setPlayerJump = usePlayer((state) => state.setPlayerJump)

    const playerForward = usePlayer((state) => state.playerForward)
    const playerBackward = usePlayer((state) => state.playerBackward)
    const playerLeftward = usePlayer((state) => state.playerLeftward)
    const playerRightward = usePlayer((state) => state.playerRightward)
    const playerJump = usePlayer((state) => state.playerJump)

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

    const handleButtonPress = (direction) => {
        switch (direction) {
            case 'forward':
                setPlayerForward(true)
                break
            case 'backward':
                setPlayerBackward(true)
                break
            case 'leftward':
                setPlayerLeftward(true)
                break
            case 'rightward':
                setPlayerRightward(true)
                break
            case 'jump':
                setPlayerJump(true)
                break
        }
    }

    const handleButtonRelease = (direction) => {
        switch (direction) {
            case 'forward':
                setPlayerForward(false)
                break
            case 'backward':
                setPlayerBackward(false)
                break
            case 'leftward':
                setPlayerLeftward(false)
                break
            case 'rightward':
                setPlayerRightward(false)
                break
            case 'jump':
                setPlayerJump(false)
                break
        }
    }

    return (
        <div className="interface">

            {/* Time */}
            <div ref={ time } className="time">00 : 00 : 000</div>

            {/* Restart */}
            { phase === 'ended' && <div className="restart" onClick={ restart }>Next Level</div> }

            {/* Controls */}
            <div className="controls">
                <div className="raw">
                    <div 
                        className={ `key ${ forward || playerForward ? 'active' : '' }` }
                        onMouseDown={() => handleButtonPress('forward')}
                        onMouseUp={() => handleButtonRelease('forward')}
                        onMouseLeave={() => handleButtonRelease('forward')}
                        onTouchStart={(e) => { e.preventDefault(); handleButtonPress('forward'); }}
                        onTouchEnd={(e) => { e.preventDefault(); handleButtonRelease('forward'); }}
                    />
                </div>
                <div className="raw">
                    <div 
                        className={ `key ${ leftward || playerLeftward ? 'active' : '' }` }
                        onMouseDown={() => handleButtonPress('leftward')}
                        onMouseUp={() => handleButtonRelease('leftward')}
                        onMouseLeave={() => handleButtonRelease('leftward')}
                        onTouchStart={(e) => { e.preventDefault(); handleButtonPress('leftward'); }}
                        onTouchEnd={(e) => { e.preventDefault(); handleButtonRelease('leftward'); }}
                    />
                    <div 
                        className={ `key ${ backward || playerBackward ? 'active' : '' }` }
                        onMouseDown={() => handleButtonPress('backward')}
                        onMouseUp={() => handleButtonRelease('backward')}
                        onMouseLeave={() => handleButtonRelease('backward')}
                        onTouchStart={(e) => { e.preventDefault(); handleButtonPress('backward'); }}
                        onTouchEnd={(e) => { e.preventDefault(); handleButtonRelease('backward'); }}
                    />
                    <div 
                        className={ `key ${ rightward || playerRightward ? 'active' : '' }` }
                        onMouseDown={() => handleButtonPress('rightward')}
                        onMouseUp={() => handleButtonRelease('rightward')}
                        onMouseLeave={() => handleButtonRelease('rightward')}
                        onTouchStart={(e) => { e.preventDefault(); handleButtonPress('rightward'); }}
                        onTouchEnd={(e) => { e.preventDefault(); handleButtonRelease('rightward'); }}
                    />
                </div>
                <div className="raw">
                    <div 
                        className={ `key large ${ jump || playerJump ? 'active' : '' }` }
                        onMouseDown={() => handleButtonPress('jump')}
                        onMouseUp={() => handleButtonRelease('jump')}
                        onMouseLeave={() => handleButtonRelease('jump')}
                        onTouchStart={(e) => { e.preventDefault(); handleButtonPress('jump'); }}
                        onTouchEnd={(e) => { e.preventDefault(); handleButtonRelease('jump'); }}
                    />
                </div>
            </div>
            
        </div>
    );
}