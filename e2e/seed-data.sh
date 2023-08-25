cd .. ; source .env.e2e

function create_user {
    local response=$(curl -s -X "POST" -H "X-API-Key: $API_KEY" -H "content-type: application/json" -d "{ \"firstName\": \"$1\", \"lastName\": \"$2\", \"username\": \"$3\", \"email\": \"$3@email.com\", \"password\": \"12Pass!!\" }" "$GATEWAY_URL/api/v1/user")
    local token=$(echo $response | jq '.tokens' | jq '.access' )
    echo $token | tr -d '"'
}

function create_team {
    local response=$(curl -s -X "POST" -H "Authorization: Bearer $5" -H "X-API-Key: $API_KEY" -H "content-type: application/json" -d "{ \"team\": { \"place\": \"$1\", \"name\": \"$2\", \"teamname\": \"$3\", \"seasonStart\": \"$4\", \"seasonEnd\": \"$4\" } }" "$GATEWAY_URL/api/v1/team")
    local teamid=$(echo $response | jq '.team' | jq '._id' )
    echo $teamid
}

mongosh "mongodb+srv://$MONGO_USERNAME:$MONGO_PASSWORD@ultmt-api.lrtagl9.mongodb.net/ultmt-api" e2e/seed.js > /dev/null

# Team Management Users
# nacho=$(create_user "Ignacio" "Varga" "nacho")
# gus=$(create_user "Gustavo" "Fring" "gus")
# jesse=$(create_user "Jesse" "Pinkman" "jesse")
# heisenberg=$(create_user "Walter" "White" "heisenberg")
# sky=$(create_user "Skyler" "White" "sky")

# Game Users
lb=$(create_user "Lauren" "Boyle" "lb")
# aimiekawai=$(create_user "Aimie" "Kawai" "aimiekawai")
# alexnelson=$(create_user "Alex" "Nelson" "alexnelson")
# alexaromersa=$(create_user "Alexa" "Romersa" "alexaromersa")
# ariannelozano=$(create_user "Arianne" "Lozano" "ariannelozano")
# bertcherry=$(create_user "Bert" "Cherry" "bertcherry")
# billykatz=$(create_user "Billy" "Katz" "billykatz")
# brandonli=$(create_user "Brandon" "Li" "brandonli")
# cassiewong=$(create_user "Cassie" "Wong" "cassiewong")
# coribigham=$(create_user "Cori" "Bigham" "coribigham")
# deniseblohowiak=$(create_user "Denise" "Blohowiak" "deniseblohowiak")
# dominiccavalero=$(create_user "Dominic" "Cavalero" "dominiccavalero")
# emilydecker=$(create_user "Emily" "Decker" "emilydecker")
# francesgellert=$(create_user "Frances" "Gellert" "francesgellert")
# husayncarnegie=$(create_user "Husayn" "Carnegie" "husayncarnegie")
# jackbrown=$(create_user "Jack" "Brown" "jackbrown")
# jessebolton=$(create_user "Jesse" "Bolton" "jessebolton")
# kahyeefong=$(create_user "Kahyee" "Fong" "kahyeefong")
# khalifelsalaam=$(create_user "Khalif" "El-Salaam" "khalifelsalaam")
# lexigarrity=$(create_user "Lexi" "Garrity" "lexigarrity")
# marcmunoz=$(create_user "Marc" "Munoz" "marcmunoz")
# marioobrien=$(create_user "Mario" "O'Brien" "marioobrien")

# Create Team
mixtape=$(create_team "Seattle" "Mixtape" "mixtape" "2024-01-01" $lb)
echo "MIXTAPE ID: $mixtape"

# curl -s -X "POST" -H "X-API-Key: $API_KEY" -H "content-type: application/json" -d "{ \"firstName\": \"Ignacio\", \"lastName\": \"Varga\", \"username\": \"nacho\", \"email\": \"nacho@email.com\", \"password\": \"12Pass!!\" }" "$GATEWAY_URL/api/v1/user"
# curl -s -X "POST" -H "X-API-Key: $API_KEY" -H "content-type: application/json" -d '{ "firstName": "Gustavo", "lastName": "Fring", "username": "gus", "email": "gus@email.com", "password": "12Pass!!" }' "$GATEWAY_URL/api/v1/user"
# curl -s -X "POST" -H "X-API-Key: $API_KEY" -H "content-type: application/json" -d '{ "firstName": "Jesse", "lastName": "Pinkman", "username": "jesse", "email": "jesse@email.com", "password": "12Pass!!" }' "$GATEWAY_URL/api/v1/user"
# curl -s -X "POST" -H "X-API-Key: $API_KEY" -H "content-type: application/json" -d '{ "firstName": "Walter", "lastName": "White", "username": "heisenberg", "email": "heisenberg@email.com", "password": "12Pass!!" }' "$GATEWAY_URL/api/v1/user"
# curl -s -X "POST" -H "X-API-Key: $API_KEY" -H "content-type: application/json" -d '{ "firstName": "Skyler", "lastName": "White", "username": "sky", "email": "sky@email.com", "password": "12Pass!!" }' "$GATEWAY_URL/api/v1/user" 

# curl -s -X "POST" -H "X-API-Key: $API_KEY" -H "content-type: application/json" -d '{ "firstName": "Darryl", "lastName": "Stanley", "username": "darryl", "email": "darryl@email.com", "password": "12Pass!!" }' "$GATEWAY_URL/api/v1/user"
# curl -s -X "POST" -H "X-API-Key: $API_KEY" -H "content-type: application/json" -d '{ "firstName": "Darryl", "lastName": "Stanley", "username": "darryl", "email": "darryl@email.com", "password": "12Pass!!" }' "$GATEWAY_URL/api/v1/user"
# curl -s -X "POST" -H "X-API-Key: $API_KEY" -H "content-type: application/json" -d '{ "firstName": "Darryl", "lastName": "Stanley", "username": "darryl", "email": "darryl@email.com", "password": "12Pass!!" }' "$GATEWAY_URL/api/v1/user"
# curl -s -X "POST" -H "X-API-Key: $API_KEY" -H "content-type: application/json" -d '{ "firstName": "Darryl", "lastName": "Stanley", "username": "darryl", "email": "darryl@email.com", "password": "12Pass!!" }' "$GATEWAY_URL/api/v1/user"
# curl -s -X "POST" -H "X-API-Key: $API_KEY" -H "content-type: application/json" -d '{ "firstName": "Darryl", "lastName": "Stanley", "username": "darryl", "email": "darryl@email.com", "password": "12Pass!!" }' "$GATEWAY_URL/api/v1/user"
# curl -s -X "POST" -H "X-API-Key: $API_KEY" -H "content-type: application/json" -d '{ "firstName": "Darryl", "lastName": "Stanley", "username": "darryl", "email": "darryl@email.com", "password": "12Pass!!" }' "$GATEWAY_URL/api/v1/user"
# curl -s -X "POST" -H "X-API-Key: $API_KEY" -H "content-type: application/json" -d '{ "firstName": "Darryl", "lastName": "Stanley", "username": "darryl", "email": "darryl@email.com", "password": "12Pass!!" }' "$GATEWAY_URL/api/v1/user"
# curl -s -X "POST" -H "X-API-Key: $API_KEY" -H "content-type: application/json" -d '{ "firstName": "Darryl", "lastName": "Stanley", "username": "darryl", "email": "darryl@email.com", "password": "12Pass!!" }' "$GATEWAY_URL/api/v1/user"