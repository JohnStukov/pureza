#!/usr/bin/env node

/**
 * Script de prueba de integración para verificar la conexión con manage-users
 * Ejecuta tests de conectividad y genera un reporte de diagnóstico
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Iniciando pruebas de integración con manage-users...\n');

// Verificar variables de entorno
function checkEnvironmentVariables() {
  console.log('📋 Verificando variables de entorno...');
  
  const requiredVars = [
    'REACT_APP_APPWRITE_ENDPOINT',
    'REACT_APP_APPWRITE_PROJECT_ID',
    'REACT_APP_APPWRITE_MANAGE_USERS_FUNCTION_ID',
    'REACT_APP_APPWRITE_DATABASE_ID',
    'REACT_APP_APPWRITE_PRODUCTS_COLLECTION_ID'
  ];

  const missingVars = [];
  const configuredVars = [];

  requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      configuredVars.push(varName);
      console.log(`✅ ${varName}: ${value.substring(0, 20)}...`);
    } else {
      missingVars.push(varName);
      console.log(`❌ ${varName}: NO CONFIGURADO`);
    }
  });

  console.log(`\n📊 Resumen: ${configuredVars.length}/${requiredVars.length} variables configuradas\n`);

  if (missingVars.length > 0) {
    console.log('⚠️  Variables faltantes detectadas:');
    missingVars.forEach(varName => {
      console.log(`   - ${varName}`);
    });
    console.log('\n💡 Crea un archivo .env con estas variables:\n');
    missingVars.forEach(varName => {
      console.log(`${varName}=tu_valor_aqui`);
    });
    console.log('');
  }

  return { missingVars, configuredVars };
}

// Ejecutar tests de integración
function runIntegrationTests() {
  console.log('🧪 Ejecutando tests de integración...\n');

  try {
    // Ejecutar tests de conectividad
    console.log('1️⃣ Ejecutando tests de conectividad...');
    execSync('npm test -- --testPathPattern=appwriteConnectivity.test.ts --verbose', { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    console.log('✅ Tests de conectividad completados\n');

    // Ejecutar tests de diagnóstico
    console.log('2️⃣ Ejecutando tests de diagnóstico...');
    execSync('npm test -- --testPathPattern=diagnostic.test.ts --verbose', { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    console.log('✅ Tests de diagnóstico completados\n');

    // Ejecutar tests de integración
    console.log('3️⃣ Ejecutando tests de integración...');
    execSync('npm test -- --testPathPattern=integration.test.ts --verbose', { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    console.log('✅ Tests de integración completados\n');

  } catch (error) {
    console.error('❌ Error ejecutando tests:', error.message);
    return false;
  }

  return true;
}

// Generar reporte de diagnóstico
function generateDiagnosticReport(envCheck, testResults) {
  const report = {
    timestamp: new Date().toISOString(),
    environment: {
      configured: envCheck.configuredVars,
      missing: envCheck.missingVars,
      total: envCheck.configuredVars.length + envCheck.missingVars.length
    },
    tests: {
      passed: testResults,
      status: testResults ? 'PASSED' : 'FAILED'
    },
    recommendations: []
  };

  // Agregar recomendaciones basadas en los resultados
  if (envCheck.missingVars.length > 0) {
    report.recommendations.push({
      type: 'configuration',
      priority: 'high',
      message: 'Configurar variables de entorno faltantes',
      details: envCheck.missingVars
    });
  }

  if (!testResults) {
    report.recommendations.push({
      type: 'connectivity',
      priority: 'high',
      message: 'Verificar conectividad con Appwrite y función manage-users',
      details: [
        'Verificar que la función esté desplegada en Appwrite',
        'Verificar permisos de la API key',
        'Verificar configuración de red'
      ]
    });
  }

  // Guardar reporte
  const reportPath = path.join(process.cwd(), 'integration-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log('📄 Reporte de diagnóstico generado:', reportPath);
  return report;
}

// Función principal
function main() {
  console.log('🚀 Iniciando diagnóstico de integración manage-users\n');
  
  // 1. Verificar variables de entorno
  const envCheck = checkEnvironmentVariables();
  
  // 2. Ejecutar tests si las variables críticas están configuradas
  let testResults = false;
  const criticalVars = ['REACT_APP_APPWRITE_ENDPOINT', 'REACT_APP_APPWRITE_PROJECT_ID'];
  const hasCriticalVars = criticalVars.every(varName => process.env[varName]);
  
  if (hasCriticalVars) {
    testResults = runIntegrationTests();
  } else {
    console.log('⚠️  Saltando tests - variables críticas no configuradas\n');
  }
  
  // 3. Generar reporte
  const report = generateDiagnosticReport(envCheck, testResults);
  
  // 4. Mostrar resumen
  console.log('📊 RESUMEN DEL DIAGNÓSTICO');
  console.log('========================');
  console.log(`Variables configuradas: ${envCheck.configuredVars.length}/${envCheck.configuredVars.length + envCheck.missingVars.length}`);
  console.log(`Tests: ${testResults ? '✅ PASARON' : '❌ FALLARON'}`);
  console.log(`Recomendaciones: ${report.recommendations.length}`);
  
  if (report.recommendations.length > 0) {
    console.log('\n💡 RECOMENDACIONES:');
    report.recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. [${rec.priority.toUpperCase()}] ${rec.message}`);
      if (rec.details) {
        rec.details.forEach(detail => console.log(`   - ${detail}`));
      }
    });
  }
  
  console.log('\n🎯 Próximos pasos:');
  if (envCheck.missingVars.length > 0) {
    console.log('1. Configurar variables de entorno faltantes');
  }
  if (!testResults && hasCriticalVars) {
    console.log('2. Verificar configuración de Appwrite y función manage-users');
  }
  if (envCheck.missingVars.length === 0 && testResults) {
    console.log('1. ✅ Integración funcionando correctamente');
    console.log('2. 🚀 Puedes ejecutar la aplicación');
  }
  
  console.log('\n✨ Diagnóstico completado');
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = { main, checkEnvironmentVariables, runIntegrationTests, generateDiagnosticReport };
