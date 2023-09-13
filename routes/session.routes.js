import { Router } from "express";
import {currentController} from "../controllers/sessions.controllers.js"

const sessionRoutes=()=>{
    const router=Router()

    router.get("/current",currentController)

    return router
}

export default sessionRoutes;