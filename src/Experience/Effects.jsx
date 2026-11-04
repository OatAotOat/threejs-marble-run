import { Vignette, Bloom, EffectComposer, ToneMapping, ChromaticAberration } from '@react-three/postprocessing'
import { BlendFunction, ToneMappingMode } from 'postprocessing'
import useQuality from '../stores/useQuality.jsx'

export default function Effects()
{
    const highQuality = useQuality((state) => state.quality === 'high')

    return <EffectComposer multisampling={ 0 }>
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
        { highQuality && <ChromaticAberration /> }
        <ToneMapping
            mode={ ToneMappingMode.ACES_FILMIC }
        />
    </EffectComposer>
}
