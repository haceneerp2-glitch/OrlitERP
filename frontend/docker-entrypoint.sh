#!/bin/sh
# Inject environment variables into config.js
if [ -n "$VITE_API_URL" ]; then
    # Prepend https:// if missing (Render provides host without protocol)
    if echo "$VITE_API_URL" | grep -q "^http"; then
        API_URL="$VITE_API_URL"
    else
        API_URL="https://$VITE_API_URL"
    fi
    echo "window.APP_CONFIG = { API_URL: '${API_URL}' };" > /usr/share/nginx/html/config.js
fi

# Execute the CMD
exec "$@"
