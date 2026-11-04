const storageKey = 'marble-run-best-times'

export const loadBestTimes = () => {
    try {
        return JSON.parse(localStorage.getItem(storageKey)) ?? {}
    } catch {
        return {}
    }
}

export const saveBestTimes = (bestTimes) => {
    try {
        localStorage.setItem(storageKey, JSON.stringify(bestTimes))
    } catch {
        // Storage can be unavailable (private mode), best times then only last for the session
    }
}
