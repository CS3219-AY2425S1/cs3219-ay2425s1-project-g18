import bcrypt from 'bcryptjs'

const saltRounds = 10

export const hashPassword = async (password: string): Promise<string> => {
    const hashed = await bcrypt.hash(password, saltRounds)
    return hashed
}
