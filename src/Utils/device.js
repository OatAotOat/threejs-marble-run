export const isMobileDevice = () => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0)
    const isSmallScreen = window.innerWidth <= 768

    return isMobile || isTouchDevice || isSmallScreen
}

export const supportsTilt = () => {
    return isMobileDevice() && 'DeviceOrientationEvent' in window && window.isSecureContext
}

export const isMediumScreen = () => {
    return window.innerWidth > 768 && window.innerWidth <= 1024
}

export const prefersReducedMotion = () => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export const getCameraFov = () => {
    return isMobileDevice() ? 100 : isMediumScreen() ? 75 : 45
}
