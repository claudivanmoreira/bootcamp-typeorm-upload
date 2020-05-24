import crypto from 'crypto';
import multer from 'multer';
import path from 'path';

const csvFolder = path.resolve(__dirname, '..', '..', 'tmp');

export default {
  csvFolder,
  storage: multer.diskStorage({
    destination: csvFolder,
    filename(request, file, callback) {
      const fileHash = crypto.randomBytes(10).toString('HEX');
      const fileName = `${fileHash}-${file.originalname}`;
      return callback(null, fileName);
    },
  }),
};
