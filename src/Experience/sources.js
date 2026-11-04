const url = (file) => `${import.meta.env.BASE_URL}${file}`

export default {
    font: url('bebas-neue-v9-latin-regular.woff'),
    trophy: url('trophy.glb'),
    sounds: {
        jump: url('action_jump.mp3'),
        collision: url('billiard.mp3'),
        fall: url('Info_swoop_out1.mp3'),
        finish: url('Web_partypopper.mp3'),
    },
}
