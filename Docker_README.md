#### Build docker image from source

Requirement: 
* Java 1.8 for backend
* NodeJs 16 for frontend

### 1. Build docker images
`cd` to the root folder of HPC-Cloud project and run command:
```
./build_docker_images.sh
```
### 2. Check initialize or upgrade the database
```
cd deploy/docker
docker-compose --profile schema up -d
```
### 3. Run HPC-Cloud
```
docker-compose --profile all up -d
```
Then you could access HPC-Cloud web UI: http://localhost:12345/dolphinscheduler/ui and use admin and dolphinscheduler123 as default username and password in the login page.
