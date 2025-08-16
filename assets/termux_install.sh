#!/bin/bash  
pkg update -y  
pkg install git openjdk-17 -y  
git clone https://github.com/flutter/flutter.git  
echo 'export PATH="$PATH:$HOME/flutter/bin"' >> ~/.bashrc  
source ~/.bashrc  
flutter doctor  