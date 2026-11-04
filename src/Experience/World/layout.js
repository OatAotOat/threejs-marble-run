export const blockLength = 4

export const spawnPosition = [ 0, 1, 0 ]

export const marbleRadius = 0.3

export const fallHeight = - 4

export const getBlockZ = (index) => - index * blockLength

export const getFinishZ = (blocksCount) => getBlockZ(blocksCount + 1) + blockLength / 2
