#!/bin/sh
# entrypoint.sh

# Exit immediately if a command exits with a non-zero status.
set -e

# Define a maximum number of retries for database connection/migration
MAX_DB_RETRIES=10
DB_RETRY_COUNT=0

# Loop until Django's migrate command succeeds
until python manage.py migrate --noinput --settings=marbelle.settings.prod; do
  DB_RETRY_COUNT=$((DB_RETRY_COUNT+1))
  if [ $DB_RETRY_COUNT -ge $MAX_DB_RETRIES ]; then
    echo "Max database connection/migration retries reached. Exiting."
    exit 1
  fi
  echo "Database migration failed (connection or initial migration error). Retrying in 3 seconds... (Attempt $DB_RETRY_COUNT/$MAX_DB_RETRIES)"
  sleep 3
done

echo "Database migrations applied successfully."

# Start Gunicorn, passing control to it (replaces the shell process)
echo "Starting Gunicorn..."
exec gunicorn --config gunicorn_config.py marbelle.wsgi:application --bind 0.0.0.0:10000