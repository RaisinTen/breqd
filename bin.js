#!/usr/bin/env node --no-warnings

// Disabling ugly ExperimentalWarning and DeprecationWarning warnings.
// Refs: https://stackoverflow.com/a/75536458

const {
  getModuleDurations,
  sortModuleDurations,
  convertModuleDurationstoTEF,
} = require('.');

const moduleDurations = getModuleDurations();
const sortedModuleDurations = sortModuleDurations(moduleDurations);

console.log(sortedModuleDurations);

const TEF = convertModuleDurationstoTEF(sortedModuleDurations);

const { writeFileSync } = require('fs');
const { platform } = require('os');

// This file can be opened on https://ui.perfetto.dev for visualization.
const file = `breqd-node-${process.version}-${platform()}-${process.arch}.json`;

writeFileSync(file, JSON.stringify(TEF));

console.log(`File generated by breqd: ${file}`);
console.log('Open it on https://ui.perfetto.dev!');