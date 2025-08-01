import multer from 'multer';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import s3Client from '../config/s3.js';
import { v4 as uuidv4 } from 'uuid';

// In-memory storage for multer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const uploadToS3 = (fieldName) => (req, res, next) => {
  upload.single(fieldName)(req, res, async (err) => {
    if (err) {
      return next(err);
    }
    if (!req.file) {
      // No file uploaded, proceed to next middleware
      return next();
    }

    const file = req.file;
    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    const fileName = `tickets/${uuidv4()}.jpeg`;

    // 파일 타입 검증
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      const error = new Error(
        `지원하지 않는 파일 형식입니다. 지원 형식: ${allowedMimeTypes.join(', ')}`,
      );
      error.status = 400;

      return next(error);
    }

    try {
      // Resize and convert image to JPEG using sharp
      const resizedImageBuffer = await sharp(file.buffer)
        .resize({ width: 800, fit: 'inside' }) // Resize to max width of 800px
        .toFormat('jpeg')
        .jpeg({ quality: 80 }) // Compress JPEG
        .toBuffer();

      const params = {
        Bucket: bucketName,
        Key: fileName,
        Body: resizedImageBuffer,
        ContentType: 'image/jpeg',
      };

      const command = new PutObjectCommand(params);
      await s3Client.send(command);

      // Attach file location to request object
      req.file.location = `https://s3.${process.env.AWS_S3_REGION}.amazonaws.com/${bucketName}/${fileName}`;

      next();
    } catch (error) {
      console.error('Error uploading to S3:', error);
      next(error);
    }
  });
};

export default uploadToS3;
