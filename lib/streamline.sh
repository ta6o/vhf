#!/bin/bash          

sass sass/materialize.scss > ../public/css/materialize.css

cd ../public/js/
cat jquery-3.3.1.min.js materialize.js leaflet.js leaflet.providers.js \
leaflet.rotatedmarker.js leaflet.nauticscale.js > main.js
#java -jar ../../lib/yui.jar --type js all.js > main.js

cd ../css/
cat materialize.css > main.css
#java -jar ../../lib/yui.jar --type css ./all.css > ./main.css

echo "css updated on `date`"


