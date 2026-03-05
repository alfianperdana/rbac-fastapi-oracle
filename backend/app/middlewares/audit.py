from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AuditLogMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # We only log mutating requests
        method = request.method
        if method in ["POST", "PUT", "DELETE", "PATCH"]:
            # Basic audit log: in a real system we might log the user ID from JWT,
            # but reading the request body here can be tricky (consumes the stream).
            user_agent = request.headers.get("user-agent", "Unknown")
            client_ip = request.client.host if request.client else "Unknown"
            logger.info(f"[AUDIT LOG] Action: {method} Path: {request.url.path} IP: {client_ip} User-Agent: {user_agent}")
            
        response = await call_next(request)
        return response
