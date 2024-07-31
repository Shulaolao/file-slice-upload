import { createChunkFile } from './chunk.js'

self.onmessage = async (e) => {
    const {
        file,
        start,
        end,
        chunkSize
    } = e.data
    const result = []
    for(let i = start; i < end; i++) {
        const prom = createChunkFile(file, i, chunkSize)
        result.push(prom)
    }
    const chunks = await Promise.all(result)
    self.postMessage(chunks)
}
