import { S3Client } from "@aws-sdk/client-s3";

if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
  throw new Error("AWS credentials are missing");
}

export const allowedFileTypes = {
  'jpg': 'image/jpeg',
  'jpeg': 'image/jpeg',
  'png': 'image/png',
  'gif': 'image/gif',
  'webp': 'image/webp',
  'svg': 'image/svg+xml',
  'heic': 'image/heic',
  'heif': 'image/heif'
} as const;


const config = {
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  region: "ap-south-1",
};

export const S3client = new S3Client(config);
export type AllowedFileExtension = keyof typeof allowedFileTypes;