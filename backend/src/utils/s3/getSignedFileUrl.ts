import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {  allowedFileTypes, S3client, type AllowedFileExtension } from "./config";


interface getSignedUrlProps{
    fileName:string;
    expiresIn:number;
}

export const getSignedDFileUrl = async({fileName,expiresIn}:getSignedUrlProps)=>{
    const extension = fileName.split('.').pop()?.toLowerCase()
    if (!extension || !(extension in allowedFileTypes)) {
        throw new Error("File Type not supported")
      }
    try {
        const command = new PutObjectCommand({
            Bucket:process.env.AWS_BUCKET,
            Key:fileName,
            ContentType:allowedFileTypes[extension as AllowedFileExtension],
    
        })
        return await getSignedUrl(S3client,command,{expiresIn})
    } catch (error) {
        throw new Error("Failed to generate URL")
    }

}