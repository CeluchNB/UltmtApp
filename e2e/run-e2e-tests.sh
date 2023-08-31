#!/bin/bash
source .env.e2e

# Spin up Cloud Run services
curl -s --max-time 30 --retry 3 --retry-max-time 120 --header "X-API-Key: $API_KEY" "$GATEWAY_URL/ultmt"
curl -s --max-time 30 --retry 3 --retry-max-time 120 --header "X-API-Key: $API_KEY" "$GATEWAY_URL/stall-one"
curl -s --max-time 30 --retry 3 --retry-max-time 120 --header "X-API-Key: $API_KEY" "$GATEWAY_URL/ultmt-stats"

# Start e2e 
yarn start:e2e & disown > /dev/null
PID=$!

# Seed data
./e2e/seed-data.sh

# Build Android
cd android ; ./gradlew clean ; cd ..
detox build -c android.emu.debug -s

# Test android
detox test -c android.emu.debug

# Seed data
./e2e/seed-data.sh

# Build iOS
detox build -c ios.sim.debug -s

# Test ios
detox test -c ios.sim.debug

# Kill metro
kill $PID