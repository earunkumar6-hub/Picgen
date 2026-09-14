from abc import ABC, abstractmethod


class ProviderError(RuntimeError):
    pass


class ImageProvider(ABC):
    name: str
    label: str

    @abstractmethod
    def is_available(self) -> bool: ...

    @abstractmethod
    def generate(self, prompt: str, n: int, aspect_ratio: str, fmt: str) -> list[bytes]:
        """Generate `n` images for `prompt`, returning raw image bytes for each."""
        ...
