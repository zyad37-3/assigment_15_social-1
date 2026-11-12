import { createClient, RedisClientType } from "redis";
import { REDIS_URI } from "../../config";



export class CashService {
    private readonly client: RedisClientType
    constructor() {
        this.client = createClient({ url: REDIS_URI })
        this.connect()
    }
    async connect() {
        try {
            await this.client.connect()
            console.log("Redis connection stablish successfully ");

        } catch (error) {
            console.log("Fail to  stablish Redis connection ");

        }
    }

    async set({ key, value, ttl = undefined }: { key: string, value: any, ttl?: number | undefined }) {
        if (typeof value == "object") {
            value = JSON.stringify(value)
        }
        return await this.client.set(key, value, { ...(ttl ? { EX: ttl } : {}) })
    }
    async get({ key }: { key: string }) {
        let value = await this.client.get(key)
        try {
            return JSON.parse(value as string)
        } catch (error) {
            return value
        }
    }
    async exist({ key }: { key: string }) {
        return await this.client.exists(key)

    }

    async update({ key, value, ttl = undefined }: { key: string, value: any, ttl?: number }) {
        if (!await this.exist({ key })) {
            return 0
        }
        return await this.set({ key, value, ttl })
    }

    async del({ key }: { key: string | string[] }) {
        return await this.client.del(key)

    }
    //async del ({ key = [] } = {}){
    //     if (!key.length) return 0

    //     return await this.client.del(...key)
    // }
    async keys({ key }: { key: string }) {
        return await this.client.keys(`${key}*`)

    }
    async ttl({ key }: { key: string }) {
        return await this.client.ttl(key)

    }
    async expire({ key, ttl }: { key: string, ttl: number }) {
        return await this.client.expire(key, ttl)

    }
    async incrBy({ key, value = 1 }: { key: string, value?: number }) {
        return await this.client.incrBy(key, value)

    }

}
export const cashService = new CashService()