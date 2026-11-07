import { Effect, EffectAttribute, BlendFunction } from 'postprocessing'
import { wrapEffect } from '@react-three/postprocessing'
import { Uniform } from 'three'

const fragmentShader = /* glsl */ `
    uniform float focusEnd;
    uniform float focusRange;
    uniform float maxBlur;
    uniform float bokehBoost;
    uniform float squeeze;
    uniform float edgeStart;
    uniform float edgeBlur;

    #define SAMPLES 32
    #define GOLDEN_ANGLE 2.39996323

    float getBlur(const in float depth) {
        return smoothstep(focusEnd, focusEnd + focusRange, - getViewZ(depth));
    }

    float getEdgeSoftness(const in vec2 uv) {
        vec2 offset = (uv - 0.5) * 2.0;
        return smoothstep(edgeStart, 1.0, length(offset * vec2(1.0, 0.6)));
    }

    void mainImage(const in vec4 inputColor, const in vec2 uv, const in float depth, out vec4 outputColor) {
        float blur = getBlur(depth);
        float edge = getEdgeSoftness(uv);
        float radiusPixels = max(blur * maxBlur, edge * edgeBlur);

        if (radiusPixels < 0.25) {
            outputColor = inputColor;
            return;
        }

        vec2 radius = radiusPixels * (resolution.y / 1080.0) * texelSize * vec2(squeeze, 1.0);

        float centerWeight = max(blur, edge);
        vec3 color = inputColor.rgb * centerWeight;
        float total = centerWeight;

        for (int i = 0; i < SAMPLES; i++) {
            float distance = sqrt((float(i) + 0.5) / float(SAMPLES));
            float angle = float(i) * GOLDEN_ANGLE;
            vec2 sampleUv = uv + vec2(cos(angle), sin(angle)) * distance * radius;

            vec3 sampleColor = texture2D(inputBuffer, sampleUv).rgb;
            float brightness = dot(sampleColor, vec3(0.2126, 0.7152, 0.0722));
            float weight = max(getBlur(readDepth(sampleUv)), edge) * (1.0 + bokehBoost * max(brightness - 1.0, 0.0));

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
        edgeStart = 0.55,
        edgeBlur = 5,
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
                [ 'edgeStart', new Uniform(edgeStart) ],
                [ 'edgeBlur', new Uniform(edgeBlur) ],
            ]),
        })
    }
}

export const AnamorphicBokeh = wrapEffect(AnamorphicBokehEffect, { blendFunction: BlendFunction.SRC })
