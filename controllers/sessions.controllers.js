import mongoose from "mongoose";
import userModel from "../models/users.model.js"

export const currentController=async(req,res)=>{
    try {
        
        let session = req.session
        const currentUser = await userModel.findById(new mongoose.Types.ObjectId(session.passport.user))
        const user= {
            userName: currentUser.first_name,
            userEmail: currentUser.email,
            userRol: currentUser.role
        }
        
        res.status(200).send({ status: "OK", data: user })
    } catch (e) {
        console.log(e.message)
    }
}