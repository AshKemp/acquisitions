#!/bin/bash

# Production startup script for Acquisition App
# This script starts the application in production mode using Docker Compose

echo "🚀 Starting Acquisition App in Production Mode"
echo "================================================"

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo "❌ Error: .env.production file not found!"
    echo "   Please copy .env.production from the template and update it with your production credentials."
    exit 1
fi

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Error: Docker is not running!"
    echo "   Please start Docker Desktop and try again."
    exit 1
fi

echo "📦 Building and starting production containers..."
echo ""

docker compose -f docker-compose.prod.yml up --build --detach

if [ $? -ne 0 ]; then
    echo "❌ Failed to start production containers."
    exit 1
fi

echo ""
echo "🎉 Production environment started!"
echo "   Application: http://localhost:3000"
echo ""
echo "To stop the environment, run: docker compose -f docker-compose.prod.yml down"
