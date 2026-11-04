export const keyboardMap = [
    { name: 'forward', keys: [ 'ArrowUp', 'KeyW' ] },
    { name: 'backward', keys: [ 'ArrowDown', 'KeyS' ] },
    { name: 'leftward', keys: [ 'ArrowLeft', 'KeyA' ] },
    { name: 'rightward', keys: [ 'ArrowRight', 'KeyD' ] },
    { name: 'jump', keys: [ 'Space' ] },
    { name: 'restart', keys: [ 'KeyR' ] },
    { name: 'pause', keys: [ 'Escape', 'KeyP' ] },
    { name: 'mute', keys: [ 'KeyM' ] },
]

export const isMovementPressed = (keys) => keys.forward || keys.backward || keys.leftward || keys.rightward || keys.jump
