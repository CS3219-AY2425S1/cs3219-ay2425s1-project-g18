import { createHash } from "crypto"

const createRoomId = (userId1: string, userId2: string) => {
    const time = new Date().getTime().toString()
    const roomId = userId1 < userId2 ? `${userId1}-${userId2}-${time}` : `${userId2}-${userId1}-${time}`
    const hash = createHash('sha256').update(roomId).digest('hex')
    return hash
}

export { createRoomId }