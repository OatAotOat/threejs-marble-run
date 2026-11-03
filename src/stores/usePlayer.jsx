import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

export default create(subscribeWithSelector((set) =>
{
    return {
        joystickX: 0,
        joystickY: 0,
        playerJump: false,
        tiltEnabled: false,

        setJoystick: (x, y) => set(() => ({ joystickX: x, joystickY: y })),
        setPlayerJump: (value) => set(() => ({ playerJump: value }) ),
        setTiltEnabled: (value) => set(() => ({ tiltEnabled: value })),
    }
}));
