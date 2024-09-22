const moduleName = process.argv[2];

const beforeRequire = process.hrtime.bigint();
require(moduleName);
const afterRequire = process.hrtime.bigint();

const duration = Number(afterRequire - beforeRequire);
console.error(duration);
