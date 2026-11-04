import { create } from 'zustand'

const mutedKey = 'marble-run-muted'

const loadMuted = () => {
    try {
        return localStorage.getItem(mutedKey) === 'true'
    } catch {
        return false
    }
}

export default create((set) => {
    return {
        muted: loadMuted(),

        toggleMuted: () => set((state) => {
            try {
                localStorage.setItem(mutedKey, String(!state.muted))
            } catch {
                // Preference then only lasts for the session
            }

            return { muted: !state.muted }
        }),
    }
})
