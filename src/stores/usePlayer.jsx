import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

export default create(subscribeWithSelector((set) =>
{
    return {
        playerForward: false,
        playerBackward: false,
        playerLeftward: false,
        playerRightward: false,
        playerJump: false,

        setPlayerForward: (value) => set(() => ({ playerForward: value })),
        setPlayerBackward: (value) => set(() => ({ playerBackward: value })),
        setPlayerLeftward: (value) => set(() => ({ playerLeftward: value })),
        setPlayerRightward: (value) => set(() => ({ playerRightward: value })),
        setPlayerJump: (value) => set(() => ({ playerJump: value }) ),
    }
}));