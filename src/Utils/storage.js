export const storageKeys = {
    bestTimes: 'marble-run-best-times',
    muted: 'marble-run-muted',
    quality: 'marble-run-quality',
}

export const readStorage = (key) => {
    try {
        return localStorage.getItem(key)
    } catch {
        return null
    }
}

export const writeStorage = (key, value) => {
    try {
        localStorage.setItem(key, value)
    } catch {
        // Storage can be unavailable (private mode), the value then only lasts for the session
    }
}

export const readJson = (key, fallback) => {
    try {
        return JSON.parse(readStorage(key)) ?? fallback
    } catch {
        return fallback
    }
}

export const writeJson = (key, value) => writeStorage(key, JSON.stringify(value))
