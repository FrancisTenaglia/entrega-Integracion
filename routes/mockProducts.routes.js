import { Router } from "express";
import { generateMockProducts } from "../controllers/mock.controllers.js";

const mockRoutes= () => {
    const router = Router()

    router.get("/", generateMockProducts)

    return router
}

export default mockRoutes;