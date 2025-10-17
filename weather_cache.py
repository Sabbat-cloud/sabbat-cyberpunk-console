# Small TTL cache decorator for your weather fetcher (or any expensive function).
# Usage:
#     from weather_cache import ttl_cache
#
#     @ttl_cache(seconds=120, maxsize=256)
#     def fetch_weather(city, country, units):
#         # your existing ansiweather call / external API call
#         return {...}
#
#     # Then in your /api/weather route, call fetch_weather(...)
import time
from functools import wraps

def ttl_cache(seconds=120, maxsize=256):
    def decorator(func):
        cache = {}
        order = []  # simple FIFO to cap memory usage
        @wraps(func)
        def wrapper(*args, **kwargs):
            key = (args, tuple(sorted(kwargs.items())))
            now = time.time()
            if key in cache:
                ts, value = cache[key]
                if now - ts < seconds:
                    return value
                # expired
                del cache[key]
                try:
                    order.remove(key)
                except ValueError:
                    pass
            value = func(*args, **kwargs)
            cache[key] = (now, value)
            order.append(key)
            if len(order) > maxsize:
                oldest = order.pop(0)
                cache.pop(oldest, None)
            return value
        return wrapper
    return decorator
