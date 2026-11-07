import { BlockSpinner, BlockSpinner2, BlockSpinner3 } from './Spinners.jsx'
import { BlockLimbo, BlockAxe, BlockStrip } from './Movers.jsx'
import { BlockPlatform, BlockPlatform2, BlockPlatform3 } from './Platforms.jsx'
import { BlockStairs1, BlockStairs2 } from './Stairs.jsx'
import {
    BlockLaserLimbo,
    BlockLaserSweeper,
    BlockHurdles,
    BlockPulseGates,
    BlockLaserWindmill,
    BlockLaserAxe,
    BlockLaserStairs,
    BlockScanner,
    BlockTripwire,
} from './Lasers.jsx'

export { BlockStart, BlockEnd } from './StartEnd.jsx'

export const obstacleTypes = [
    BlockSpinner,
    BlockSpinner2,
    BlockSpinner3,
    BlockAxe,
    BlockLimbo,
    BlockStrip,
    BlockPlatform,
    BlockPlatform2,
    BlockPlatform3,
    BlockStairs1,
    BlockStairs2
]

export const laserTypes = [
    BlockLaserLimbo,
    BlockLaserSweeper,
    BlockHurdles,
    BlockPulseGates,
    BlockLaserWindmill,
    BlockLaserAxe,
    BlockLaserStairs,
    BlockScanner,
    BlockTripwire,
]

export const laserStartLevel = 11

const mixedTypes = [ ...obstacleTypes, ...laserTypes ]

export const getBlockTypes = (level) => level >= laserStartLevel ? mixedTypes : obstacleTypes
