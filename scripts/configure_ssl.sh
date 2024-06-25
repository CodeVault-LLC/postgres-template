#!/bin/bash

# Define the variables
SSL_KEY_PATH="$1"
SSL_CERT_PATH="$2"
POSTGRES_CONF_PATH="/var/lib/postgresql/data/postgresql.conf"
POSTGRES_HBA_PATH="/var/lib/postgresql/data/pg_hba.conf"

# Function to update PostgreSQL configuration for SSL
configure_ssl() {
  echo "Configuring SSL with the following paths:"
  echo "SSL Key Path: $SSL_KEY_PATH"
  echo "SSL Certificate Path: $SSL_CERT_PATH"

  # Check if the provided files exist
  if [[ ! -f "$SSL_KEY_PATH" || ! -f "$SSL_CERT_PATH" ]]; then
    echo "Error: SSL key or certificate file does not exist."
    exit 1
  fi

  # Adjust file permissions
  echo "Setting correct file permissions for SSL key..."
  chmod 600 "$SSL_KEY_PATH"
  chown postgres:postgres "$SSL_KEY_PATH"

  echo "Setting correct file permissions for SSL certificate..."
  chmod 644 "$SSL_CERT_PATH"
  chown postgres:postgres "$SSL_CERT_PATH"

  # Update the PostgreSQL configuration file
  echo "Updating $POSTGRES_CONF_PATH for SSL..."
  sed -i "s|#ssl = off|ssl = on|g" "$POSTGRES_CONF_PATH"
  sed -i "s|#ssl_cert_file = 'server.crt'|ssl_cert_file = '$SSL_CERT_PATH'|g" "$POSTGRES_CONF_PATH"
  sed -i "s|#ssl_key_file = 'server.key'|ssl_key_file = '$SSL_KEY_PATH'|g" "$POSTGRES_CONF_PATH"

  # Update pg_hba.conf to allow SSL connections
  echo "Updating $POSTGRES_HBA_PATH for SSL..."
  echo "hostssl all all 0.0.0.0/0 md5" >> "$POSTGRES_HBA_PATH"

  # Reload PostgreSQL configuration
  echo "Reloading PostgreSQL configuration..."
  pg_ctl reload -D /var/lib/postgresql/data

  echo "SSL configuration completed successfully."
}

# Run the function
configure_ssl
