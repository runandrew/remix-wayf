const Module = require("module");
const path = require("path");

const typescript5Root = path.join(__dirname, "node_modules", "typescript");
const resolveFilename = Module._resolveFilename;

function resolveTypescript5ForEslint(request, parent, isMain, options) {
  if (request === "typescript" || request.startsWith("typescript/")) {
    const target =
      request === "typescript"
        ? typescript5Root
        : path.join(typescript5Root, request.slice("typescript/".length));
    return resolveFilename.call(this, target, parent, isMain, options);
  }
  return resolveFilename.call(this, request, parent, isMain, options);
}

Module._resolveFilename = resolveTypescript5ForEslint;
