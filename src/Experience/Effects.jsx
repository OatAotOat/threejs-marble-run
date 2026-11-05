import { Vignette, Bloom, EffectComposer, ToneMapping, ChromaticAberration } from '@react-three/postprocessing'
import { BlendFunction, ToneMappingMode } from 'postprocessing'
import useQuality, { isQualityAtLeast } from '../stores/useQuality.jsx'
import { isMobileDevice } from '../Utils/device.js'
import { AnamorphicBokeh } from './PostProcessing/AnamorphicBokeh.js'
import { AnamorphicFlare } from './PostProcessing/AnamorphicFlare.js'
import { CinemaLens } from './PostProcessing/CinemaLens.js'

const letterbox = !isMobileDevice()

export default function Effects() {
    const highQuality = useQuality((state) => isQualityAtLeast(state.quality, 'high'))
    const ultraQuality = useQuality((state) => isQualityAtLeast(state.quality, 'ultra'))

    return <EffectComposer multisampling={ 0 }>
        { ultraQuality && <AnamorphicBokeh /> }
        <Vignette
            eskil={ false }
            offset={ 0.15 }
            darkness={ 0.75 }
            blendFunction={ BlendFunction.NORMAL }
        />
        { highQuality && <Bloom
            mipmapBlur
            intensity={ 1 }
            luminanceThreshold={ 0.9 }
        /> }
        { ultraQuality && <AnamorphicFlare /> }
        { highQuality && <ChromaticAberration /> }
        <ToneMapping
            mode={ ToneMappingMode.ACES_FILMIC }
        />
        { ultraQuality && <CinemaLens letterbox={ letterbox } /> }
    </EffectComposer>
}
