#!/usr/bin/env bash
# exit on error
set -o errexit

# Note: Render's Python environment already has ffmpeg installed
echo "Starting Python build..."

# Install python dependencies
echo "Installing python dependencies..."
pip install --upgrade pip
pip install -r python-backend/requirements.txt

echo "Build complete!"
