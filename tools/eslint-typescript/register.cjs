const Module = require("module");
const path = require("path");

const typescriptRoot = path.join(__dirname, "node_modules", "typescript");

const resolveFilename = Module._resolveFilename;
Module._resolveFilename = function (request, parent, isMain, options) {
  if (request === "typescript" || request.startsWith("typescript/")) {
    const target =
      request === "typescript"
        ? typescriptRoot
        : path.join(typescriptRoot, request.slice("typescript/".length));
    return resolveFilename.call(this, target, parent, isMain, options);
  }
  return resolveFilename.call(this, request, parent, isMain, options);
};
