const { describe, it } = require('node:test');
const { ok, strictEqual } = require('node:assert');

const {
  getModuleDurations,
  sortModuleDurations,
  convertModuleDurationstoTEF,
} = require('.');

describe('breqs', () => {
  let moduleDurations;
  let sortedModuleDurations;

  it('getModuleDurations', () => {
    moduleDurations = getModuleDurations();
    strictEqual(typeof moduleDurations, 'object',
      'getModuleDurations() must return an object');

    const moduleNames = Object.keys(moduleDurations);
    const expectedModuleNamesLength = 60;
    ok(moduleNames.length > expectedModuleNamesLength,
      `Number of builtin modules, ${moduleNames.length}, ` +
      `must be at least ${expectedModuleNamesLength}`);

    const Module = require('module');
    for (const moduleName of moduleNames) {
      strictEqual(Module.isBuiltin(moduleName), true,
        `'${moduleName}' must be a builtin module`);
      const duration = moduleDurations[moduleName];
      strictEqual(typeof duration, 'number',
        `${moduleDurations[moduleName]} must be a number duration`);
      ok(duration > 0, `The duration, ${duration}, must be positive`);
    };
  });

  it('sortModuleDurations', () => {
    sortedModuleDurations = sortModuleDurations(moduleDurations);
    strictEqual(Array.isArray(sortedModuleDurations), true,
      'sortedModuleDurations() must return an array');

    const expectedLength = Object.keys(moduleDurations).length;
    strictEqual(sortedModuleDurations.length, expectedLength,
      `The length of the array, ${sortedModuleDurations.length}, must match ${expectedLength}`);

    let prevDuration = 0;
    for (let i = sortedModuleDurations.length - 1; i >= 0; --i) {
      const moduleDuration = sortedModuleDurations[i];
      strictEqual(typeof moduleDuration, 'object',
        `sortedModuleDurations[${i}] must be an object`);

      const { moduleName, duration } = moduleDuration;
      strictEqual(typeof moduleName, 'string',
        `'${moduleName}' at index ${i} must be a string`);
      strictEqual(typeof duration, 'number',
        `'${duration}' at index ${i} must be a number`);
      ok(duration >= prevDuration, `The duration, ${duration}, at index ${i}, ` +
        `must be greater than or equal to the next duration, ${prevDuration}`);
      prevDuration = duration;
    }
  });

  it('convertModuleDurationstoTEF', () => {
    const TEF = convertModuleDurationstoTEF(sortedModuleDurations);
    strictEqual(Array.isArray(TEF), true,
      'convertModuleDurationstoTEF() must return an array');

    strictEqual(TEF.length, sortedModuleDurations.length,
      `The length of the array, ${TEF.length}, must match ${sortedModuleDurations.length}`);

    for (let i = 0; i < TEF.length; ++i) {
      const entry = TEF[i];
      strictEqual(typeof entry, 'object',
        `TEF[${i}] must be an object`);

      const {
        name,
        cat,
        ph,
        pid,
        ts,
        dur,
      } = entry;

      strictEqual(typeof name, 'string',
        `The name, '${name}', at index ${i} must be a string`);
      strictEqual(typeof cat, 'string',
        `The cat, '${cat}', at index ${i} must be a string`);
      strictEqual(typeof ph, 'string',
        `The ph, '${ph}', at index ${i} must be a string`);
      strictEqual(typeof pid, 'number',
        `The pid, '${pid}', at index ${i} must be a number`);
      strictEqual(typeof ts, 'number',
        `The ts, '${ts}', at index ${i} must be a number`);
      strictEqual(typeof dur, 'number',
        `The dur, '${dur}', at index ${i} must be a number`);
    }
  });
});
