const fs = require('fs');
const path = require('path');

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
  if (file.endsWith('.js') || file.endsWith('.jsx')) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace .tsx and .ts in imports
    content = content.replace(/(import\s+.*?from\s+['"].*?)\.tsx(['"])/g, '$1.jsx$2');
    content = content.replace(/(import\s+.*?from\s+['"].*?)\.ts(['"])/g, '$1.js$2');
    
    fs.writeFileSync(file, content, 'utf8');
  }
});
console.log("Updated extensions in imports");
