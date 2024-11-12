import {z} from 'zod'

export const createTaskSchema = z.object({
    title:z.string().optional(),
    transactionSignature:z.string(),
    options:z.array(z.object({
        imageUrl:z.string()
    }))
})
export const createSubmissionSchema = z.object({
    taskId:z.number(),
    optionId:z.number()
})