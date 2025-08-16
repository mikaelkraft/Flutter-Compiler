#!/bin/bash

# Termux Flutter+Firebase Installer
# By Mikael Kraft (@mikaelkraft)

echo "🔧 Starting Flutter+Dart setup for Termux..."

# 1. Update packages
pkg update -y && pkg upgrade -y

# 2. Install core dependencies
pkg install -y \
    git \
    wget \
    openjdk-17 \
    dart \
    cmake \
    ninja \
    clang

# 3. Install Dart separately (if not available via pkg)
if ! command -v dart &> /dev/null; then
    echo "📦 Installing Dart SDK..."
    wget https://storage.googleapis.com/dart-archive/channels/stable/release/latest/sdk/dartsdk-linux-arm64-release.zip
    unzip dartsdk-linux-arm64-release.zip
    rm dartsdk-linux-arm64-release.zip
    export PATH="$PATH:$PWD/dart-sdk/bin"
fi

# 4. Install Flutter
echo "🚀 Installing Flutter..."
wget https://storage.googleapis.com/flutter_infra_release/releases/stable/linux/flutter_linux_3.22.2-stable.tar.xz
tar xf flutter_linux_3.22.2-stable.tar.xz
rm flutter_linux_3.22.2-stable.tar.xz

# 5. Set up environment
echo 'export PATH="$PATH:$HOME/flutter/bin"' >> ~/.bashrc
echo 'export PATH="$PATH:$HOME/.pub-cache/bin"' >> ~/.bashrc  # For Dart global packages
source ~/.bashrc

# 6. Verify installation
echo "✅ Verifying setup..."
flutter doctor --no-upgrade
dart --version

# 7. Install FlutterFire CLI (optional but recommended)
echo "🔥 Preparing FlutterFire..."
dart pub global activate flutterfire_cli

echo "🎉 Setup complete! Restart Termux session."