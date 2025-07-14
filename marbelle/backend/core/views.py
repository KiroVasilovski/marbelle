from datetime import datetime

from django.db import connection
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods


@require_http_methods(["GET"])
def health_check(request):  # noqa: ANN001  # Needed by Django, otherwise a TypeError is raised
    """
    Health check endpoint for monitoring server status.

    Returns:
        JSON response with health status, timestamp, and database connectivity.
    """
    response_data = {"status": "healthy", "timestamp": datetime.now().isoformat(), "service": "marbelle-backend"}

    # Test database connectivity
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            response_data["database"] = "connected"
    except Exception as e:
        response_data["status"] = "unhealthy"
        response_data["database"] = "disconnected"
        response_data["error"] = str(e)
        return JsonResponse(response_data, status=503)

    return JsonResponse(response_data)
