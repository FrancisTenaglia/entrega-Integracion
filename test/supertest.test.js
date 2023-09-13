import chai from "chai"
import mongoose from "mongoose"
import supertest from "supertest"

const expect = chai.expect
const requester = supertest("http://localhost:3030")

describe("Test de integracion", () => {

    before(async function(){
        try{
            this.cookie={}
            await mongoose.connect("mongodb+srv://fgtenaglia96:MARIQUENA123@cluster0.m2c4it6.mongodb.net/?retryWrites=true&w=majority ")
            await mongoose.connection.dropCollection("products")

        } catch(err){
            console.error('error de before', err.message)
        }

    })

    describe("Test Productos", ()=>{
        it("el post /api/products crea correctamente un producto", async function() {
            const newProduct = {
                title: "NEW PRODUCT TEST",
                description: "product description",
                code: "code_product-test",
                price: 100,
                status: true,
                stock: 100,
                category: "category_test"
            }
            
            const resultado=await requester.post("/api/products").send(newProduct)

            const statusCode= resultado.statusCode
            const msg= resultado.body.message
            expect(statusCode).to.be.eql(200)
            expect(msg).to.be.eql(`Product ${newProduct.title} - ${newProduct.code} added successfully`) 
        
        })
    })

    describe("Test carts", ()=>{
        it(`el post /api/carts/:cid/products/:pid añade un producto al carrito del usuario`,async function(){
            
            const { res }= await requester.get("/api/products")
            const products = JSON.parse(res.text).payload;
            console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>> ', products[0]._id)
            const { res: resCart } = await requester.post('/api/carts')
            const cartId = JSON.parse(resCart.text).cartId
            console.log('SECREO: ', cartId)
            const resultado = await requester.post(`/api/carts/${cartId}/products/${products[0]._id}`)
            const statusCode=resultado.statusCode
            expect(statusCode).to.be.eql(200)
        })
        // after(async function(){
        //     await requester.delete("/api/carts/64e3a177434f2f78b4a66016").set("Cookie",[`${this.cookie.name}=${this.cookie.value}`])
        // })
    })

    describe("Test sessiones",()=>{
        it("el get /api/sessions/current devuelve la informacion del usuario logueado",async function(){
            const userBody={login_email:"CartTest@test.com",login_password:"123456789"}
            const loginUser=await requester.post("/login").send(userBody)
            const cookieResult=loginUser.headers["set-cookie"][0]
            this.cookie={
                name:cookieResult.split("=")[0],
                value:cookieResult.split("=")[1]
            }
            const resultado=await requester.get("/api/sessions/current").set("Cookie",[`${this.cookie.name}=${this.cookie.value}`])
            const statusCode=resultado.statusCode
            const userResult=resultado.body.data.userName
            const emailResult=resultado.body.data.userEmail
            expect(statusCode).to.be.eql(200)
            expect(userResult).to.be.eql("tester")
            expect(emailResult).to.be.eql("CartTest@test.com")
        })
    })

    after(async function(){
        try{
            await mongoose.disconnect()
        }catch(err){
            console.error(err.message)
        }
    })
})