#!/bin/bash

echo "🏗️ Construyendo proyecto Assistravel..."

# Verificar que Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado"
    exit 1
fi

# Verificar que npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm no está instalado"
    exit 1
fi

echo "📦 Instalando dependencias..."
npm install

echo "🔨 Construyendo proyecto..."
npm run build

echo "✅ Construcción completada!"

# Si hay carpeta dist, mostrar su contenido
if [ -d "dist" ]; then
    echo "📁 Contenido de la carpeta dist:"
    ls -la dist/
    echo "✨ Archivos listos para deploy"
else
    echo "⚠️ No se encontró carpeta dist"
fi