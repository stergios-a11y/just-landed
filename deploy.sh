#!/bin/bash
set -e

echo "Updating from GitHub..."
git pull --ff-only

echo "Deploying JUST LANDED..."
npx wrangler deploy

echo "Deployment complete."
