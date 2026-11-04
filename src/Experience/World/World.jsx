import { Physics } from '@react-three/rapier'
import useGame from '../../stores/useGame.jsx'
import Environment from './Environment.jsx'
import { Level } from './Level.jsx'
import Player from './Player.jsx'

export default function World({ debug = false }) {
    const blocksCount = useGame((state) => state.blocksCount)
    const blocksSeed = useGame((state) => state.blocksSeed)
    const level = useGame((state) => state.level)
    const paused = useGame((state) => state.phase === 'paused')

    return <>
        <Environment />

        <Physics debug={ debug } paused={ paused }>
            <Level
                count={ blocksCount }
                seed={ blocksSeed }
                level={ level }
                key={ level }
            />
            <Player />
        </Physics>
    </>
}
