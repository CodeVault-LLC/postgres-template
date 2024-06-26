# Base PostgreSQL 16 Image
FROM postgres:16

# Update package lists
RUN apt-get update

# Install tools
RUN apt-get install -y --no-install-recommends \
    jq

# Set the environment variables
ENV POSTGRES_USER=codevault
ENV POSTGRES_PASSWORD=0a6d7ef3e5c33de35aea2bf86187dc493212603d56cef31135c30707064af3e315159dda3eec32fccffd187f7ad85da7df0b27224059e155e0b818d2c11a9a23
ENV POSTGRES_DB=codevault
ENV POSTGRES_HOST=localhost
ENV POSTGRES_PORT=5435

# Expose the port
EXPOSE 5435

