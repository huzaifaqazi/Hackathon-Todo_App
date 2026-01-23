#!/bin/bash
# Railway deployment setup script

echo "Setting up backend for Railway deployment..."

# Install dependencies
pip install -r requirements.txt

# Run database migrations if needed
# alembic upgrade head

echo "Setup complete!"