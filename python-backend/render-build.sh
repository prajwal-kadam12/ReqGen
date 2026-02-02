#!/usr/bin/env bash
# exit on error
set -o errexit

# Install ffmpeg
echo "Installing ffmpeg..."
apt-get update && apt-get install -y ffmpeg

# Install python dependencies
echo "Installing python dependencies..."
pip install --upgrade pip
pip install -r python-backend/requirements.txt
