const fs = require('fs');
const path = require('path');
const babel = require('@babel/core');

const walkSync = function(dir, filelist) {
  const files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function(file) {
    if (fs.statSync(path.join(dir, file)).isDirectory()) {
      filelist = walkSync(path.join(dir, file), filelist);
    }
    else {
      filelist.push(path.join(dir, file));
    }
  });
  return filelist;
};

const srcDir = path.join(__dirname, 'src');
const files = walkSync(srcDir);

files.forEach(file => {
  if (file.endsWith('.ts') || file.endsWith('.tsx')) {
    const isTsx = file.endsWith('.tsx');
    const newExt = isTsx ? '.jsx' : '.js';
    const newFile = file.substring(0, file.lastIndexOf('.')) + newExt;

    try {
      const result = babel.transformFileSync(file, {
        presets: [
          ["@babel/preset-typescript", { isTSX: true, allExtensions: true }]
        ],
        filename: file,
        retainLines: true,
      });

      if (result && result.code != null) {
        fs.writeFileSync(newFile, result.code);
        fs.unlinkSync(file);
        console.log(`Converted ${path.basename(file)} to ${path.basename(newFile)}`);
      }
    } catch (err) {
      console.error(`Failed to compile ${file}:`, err);
    }
  }
});
