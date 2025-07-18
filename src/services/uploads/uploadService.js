const fs = require('fs');

class UploadService {
  constructor(folder) {
    this._folder = folder;

    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
  }

  addCover(file, meta) {
    const fileName = +new Date() + meta.filename;
    const path = `${this._folder}/${fileName}`;
    const fileStream = fs.createWriteStream(path);

    return new Promise((resolve, reject) => {
      fileStream.on('error', (error) => reject(error));
      file.pipe(fileStream);
      file.on('end', () => resolve(fileName));
    });
  }
}

module.exports = UploadService;