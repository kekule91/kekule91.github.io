#!/usr/bin/env bash
# Compila Pliego.apk sin Gradle. Requiere ANDROID_HOME con platforms;android-35 y build-tools;35.0.0, un JDK y Node.
set -euo pipefail
cd "$(dirname "$0")"
SDK="${ANDROID_HOME:?definí ANDROID_HOME}"
BT="$SDK/build-tools/35.0.0"; JAR="$SDK/platforms/android-35/android.jar"
(cd ../pliego-src && npm install --silent && npm run build --silent)
OUT=build; rm -rf $OUT; mkdir -p $OUT/assets $OUT/classes $OUT/dex
# file:// no admite <script type="module">: se incrusta JS y CSS en un solo index.html.
python3 - ../pliego $OUT/assets/index.html <<'PY'
import re, sys, pathlib
src = pathlib.Path(sys.argv[1]); html = (src / "index.html").read_text()
js = re.search(r'<script type="module" crossorigin src="\./([^"]+)"></script>\n?\s*', html)
html = html.replace(js.group(0), "")
css = re.search(r'<link rel="stylesheet" crossorigin href="\./([^"]+)">', html)
html = html.replace(css.group(0), "<style>" + (src / css.group(1)).read_text() + "</style>")
html = html.replace("</body>", "<script>" + (src / js.group(1)).read_text() + "</script>\n</body>")
pathlib.Path(sys.argv[2]).write_text(html)
PY
cp ../pliego/favicon.svg $OUT/assets/
"$BT/aapt2" compile --dir res -o $OUT/res.zip
"$BT/aapt2" link -I "$JAR" --manifest AndroidManifest.xml -A $OUT/assets -o $OUT/app.unsigned.apk $OUT/res.zip --java $OUT/gen
javac -nowarn -g -source 11 -target 11 -classpath "$JAR" -d $OUT/classes $(find src $OUT/gen -name '*.java') 2>&1 | grep -v "warning\|^Note" || true
(cd $OUT/classes && jar cf ../classes.jar .)
"$BT/d8" --release --lib "$JAR" --min-api 24 --output $OUT/dex $OUT/classes.jar
(cd $OUT/dex && zip -qj ../app.unsigned.apk classes.dex)
"$BT/zipalign" -f 4 $OUT/app.unsigned.apk $OUT/app.aligned.apk
"$BT/apksigner" sign --ks keystore.jks --ks-pass pass:pliego --key-pass pass:pliego --out ../pliego/Pliego.apk $OUT/app.aligned.apk
rm -f ../pliego/Pliego.apk.idsig
echo "APK listo: pliego/Pliego.apk"
