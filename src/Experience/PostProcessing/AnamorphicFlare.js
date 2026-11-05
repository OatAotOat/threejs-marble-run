import { Effect, BlendFunction, ShaderPass } from 'postprocessing'
import { wrapEffect } from '@react-three/postprocessing'
import { Uniform, Color, Vector2, WebGLRenderTarget, HalfFloatType, ShaderMaterial } from 'three'

const blurOffsets = [ 1, 2, 4, 8, 16, 32 ]

const vertexShader = /* glsl */ `
    varying vec2 vUv;

    void main() {
        vUv = position.xy * 0.5 + 0.5;
        gl_Position = vec4(position.xy, 1.0, 1.0);
    }
`

const brightFragmentShader = /* glsl */ `
    uniform sampler2D inputBuffer;
    uniform vec2 texelSize;
    uniform float threshold;
    varying vec2 vUv;

    float brightness(const in vec2 offset) {
        vec3 color = texture2D(inputBuffer, vUv + offset * texelSize).rgb;
        return max(dot(color, vec3(0.2126, 0.7152, 0.0722)) - threshold, 0.0);
    }

    void main() {
        float value = (brightness(vec2(- 1.0, - 1.0)) + brightness(vec2(1.0, - 1.0)) + brightness(vec2(- 1.0, 1.0)) + brightness(vec2(1.0, 1.0))) * 0.25;
        gl_FragColor = vec4(vec3(value), 1.0);
    }
`

const blurFragmentShader = /* glsl */ `
    uniform sampler2D inputBuffer;
    uniform vec2 texelSize;
    uniform float offset;
    varying vec2 vUv;

    void main() {
        vec2 step = vec2(offset * texelSize.x, 0.0);

        vec3 color = texture2D(inputBuffer, vUv).rgb * 0.4
            + (texture2D(inputBuffer, vUv - step).rgb + texture2D(inputBuffer, vUv + step).rgb) * 0.2
            + (texture2D(inputBuffer, vUv - step * 2.0).rgb + texture2D(inputBuffer, vUv + step * 2.0).rgb) * 0.1;

        gl_FragColor = vec4(color, 1.0);
    }
`

const fragmentShader = /* glsl */ `
    uniform sampler2D flareBuffer;
    uniform vec3 tint;
    uniform float intensity;

    void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
        vec3 flare = texture2D(flareBuffer, uv).rgb * tint * intensity;

        outputColor = vec4(inputColor.rgb + flare, inputColor.a);
    }
`

export class AnamorphicFlareEffect extends Effect {
    constructor({
        blendFunction = BlendFunction.SRC,
        threshold = 3,
        intensity = 9,
        color = '#3d8bff',
    } = {}) {
        super('AnamorphicFlareEffect', fragmentShader, {
            blendFunction,
            uniforms: new Map([
                [ 'flareBuffer', new Uniform(null) ],
                [ 'tint', new Uniform(new Color(color)) ],
                [ 'intensity', new Uniform(intensity) ],
            ]),
        })

        const targetOptions = { type: HalfFloatType, depthBuffer: false }
        this.readTarget = new WebGLRenderTarget(1, 1, targetOptions)
        this.writeTarget = new WebGLRenderTarget(1, 1, targetOptions)

        this.brightMaterial = new ShaderMaterial({
            vertexShader,
            fragmentShader: brightFragmentShader,
            uniforms: {
                inputBuffer: new Uniform(null),
                texelSize: new Uniform(new Vector2()),
                threshold: new Uniform(threshold),
            },
            depthTest: false,
            depthWrite: false,
        })

        this.blurMaterial = new ShaderMaterial({
            vertexShader,
            fragmentShader: blurFragmentShader,
            uniforms: {
                inputBuffer: new Uniform(null),
                texelSize: new Uniform(new Vector2()),
                offset: new Uniform(1),
            },
            depthTest: false,
            depthWrite: false,
        })

        this.brightPass = new ShaderPass(this.brightMaterial)
        this.blurPass = new ShaderPass(this.blurMaterial)
    }

    update(renderer, inputBuffer) {
        this.brightPass.render(renderer, inputBuffer, this.readTarget)

        for (const offset of blurOffsets) {
            this.blurMaterial.uniforms.offset.value = offset
            this.blurPass.render(renderer, this.readTarget, this.writeTarget)

            const swap = this.readTarget
            this.readTarget = this.writeTarget
            this.writeTarget = swap
        }

        this.uniforms.get('flareBuffer').value = this.readTarget.texture
    }

    setSize(width, height) {
        const flareWidth = Math.max(1, Math.round(width / 4))
        const flareHeight = Math.max(1, Math.round(height / 2))

        this.readTarget.setSize(flareWidth, flareHeight)
        this.writeTarget.setSize(flareWidth, flareHeight)

        this.brightMaterial.uniforms.texelSize.value.set(1 / width, 1 / height)
        this.blurMaterial.uniforms.texelSize.value.set(1 / flareWidth, 1 / flareHeight)
    }

    dispose() {
        super.dispose()
        this.readTarget.dispose()
        this.writeTarget.dispose()
        this.brightMaterial.dispose()
        this.blurMaterial.dispose()
        this.brightPass.dispose()
        this.blurPass.dispose()
    }
}

export const AnamorphicFlare = wrapEffect(AnamorphicFlareEffect, { blendFunction: BlendFunction.SRC })
