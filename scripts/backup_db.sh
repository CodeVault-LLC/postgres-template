#!/bin/bash

# Define the variables
DB_NAME="$1"
BACKUP_PATH="$2"

# Function to back up the PostgreSQL database
backup_database() {
  echo "Backing up PostgreSQL database: $DB_NAME to $BACKUP_PATH"

  # Check if database name and backup path are provided
  if [[ -z "$DB_NAME" || -z "$BACKUP_PATH" ]]; then
    echo "Error: Database name or backup path not provided."
    exit 1
  fi

  # Perform the backup
  pg_dump -U postgres -d "$DB_NAME" -F c -f "$BACKUP_PATH"

  echo "Backup completed successfully."
}

# Run the function
backup_database
