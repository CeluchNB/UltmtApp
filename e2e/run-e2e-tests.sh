source .env.e2e

# Spin up Cloud Run services
curl -s --max-time 30 --retry 3 --retry-max-time 120 --header "X-API-Key: $API_KEY" "$GATEWAY_URL/ultmt"
curl -s --max-time 30 --retry 3 --retry-max-time 120 --header "X-API-Key: $API_KEY" "$GATEWAY_URL/stall-one"

# Delete data in DBs
mongosh "mongodb+srv://$MONGO_USERNAME:$MONGO_PASSWORD@ultmt-api.lrtagl9.mongodb.net/ultmt-api" e2e/seed.js > /dev/null
curl -s -o /dev/null -X "POST" -H "X-API-Key: $API_KEY" -H "content-type: application/json" -d "{ \"firstName\": \"Ignacio\", \"lastName\": \"Varga\", \"username\": \"nacho\", \"email\": \"nacho@gmail.com\", \"password\": \"12Pass!!\" }" "$GATEWAY_URL/api/v1/user"
curl -s -o /dev/null -X "POST" -H "X-API-Key: $API_KEY" -H "content-type: application/json" -d '{ "firstName": "Gustavo", "lastName": "Fring", "username": "gus", "email": "gus@gmail.com", "password": "12Pass!!" }' "$GATEWAY_URL/api/v1/user"
curl -s -o /dev/null -X "POST" -H "X-API-Key: $API_KEY" -H "content-type: application/json" -d '{ "firstName": "Jesse", "lastName": "Pinkman", "username": "jesse", "email": "jesse@gmail.com", "password": "12Pass!!" }' "$GATEWAY_URL/api/v1/user"
curl -s -o /dev/null -X "POST" -H "X-API-Key: $API_KEY" -H "content-type: application/json" -d '{ "firstName": "Walter", "lastName": "White", "username": "heisenberg", "email": "heisenberg@gmail.com", "password": "12Pass!!" }' "$GATEWAY_URL/api/v1/user"
curl -s -o /dev/null -X "POST" -H "X-API-Key: $API_KEY" -H "content-type: application/json" -d '{ "firstName": "Skyler", "lastName": "White", "username": "sky", "email": "sky@gmail.com", "password": "12Pass!!" }' "$GATEWAY_URL/api/v1/user" 

# Start e2e 
yarn start:e2e & disown > /dev/null
PID=$!

# Build Android
cd ../android ; ./gradlew clean ; cd ../e2e
detox build -c android.emu.debug -s

# Test android
detox test -c android.emu.debug

# Delete data in DBs
mongosh "mongodb+srv://$MONGO_USERNAME:$MONGO_PASSWORD@ultmt-api.lrtagl9.mongodb.net/ultmt-api" e2e/seed.js > /dev/null
curl -s -o /dev/null -X "POST" -H "X-API-Key: $API_KEY" -H "content-type: application/json" -d "{ \"firstName\": \"Ignacio\", \"lastName\": \"Varga\", \"username\": \"nacho\", \"email\": \"nacho@gmail.com\", \"password\": \"12Pass!!\" }" "$GATEWAY_URL/api/v1/user"
curl -s -o /dev/null -X "POST" -H "X-API-Key: $API_KEY" -H "content-type: application/json" -d '{ "firstName": "Gustavo", "lastName": "Fring", "username": "gus", "email": "gus@gmail.com", "password": "12Pass!!" }' "$GATEWAY_URL/api/v1/user"
curl -s -o /dev/null -X "POST" -H "X-API-Key: $API_KEY" -H "content-type: application/json" -d '{ "firstName": "Jesse", "lastName": "Pinkman", "username": "jesse", "email": "jesse@gmail.com", "password": "12Pass!!" }' "$GATEWAY_URL/api/v1/user"
curl -s -o /dev/null -X "POST" -H "X-API-Key: $API_KEY" -H "content-type: application/json" -d '{ "firstName": "Walter", "lastName": "White", "username": "heisenberg", "email": "heisenberg@gmail.com", "password": "12Pass!!" }' "$GATEWAY_URL/api/v1/user"
curl -s -o /dev/null -X "POST" -H "X-API-Key: $API_KEY" -H "content-type: application/json" -d '{ "firstName": "Skyler", "lastName": "White", "username": "sky", "email": "sky@gmail.com", "password": "12Pass!!" }' "$GATEWAY_URL/api/v1/user" 

# Build iOS
detox build -c ios.sim.debug -s

# Test ios
detox test -c ios.sim.debug

# Kill metro
kill $PID