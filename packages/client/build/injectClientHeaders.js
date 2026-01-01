#!/usr/bin/env node

const fs = require("fs");
const packageJson = require("../package.json");

const files = ["dist/index.js", "dist/index.mjs"];
const USE_CLIENT = "'use client';";
const BANNER = `/* Peam ${packageJson.version} | https://peam.ai */`;

function processFile(filePath) {
  if (!fs.existsSync(filePath)) return;

  let content = fs.readFileSync(filePath, "utf8");

  let shebang = "";
  if (content.startsWith("#!")) {
    const end = content.indexOf("\n") + 1;
    shebang = content.slice(0, end);
    content = content.slice(end);
  }

  content = content.trimStart();

  if (!content.startsWith(USE_CLIENT)) {
    content = `${USE_CLIENT}\n${content}`;
  }

  if (!content.startsWith(`${USE_CLIENT}\n${BANNER}`)) {
    content = content.replace(
      USE_CLIENT,
      `${USE_CLIENT}\n${BANNER}`
    );
  }

  fs.writeFileSync(
    filePath,
    shebang + content + "\n",
    "utf8"
  );
}

files.forEach(processFile);
