import multer from "multer"
import { randomUUID } from "node:crypto"
import {  unlink,writeFile ,mkdir, readFile} from "node:fs/promises";
import { fileTypeFromBuffer } from "file-type";
import { resolve } from "node:path";
import { BadRequestException } from "../../expiation";
import { Request } from "express";
import { StorageApproachEnum } from "../../enum";
import {tmpdir}from "node:os"
import { IFile } from "../../types";
export const fileValidation = {
    image: [
        "image/jpeg",
        "image/png",
        "image/gif"
    ],
    files: [
        "application/pdf",
        "application/json"
    ]
}

export const localFileUpload = ({ maxFileSize = 5,storageApproach=StorageApproachEnum.MEMORY  } : {maxFileSize?:number,storageApproach?:StorageApproachEnum}) => {
    // const storage = multer.diskStorage({
    //     destination: function (req, file, cb) {
    //         cb(null, "./assets")
    //     },
    //     filename: function (req, file, cb) {
    //         cb(null, randomUUID() + file.originalname)
    //     }
    // })

    // function fileFilter(req, file, cb) {
    //     if (validation.includes(file.mimetype)) {
    //         //مفيش خطا وابعته
    //         cb(null, true)
    //     } else {

    //         //فيه خطا ومتبعبهوش
    //         cb(new Error("invalid format", { cause: { status: 400 } }), false)
    //     }
    // }

   const storage=storageApproach==StorageApproachEnum.MEMORY ? 
   multer.memoryStorage():
   multer.diskStorage({    
    destination(req, file, callback) {
         console.log("Disk Storage:", tmpdir());
        callback(null,tmpdir())
    },
    filename(req, file, callback) {
        callback(null, randomUUID()+file.originalname)
    },
   })

    return multer({  storage, limits: { fileSize: maxFileSize * 1024 * 1024 } })
}

export async function processFile({ customPath="general",file,validation }:{customPath:string,file:IFile,validation:string[]}) {
    if(file.path){
        file.buffer=await readFile(file.path)
    }
        const result = await fileTypeFromBuffer(file.buffer)
        if (!result || !validation.includes(result.mime)) {
            await unlink(file.path)
           throw new BadRequestException("invalid file format")
        }else{
            //cloud اشغل دول لكن دلوفتى شغال  local لو 
            // await mkdir(resolve(`assets/${customPath}`),{recursive:true})
            // const uniqueFilePath=`assets/${customPath}/${randomUUID()}.${result.ext}`
            // await writeFile(resolve(`./${uniqueFilePath}`),file.buffer)

            if (file.path){
                 await unlink(file.path)

            }
            // file.path=uniqueFilePath
            return file
        }
    }
export async function processFiles({ customPath="general",files,validation  }:{ customPath:string,files:IFile[],validation :string[] }) {
    const assets =[]
try {
        for (const file of files) {
           const uploadFile= await processFile({customPath,file,validation})
            assets.push(uploadFile)
        }
        return assets

} catch (error) {
     for (const file of assets) {
    await unlink(resolve(`./${file.path}`))
}
throw new BadRequestException("invalid file format 1")
}
    }
export async function processFields({customPath="general", fields,validation  }:{ customPath:string,fields:Record<string,IFile[]>,validation :string[] }) {
    const assets =[]

try {
                for (const field of Object.keys(fields)) {
           const file= await processFiles({customPath,files:fields[field] as IFile[],validation})
            assets.push({field,file})
        }
        return assets

} catch (error) {
        for (const asset of assets) {
            for (const file of asset.file) {
                if (file.path) {
                    await unlink(resolve(file.path)).catch(() => {})
                }
            }
        }

        throw error
    }
    }

export async function processMulterUpload({customPath="general", validation  ,req}:{customPath:string, validation: string[] ,req:Request}) {
   
        if (req.file){
            await processFile({customPath,file:req.file,validation})

        }else if(Array.isArray(req.files)){
            await processFiles({customPath,files:req.files,validation})

        }else if (typeof req.files =="object"&& Object.keys(req.files )?.length){
            await processFields({customPath,fields:req.files as Record<string,IFile[]>,validation})

        }
        
    
}

























//diskStorageلمو هشتغل 
// export function processFile({ validation = [] }) {
//     return async (req, res, next) => {
//         const filePath = resolve(`./${req.file.path}`)
//         const filebuffer = await readFile(filePath)
//         const result = await fileTypeFromBuffer(filebuffer)
       
        
//         if (!result || !validation.includes(result.mime)) {
//             await unlink(filePath)
//             next(new Error("invalid file format", { cause: { status: 400 } }))
//         }else{

//             next()
//         }
//     }
// }