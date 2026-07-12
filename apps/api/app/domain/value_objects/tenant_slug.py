import re

SLUG_REGEX = re.compile(r'^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$')

class TenantSlug:
    def __init__(self, value: str):
        if not SLUG_REGEX.match(value):
            raise ValueError(f"Slug inválido: {value}")
        self.value = value

    def __str__(self): return self.value
    def __eq__(self, other): return isinstance(other, TenantSlug) and self.value == other.value
