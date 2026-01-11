#!/bin/sh
# Inject environment variables into config.js
if [ -n "$VITE_API_URL" ]; then
    echo "window.APP_CONFIG = { API_URL: '${VITE_API_URL}' };" > /usr/share/nginx/html/config.js
fi

# Execute the CMD
exec "$@"
