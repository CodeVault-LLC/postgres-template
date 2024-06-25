#!/bin/bash

# Define the variables
DB_NAME="$1"
BACKUP_PATH="$2"

# Function to restore the PostgreSQL database
restore_database() {
  echo "Restoring PostgreSQL database: $DB_NAME from $BACKUP_PATH"

  # Check if database name and backup path are provided
  if [[ -z "$DB_NAME" || -z "$BACKUP_PATH" ]]; then
    echo "Error: Database name or backup path not provided."
    exit 1
  fi

  # Create the database if it doesn't exist
  psql -U postgres -c "CREATE DATABASE $DB_NAME;"

  # Perform the restore
  pg_restore -U postgres -d "$DB_NAME" "$BACKUP_PATH"

  echo "Restore completed successfully."
}

# Run the function
restore_database
