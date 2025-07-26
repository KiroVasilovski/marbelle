"""
Gunicorn configuration for production deployment of Marbelle Django application.
"""

import os

# Server socket
bind = "0.0.0.0:8000"
backlog = 2048

# Worker processes
workers = int(os.environ.get("GUNICORN_WORKERS", 4))
worker_class = "sync"
worker_connections = 1000
timeout = int(os.environ.get("GUNICORN_TIMEOUT", 30))
keepalive = 2

# Restart workers after this many requests, to prevent memory leaks
max_requests = 1000
max_requests_jitter = 50

# Logging
accesslog = "-"  # Log to stdout
errorlog = "-"  # Log to stderr
loglevel = "info"
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s"'

# Process naming
proc_name = "marbelle_gunicorn"

# Server mechanics
daemon = False
pidfile = None
user = None
group = None
tmp_upload_dir = None

# SSL (can be enabled later)
keyfile = None
certfile = None

# Preload app for better performance
preload_app = True

# Graceful timeout for worker shutdown
graceful_timeout = 30

# Security
limit_request_line = 4094
limit_request_fields = 100
limit_request_field_size = 8190
