import { Effect, BlendFunction } from 'postprocessing'
import { wrapEffect } from '@react-three/postprocessing'
import { Uniform } from 'three'

const cinemaAspect = 2.39

const fragmentShader = /* glsl */ `
    uniform float distortion;
    uniform float barHeight;

    void mainUv(inout vec2 uv) {
        vec2 centered = (uv - 0.5) * vec2(aspect, 1.0);
        float cornerRadius = 0.25 * (aspect * aspect + 1.0);
        float scale = (1.0 + distortion * dot(centered, centered)) / (1.0 + distortion * cornerRadius);

        uv = 0.5 + (uv - 0.5) * scale;
    }

    void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
        float bars = step(vUv.y, barHeight) + step(1.0 - barHeight, vUv.y);

        outputColor = vec4(inputColor.rgb * (1.0 - min(bars, 1.0)), inputColor.a);
    }
`

export class CinemaLensEffect extends Effect {
    constructor({ blendFunction = BlendFunction.SRC, distortion = 0.1, letterbox = true } = {}) {
        super('CinemaLensEffect', fragmentShader, {
            blendFunction,
            uniforms: new Map([
                [ 'distortion', new Uniform(distortion) ],
                [ 'barHeight', new Uniform(0) ],
            ]),
        })

        this.letterbox = letterbox
    }

    setSize(width, height) {
        const barHeight = Math.max(0, (1 - (width / height) / cinemaAspect) / 2)

        this.uniforms.get('barHeight').value = this.letterbox ? barHeight : 0
    }
}

export const CinemaLens = wrapEffect(CinemaLensEffect, { blendFunction: BlendFunction.SRC })
