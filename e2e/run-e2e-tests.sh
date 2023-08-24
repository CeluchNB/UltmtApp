source .env.e2e

# Spin up Cloud Run services
curl -s --max-time 30 --retry 3 --retry-max-time 120 --header "X-API-Key: $API_KEY" "$GATEWAY_URL/ultmt"
curl -s --max-time 30 --retry 3 --retry-max-time 120 --header "X-API-Key: $API_KEY" "$GATEWAY_URL/stall-one"

# Start e2e 
yarn start:e2e & disown > /dev/null
PID=$!

# Build Android
cd ../android ; ./gradlew clean ; cd ../e2e
detox build -c android.emu.debug

# Build iOS
detox build -c ios.sim.debug

# Delete data in DBs
mongosh "mongodb+srv://$MONGO_USERNAME:$MONGO_PASSWORD@ultmt-api.lrtagl9.mongodb.net/ultmt-api" e2e/seed.js > /dev/null

# Test android
detox test -c android.emu.debug e2e/team-management.test.ts

# Delete data in DBs
mongosh "mongodb+srv://$MONGO_USERNAME:$MONGO_PASSWORD@ultmt-api.lrtagl9.mongodb.net/ultmt-api" e2e/seed.js > /dev/null

# Test ios
detox test -c ios.sim.debug e2e/team-management.test.ts

# Kill metro
kill $PID