cd ../quantum-composer/
npm run build
cd ..
cp ./quantum-composer/out/quirk.html ./dolphinscheduler-ui/public/quirk.html 
cp ./quantum-composer/out/styles.css ./dolphinscheduler-ui/public/styles.css
cp -R ./quantum-composer/out/dist ./dolphinscheduler-ui/public