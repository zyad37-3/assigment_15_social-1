import bcrypt from 'bcrypt';
export const hash = async (myPlaintext:string, round:number = 12, minor:'a'|'b' = `b`):Promise<string> => {
    const salt = await bcrypt.genSalt(round, minor)
    return await bcrypt.hash(myPlaintext, salt)
}
export const compare = async (myPlaintext:string, cipherText:string):Promise<boolean> => {
    return await bcrypt.compare(myPlaintext, cipherText)
}
