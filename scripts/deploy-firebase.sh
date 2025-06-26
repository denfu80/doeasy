#!/bin/bash

# Firebase Deployment Script für mach.halt
# Führt Validierung und Deployment der Firebase Rules aus

set -e  # Exit on any error

echo "🔥 Firebase Deployment für mach.halt"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo -e "${RED}❌ Firebase CLI ist nicht installiert${NC}"
    echo "Installation: npm install -g firebase-tools"
    exit 1
fi

# Check if user is logged in
if ! firebase projects:list &> /dev/null; then
    echo -e "${YELLOW}🔐 Firebase Login erforderlich${NC}"
    firebase login
fi

# Validate project configuration
echo -e "${BLUE}📋 Validiere Projektkonfiguration...${NC}"

if [ ! -f ".firebaserc" ]; then
    echo -e "${RED}❌ .firebaserc nicht gefunden${NC}"
    exit 1
fi

if [ ! -f "firebase.json" ]; then
    echo -e "${RED}❌ firebase.json nicht gefunden${NC}"
    exit 1
fi

if [ ! -f "database.rules.json" ]; then
    echo -e "${RED}❌ database.rules.json nicht gefunden${NC}"
    exit 1
fi

# Show current project
PROJECT=$(firebase use)
echo -e "${BLUE}📍 Aktuelles Projekt: ${PROJECT}${NC}"

# Validate database rules
echo -e "${BLUE}🔍 Validiere Database Rules...${NC}"
if firebase database:rules:get > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Database Rules Syntax ist korrekt${NC}"
else
    echo -e "${RED}❌ Database Rules haben Syntax-Fehler${NC}"
    exit 1
fi

# Show what will be deployed
echo -e "${YELLOW}📦 Deployment Inhalt:${NC}"
echo "   - Database Security Rules"

# Ask for confirmation
read -p "Möchtest du fortfahren? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}⏹️  Deployment abgebrochen${NC}"
    exit 0
fi

# Deploy database rules
echo -e "${BLUE}🚀 Deploye Database Rules...${NC}"
if firebase deploy --only database; then
    echo -e "${GREEN}✅ Database Rules erfolgreich deployed${NC}"
else
    echo -e "${RED}❌ Database Rules Deployment fehlgeschlagen${NC}"
    exit 1
fi

# Test the deployed rules
echo -e "${BLUE}🧪 Teste deployete Rules...${NC}"
if node firebase-quick-test.js; then
    echo -e "${GREEN}✅ Rules Test erfolgreich${NC}"
else
    echo -e "${YELLOW}⚠️  Rules Test fehlgeschlagen - überprüfe die Konsole${NC}"
fi

echo -e "${GREEN}🎉 Firebase Deployment abgeschlossen!${NC}"
echo -e "${BLUE}📖 Firebase Console: https://console.firebase.google.com/project/${PROJECT}/database/doeasy-denfu-default-rtdb/rules${NC}"