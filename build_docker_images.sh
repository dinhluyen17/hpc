mvn clean package -Dmaven.test.skip -Dmaven.checkstyle.skip
#
cd quantum-composer
npm install
cd ../dolphinscheduler-ui
npm install
npm run rebuild-quantum-composer
npm run build:prod
#
cd ../dolphinscheduler-api
docker build -t hpc-api .
#
cd ../dolphinscheduler-tools
docker build -t hpc-tools .
# 
cd ..
echo "DONE!!!"