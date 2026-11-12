//هذه طريقه ثانيه ==>req:Request وهكذا
// import express, {type Request,Response,NextFunction} from "express" 
import express from "express"
import { authenticationController, commentController, postController, userController } from "./module"
import { globalErrorHandling } from "./middleware"
import { PORT } from "./config"
import { bootstrapDB } from "./db/connection"
const app = express()
bootstrapDB(app, PORT)
app.use(express.json())
app.use("/assets", express.static("./assets"))

app.all("/", async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<express.Response> => {
  return res.status(200).json({ message: "hello world" })
})
app.use("/auth", authenticationController)
app.use("/user", userController)
app.use("/post", postController)
app.use("/comment", commentController)
app.use(globalErrorHandling)
