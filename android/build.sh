#!/usr/bin/env bash
# Compila el APK sin Gradle. Requiere ANDROID_HOME con platforms;android-34 y build-tools;35.0.0, y un JDK.
set -euo pipefail
cd "$(dirname "$0")"
SDK="${ANDROID_HOME:?definí ANDROID_HOME}"
BT="$SDK/build-tools/35.0.0"; JAR="$SDK/platforms/android-34/android.jar"
OUT=build; rm -rf $OUT; mkdir -p $OUT/assets $OUT/classes $OUT/dex
cp ../dibujo/index.html $OUT/assets/index.html
"$BT/aapt2" compile --dir res -o $OUT/res.zip
"$BT/aapt2" link -I "$JAR" --manifest AndroidManifest.xml -A $OUT/assets -o $OUT/app.unsigned.apk $OUT/res.zip --java $OUT/gen
javac -nowarn -g -source 11 -target 11 -classpath "$JAR" -d $OUT/classes $(find src $OUT/gen -name '*.java') 2>&1 | grep -v "warning\|^Note" || true
(cd $OUT/classes && jar cf ../classes.jar .)
"$BT/d8" --release --lib "$JAR" --min-api 24 --output $OUT/dex $OUT/classes.jar
(cd $OUT/dex && zip -qj ../app.unsigned.apk classes.dex)
"$BT/zipalign" -f 4 $OUT/app.unsigned.apk $OUT/app.aligned.apk
"$BT/apksigner" sign --ks keystore.jks --ks-pass pass:dibujos --key-pass pass:dibujos --out ../dibujo/DibujosQuimica.apk $OUT/app.aligned.apk
echo "APK listo: dibujo/DibujosQuimica.apk"
