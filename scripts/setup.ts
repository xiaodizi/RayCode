#!/usr/bin/env bun

console.log('🚀 RayCode - Open Agentic Coding Platform');
console.log('🎯 Paper2Code · Text2Web · Text2Backend');
console.log('========================================');

console.log('\n📦 Dependency Installation...');
console.log('========================================');

try {
  // Test Bun installation
  const bunVersion = await Bun.spawnSync(['bun', '--version']);
  console.log(`✅ Bun: ${bunVersion.stdout.toString().trim()}`);
  
  // Install dependencies
  console.log('📦 Installing dependencies...');
  const installResult = await Bun.spawnSync(['bun', 'install']);
  console.log('✅ Dependencies installed');
  
  // Run TypeScript type check
  console.log('🔍 Type checking...');
  const typeCheckResult = await Bun.spawnSync(['bun', 'run', 'typecheck']);
  if (typeCheckResult.exitCode === 0) {
    console.log('✅ Type check passed');
  } else {
    console.error('❌ Type check failed');
    console.error(typeCheckResult.stderr.toString());
  }
  
  // Build the project
  console.log('🏗️  Building...');
  const buildResult = await Bun.spawnSync(['bun', 'run', 'build']);
  if (buildResult.exitCode === 0) {
    console.log('✅ Build completed successfully');
  } else {
    console.error('❌ Build failed');
    console.error(buildResult.stderr.toString());
  }
  
  console.log('\n🎉 Setup complete!');
  console.log('========================================');
  console.log('Start the CLI with:');
  console.log('  $ bun run start');
  console.log('\nStart the web server with:');
  console.log('  $ bun run web');
  
} catch (error) {
  console.error('❌ Error during setup:');
  console.error(error);
}