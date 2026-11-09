#!/usr/bin/env bash
set -euo pipefail
project_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "$project_dir"
command -v javac >/dev/null || { echo 'javac is missing. Install/configure a JDK, then try again.' >&2; exit 1; }
mkdir -p .cache out
jar_file="$project_dir/.cache/junit-console.jar"
if [[ ! -f "$jar_file" ]]; then
  curl -fL 'https://repo.maven.apache.org/maven2/org/junit/platform/junit-platform-console-standalone/1.10.5/junit-platform-console-standalone-1.10.5.jar' -o "$jar_file.tmp"
  mv "$jar_file.tmp" "$jar_file"
fi
javac -cp "$jar_file" -d out src/main/java/practice/*.java src/test/java/practice/*.java
java -jar "$jar_file" execute -cp out --scan-classpath --details=tree
