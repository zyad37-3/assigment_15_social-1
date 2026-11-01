import mongoose from "mongoose"
import { DB_URI } from "../config.js";
// import { Usermodel } from "./model/index.js";
// import { connectRadis } from "./redis.connection.js";
import express from 'express';

export const bootstrapDB = async (app:express.Application, port:number) => {
    try {

        await mongoose.connect(DB_URI)
        // await Usermodel.syncIndexes()
        console.log('successfully your connection ✔✔');
        // await connectRadis()
        app.listen(port, () => { console.log(`Connected as a server 👌 .. ${port}`); })

    } catch (error) {
        console.log(error);

        console.log('failed your connection ❌');

    }
}