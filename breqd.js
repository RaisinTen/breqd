function getBuiltinModulesList(Module) {
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

function getModuleDurations() {
  const moduleDurations = {};

  // Measuring the duration of requiring the 'node:module' module.
  const beforeRequiringModule = process.hrtime.bigint(); // Time is in nanoseconds.
  const Module = require('module');
  const afterRequiringModule = process.hrtime.bigint();
  // Converting the durations to Number because these aren't that big.
  moduleDurations['module'] = Number(afterRequiringModule - beforeRequiringModule);

  // Getting a list of all the builtin modules.
  const builtinModules = getBuiltinModulesList(Module);

  // Measuring the duration of requiring the builtin modules.
  for (const builtinModule of builtinModules) {
    // This has already been measured.
    if (builtinModules === 'module') continue;

    const beforeRequiring = process.hrtime.bigint();
    require(builtinModule);
    const afterRequiring = process.hrtime.bigint();
    moduleDurations[builtinModule] = Number(afterRequiring - beforeRequiring);
  }

  return moduleDurations;
}

function sortModuleDurations(moduleDurations) {
  // Converting the moduleDurations into a list.
  const sortedModuleDurations = [];
  for (const module of Object.keys(moduleDurations)) {
    if (typeof module !== 'string') {
      throw new TypeError(`The key, ${module}, must be a string`);
    }

    const duration = moduleDurations[module];
    if (typeof duration !== 'number') {
      throw new TypeError(`The value, ${duration}, must be a number`);
    }

    sortedModuleDurations.push({ module, duration });
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

    const { module, duration } = moduleDuration;
    if (typeof module !== 'string') {
      throw new TypeError(`moduleDurations[${i}].module must be a string`);
    }

    if (typeof duration !== 'number') {
      throw new TypeError(`moduleDurations[${i}].duration must be a number`);
    }

    TEF.push({
      name: module,
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
