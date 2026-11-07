import { useState, useEffect, useCallback } from 'react'
import useGame, { phases, fallCauses } from '../../../../stores/useGame.jsx'
import useSound from '../../../../stores/useSound.jsx'
import sources from '../../../sources.js'

const playSound = (sound, volume = 1) => {
    if (useSound.getState().muted) { return }

    sound.currentTime = 0
    sound.volume = volume
    sound.play().catch(() => {})
}

export default function usePlayerSounds() {
    const [ sounds ] = useState(() => ({
        jump: new Audio(sources.sounds.jump),
        collision: new Audio(sources.sounds.collision),
        fall: new Audio(sources.sounds.fall),
        zap: new Audio(sources.sounds.zap),
        finish: new Audio(sources.sounds.finish),
    }))

    useEffect(() => {
        return useGame.subscribe(
            (state) => state.phase,
            (phase) => {
                if (phase === phases.falling) { playSound(useGame.getState().fallCause === fallCauses.lasered ? sounds.zap : sounds.fall) }

                if (phase === phases.ended) { playSound(sounds.finish) }
            }
        )
    }, [ sounds ])

    return useCallback((name, volume) => playSound(sounds[name], volume), [ sounds ])
}
