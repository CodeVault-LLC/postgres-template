#!/bin/bash

# tune_postgresql.sh
# Usage: ./tune_postgresql.sh <total_memory_mb>

# Function to display usage and exit
usage() {
    echo "Usage: $0 <total_memory_mb>"
    exit 1
}

# Check if the correct number of arguments is provided
if [ "$#" -ne 1 ]; then
    usage
fi

TOTAL_MEMORY_MB=$1

# Calculate recommended settings
SHARED_BUFFERS=$(echo "$TOTAL_MEMORY_MB * 0.25" | bc)
WORK_MEM=$(echo "$TOTAL_MEMORY_MB * 0.05 / 100" | bc)
MAINTENANCE_WORK_MEM=$(echo "$TOTAL_MEMORY_MB * 0.15" | bc)

# Backup current configuration
PG_CONF="/etc/postgresql/12/main/postgresql.conf"
cp "$PG_CONF" "$PG_CONF.bak"

echo "Tuning PostgreSQL settings based on $TOTAL_MEMORY_MB MB of total memory..."

# Update PostgreSQL configuration with new settings
sed -i "s|#shared_buffers = 128MB|shared_buffers = ${SHARED_BUFFERS}MB|" "$PG_CONF"
sed -i "s|#work_mem = 4MB|work_mem = ${WORK_MEM}MB|" "$PG_CONF"
sed -i "s|#maintenance_work_mem = 64MB|maintenance_work_mem = ${MAINTENANCE_WORK_MEM}MB|" "$PG_CONF"

# Restart PostgreSQL to apply changes
echo "Restarting PostgreSQL..."
systemctl restart postgresql

# Check if PostgreSQL restarted successfully
if [ $? -eq 0 ]; then
    echo "PostgreSQL settings tuned successfully."
else
    echo "Failed to restart PostgreSQL. Please check the configuration."
    exit 1
fi
