#!/usr/bin/env bun

// Test script to verify project structure and basic functionality

console.log('🧪 Project Structure Verification');
console.log('================================');

const fs = require('fs');
const path = require('path');

// Check required files and directories
const requiredDirectories = [
  'src',
  'src/cli',
  'src/core',
  'src/config',
  'src/types',
  'src/utils',
  'src/workflows',
  'src/web'
];

const requiredFiles = [
  'package.json',
  'tsconfig.json',
  '.gitignore',
  'src/index.ts',
  'src/cli/main.ts',
  'src/cli/conversation-ui.ts',
  'src/cli/glassmorphism-ui.ts',
  'src/core/engine.ts',
  'src/core/llm.ts',
  'src/types/index.ts',
  'src/config/index.ts'
];

let allFilesFound = true;

console.log('📁 Directory structure:');
requiredDirectories.forEach(dir => {
  const dirPath = path.join(__dirname, '..', dir);
  try {
    if (fs.statSync(dirPath).isDirectory()) {
      console.log(`✅ ${dir}`);
    }
  } catch (error) {
    console.error(`❌ ${dir}`);
    allFilesFound = false;
  }
});

console.log('\n📄 Required files:');
requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  try {
    if (fs.statSync(filePath).isFile()) {
      console.log(`✅ ${file}`);
    }
  } catch (error) {
    console.error(`❌ ${file}`);
    allFilesFound = false;
  }
});

console.log('\n📦 Package.json dependencies:');
const packageJson = require(path.join(__dirname, '..', 'package.json'));
const dependencies = Object.keys(packageJson.dependencies || {});
const devDependencies = Object.keys(packageJson.devDependencies || {});

console.log('Production dependencies:');
dependencies.forEach(dep => {
  console.log(`  - ${dep}`);
});

console.log('\nDevelopment dependencies:');
devDependencies.forEach(dep => {
  console.log(`  - ${dep}`);
});

console.log(`\n🎯 Total dependencies: ${dependencies.length} production, ${devDependencies.length} development`);

if (allFilesFound) {
  console.log('\n✅ Project structure verification passed');
  console.log('\n🚀 Run `bun run start` to launch the CLI');
  console.log('🌐 Run `bun run web` to start the web server');
} else {
  console.error('\n❌ Project structure verification failed');
}