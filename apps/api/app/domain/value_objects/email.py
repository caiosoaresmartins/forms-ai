import re

EMAIL_REGEX = re.compile(r'^[\w\.-]+@[\w\.-]+\.\w{2,}$')

class Email:
    def __init__(self, value: str):
        if not EMAIL_REGEX.match(value):
            raise ValueError(f"Email inválido: {value}")
        self.value = value.lower()

    def __str__(self): return self.value
    def __eq__(self, other): return isinstance(other, Email) and self.value == other.value
