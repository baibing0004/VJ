@echo off
java -jar yuicompressor-2.4.8.jar --type js --charset utf-8 -v %1 > %1-min.js