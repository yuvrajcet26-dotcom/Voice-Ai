from abc import ABC, abstractmethod
from typing import Dict, Any, Optional

class TelephonyProviderBase(ABC):
    """Abstract Base Class for Telephony Providers (Exotel, etc.)"""

    @abstractmethod
    async def initialize_call(self, caller_number: str, virtual_number: str) -> Dict[str, Any]:
        pass

    @abstractmethod
    async def transfer_call(self, provider_call_id: str, target_phone: str) -> Dict[str, Any]:
        pass

    @abstractmethod
    async def terminate_call(self, provider_call_id: str) -> Dict[str, Any]:
        pass

    @abstractmethod
    async def get_call_details(self, provider_call_id: str) -> Dict[str, Any]:
        pass

    @abstractmethod
    def generate_exoml_response(self, text_prompt: str, action_url: Optional[str] = None) -> str:
        pass
