const Module = require('module');
const path = require('path');
const { spawnSync } = require('child_process');

function getBuiltinModulesList() {
  // Getting a list of all the builtin modules.
  const builtinModules = [...Module.builtinModules];

  // Pushing prefix-only builtin modules.
  // Refs: https://nodejs.org/api/modules.html#built-in-modules-with-mandatory-node-prefix
  for (const builtinModule of ['node:sea', 'node:test', 'node:test/reporters']) {
    if (Module.isBuiltin(builtinModule)) {
      builtinModules.push(builtinModule);
    }
  }

  return builtinModules;
}

function getModuleDuration(moduleName) {
  const script = path.join(__dirname, 'script.js');

  // Needs to be synchronous, otherwise the results are very flaky.
  const child = spawnSync(
    process.execPath,
    [ '--no-warnings', script, moduleName ]);

  if (child.status !== 0 || child.signal !== null) {
    throw new Error(`child exited with signal: ${child.signal}, code: ${child.status}, stderr: ${child.stderr}`);
  }

  const output = child.stderr.toString().trim().replace(/[^0-9]/g, "");
  if (output.length === 0) {
    throw new Error('no output');
  }

  const duration = Number(output);
  if (!Number.isSafeInteger(duration)) {
    throw new Error(`'${moduleName}' '${output}' got converted into ${duration} which is not a safe integer`);
  }

  return duration;
}

function getModuleDurationAverage(moduleName, cycles = 5) {
  // Calculating the moving average because the duration sums might become too large.
  // Refs: https://math.stackexchange.com/a/4456455
  let averageDuration = 0;
  for (let cycle = 0; cycle < cycles; ++cycle) {
    const duration = getModuleDuration(moduleName);
    averageDuration = averageDuration * (cycle / (cycle + 1)) + duration / (cycle + 1);
  }
  return averageDuration;
}

function getModuleDurations() {
  const moduleDurations = {};

  // Getting a list of all the builtin modules.
  const builtinModules = getBuiltinModulesList();

  // Measuring the duration of requiring the builtin modules.
  for (const builtinModule of builtinModules) {
    moduleDurations[builtinModule] = getModuleDurationAverage(builtinModule);
  }

  return moduleDurations;
}

function sortModuleDurations(moduleDurations) {
  // Converting the moduleDurations into a list.
  const sortedModuleDurations = [];
  for (const moduleName of Object.keys(moduleDurations)) {
    if (typeof moduleName !== 'string') {
      throw new TypeError(`The key, ${moduleName}, must be a string`);
    }

    const duration = moduleDurations[moduleName];
    if (typeof duration !== 'number') {
      throw new TypeError(`The value, ${duration}, must be a number`);
    }

    sortedModuleDurations.push({ moduleName, duration });
  }

  // Sorting the entries by descending order of durations.
  sortedModuleDurations.sort((a, b) => {
    return b.duration - a.duration;
  });

  return sortedModuleDurations;
}

function convertModuleDurationstoTEF(moduleDurations) {
  // Converting the durations into the Trace Event Format, so that these can be
  // visualized on https://ui.perfetto.dev.
  // Refs: https://docs.google.com/document/d/1CvAClvFfyA5R-PhYUmn5OOQtYMH4h6I0nSsKchNAySU/preview#heading=h.yr4qxyxotyw

  if (!Array.isArray(moduleDurations)) {
    throw new TypeError("moduleDurations must be an array");
  }

  if (moduleDurations.length === 0) {
    return [];
  }

  if (typeof moduleDurations[0].duration !== 'number') {
    throw new TypeError("moduleDurations[0].duration must be a number");
  }
  const maxDuration = moduleDurations[0].duration;

  const TEF = [];

  for (let i = 0; i < moduleDurations.length; ++i) {
    const moduleDuration = moduleDurations[i];

    if (typeof moduleDuration !== 'object') {
      throw new TypeError(`moduleDurations[${i}] must be an object`);
    }

    const { moduleName, duration } = moduleDuration;
    if (typeof moduleName !== 'string') {
      throw new TypeError(`moduleDurations[${i}].moduleName must be a string`);
    }

    if (typeof duration !== 'number') {
      throw new TypeError(`moduleDurations[${i}].duration must be a number`);
    }

    TEF.push({
      name: moduleName,
      cat: 'measure',
      ph: 'X',
      pid: 1,
      ts: (maxDuration - duration) / 2000, // Centering the events on https://ui.perfetto.dev.
      dur: duration / 1000,
    });
  }

  return TEF;
}

exports.getModuleDurations = getModuleDurations;
exports.sortModuleDurations = sortModuleDurations;
exports.convertModuleDurationstoTEF = convertModuleDurationstoTEF;
