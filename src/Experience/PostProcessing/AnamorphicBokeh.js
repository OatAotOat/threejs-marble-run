import { Effect, EffectAttribute, BlendFunction } from 'postprocessing'
import { wrapEffect } from '@react-three/postprocessing'
import { Uniform } from 'three'

const fragmentShader = /* glsl */ `
    uniform float focusEnd;
    uniform float focusRange;
    uniform float maxBlur;
    uniform float bokehBoost;
    uniform float squeeze;

    #define SAMPLES 32
    #define GOLDEN_ANGLE 2.39996323

    float getBlur(const in float depth) {
        return smoothstep(focusEnd, focusEnd + focusRange, - getViewZ(depth));
    }

    void mainImage(const in vec4 inputColor, const in vec2 uv, const in float depth, out vec4 outputColor) {
        float blur = getBlur(depth);

        if (blur < 0.01) {
            outputColor = inputColor;
            return;
        }

        vec2 radius = blur * maxBlur * (resolution.y / 1080.0) * texelSize * vec2(squeeze, 1.0);

        vec3 color = inputColor.rgb * blur;
        float total = blur;

        for (int i = 0; i < SAMPLES; i++) {
            float distance = sqrt((float(i) + 0.5) / float(SAMPLES));
            float angle = float(i) * GOLDEN_ANGLE;
            vec2 sampleUv = uv + vec2(cos(angle), sin(angle)) * distance * radius;

            vec3 sampleColor = texture2D(inputBuffer, sampleUv).rgb;
            float brightness = dot(sampleColor, vec3(0.2126, 0.7152, 0.0722));
            float weight = getBlur(readDepth(sampleUv)) * (1.0 + bokehBoost * max(brightness - 1.0, 0.0));

            color += sampleColor * weight;
            total += weight;
        }

        outputColor = vec4(color / total, inputColor.a);
    }
`

export class AnamorphicBokehEffect extends Effect {
    constructor({
        blendFunction = BlendFunction.SRC,
        focusEnd = 3,
        focusRange = 9,
        maxBlur = 9,
        bokehBoost = 9,
        squeeze = 0.5,
    } = {}) {
        super('AnamorphicBokehEffect', fragmentShader, {
            blendFunction,
            attributes: EffectAttribute.DEPTH | EffectAttribute.CONVOLUTION,
            uniforms: new Map([
                [ 'focusEnd', new Uniform(focusEnd) ],
                [ 'focusRange', new Uniform(focusRange) ],
                [ 'maxBlur', new Uniform(maxBlur) ],
                [ 'bokehBoost', new Uniform(bokehBoost) ],
                [ 'squeeze', new Uniform(squeeze) ],
            ]),
        })
    }
}

export const AnamorphicBokeh = wrapEffect(AnamorphicBokehEffect, { blendFunction: BlendFunction.SRC })
