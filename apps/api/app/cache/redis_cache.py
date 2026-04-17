from app.core.redis import redis_client

class RedisCache:

    async def get(self, key: str):
        return await redis_client.get(key)

    async def set(self, key: str, value: bytes, ttl: int = 3600):
        await redis_client.set(key, value, ex=ttl)