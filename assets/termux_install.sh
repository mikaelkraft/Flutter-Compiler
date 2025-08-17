#!/bin/bash
# Flutter installation script for Termux

echo "⬇️ Installing dependencies..."
pkg update -y && pkg install -y \
    git \
    wget \
    openjdk-17 \
    dart \
    cmake \
    ninja \
    clang

echo "🚀 Downloading Flutter..."
wget https://storage.googleapis.com/flutter_infra_release/releases/stable/linux/flutter_linux_3.22.2-stable.tar.xz

echo "📦 Extracting..."
tar xf flutter_linux_*.tar.xz
rm flutter_linux_*.tar.xz

echo "⚙️ Configuring paths..."
echo 'export PATH="$PATH:$HOME/flutter/bin"' >> ~/.bashrc
source ~/.bashrc

echo "✅ Verifying..."
flutter doctor --no-upgrade