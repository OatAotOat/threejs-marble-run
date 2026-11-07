import { Effect, BlendFunction } from 'postprocessing'
import { wrapEffect } from '@react-three/postprocessing'
import { Uniform, Color } from 'three'

const fragmentShader = /* glsl */ `
    uniform float highlightKnee;
    uniform float highlightRange;
    uniform vec3 highlightTint;
    uniform float shadingStart;
    uniform float shadingStrength;
    uniform float shadingDesaturation;

    const vec3 luma = vec3(0.2126, 0.7152, 0.0722);

    void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
        vec3 color = inputColor.rgb;
        float brightness = dot(color, luma);

        if (brightness > highlightKnee) {
            float excess = brightness - highlightKnee;
            float compressed = highlightKnee + excess / (1.0 + excess / highlightRange);

            color *= compressed / brightness;
            color = mix(color, highlightTint * compressed, smoothstep(0.0, highlightRange, excess) * 0.6);
        }

        vec2 offset = (uv - 0.5) * vec2(aspect, 1.0);
        float cornerDistance = dot(offset, offset) / (0.25 * (aspect * aspect + 1.0));
        float shading = smoothstep(shadingStart, 1.0, cornerDistance);

        color = mix(color, vec3(dot(color, luma)), shading * shadingDesaturation);
        color *= 1.0 - shading * shadingStrength;

        outputColor = vec4(color, inputColor.a);
    }
`

export class LensRolloffEffect extends Effect {
    constructor({
        blendFunction = BlendFunction.SRC,
        highlightKnee = 1,
        highlightRange = 3,
        highlightTint = '#fff1dc',
        shadingStart = 0.25,
        shadingStrength = 0.5,
        shadingDesaturation = 0.5,
    } = {}) {
        super('LensRolloffEffect', fragmentShader, {
            blendFunction,
            uniforms: new Map([
                [ 'highlightKnee', new Uniform(highlightKnee) ],
                [ 'highlightRange', new Uniform(highlightRange) ],
                [ 'highlightTint', new Uniform(new Color(highlightTint)) ],
                [ 'shadingStart', new Uniform(shadingStart) ],
                [ 'shadingStrength', new Uniform(shadingStrength) ],
                [ 'shadingDesaturation', new Uniform(shadingDesaturation) ],
            ]),
        })
    }
}

export const LensRolloff = wrapEffect(LensRolloffEffect, { blendFunction: BlendFunction.SRC })
