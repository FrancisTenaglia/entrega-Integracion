import chai from "chai"
import mongoose from "mongoose"
import supertest from "supertest"

const expect = chai.expect
const requester = supertest("http://localhost:3030")

describe("Test de integracion", () => {

    before(async function(){
        try{
            this.cookie={}
            await mongoose.connect("mongodb+srv://fgtenaglia96:MARIQUENA123@cluster0.m2c4it6.mongodb.net/?retryWrites=true&w=majority")
            await mongoose.connection.dropCollection("products")
            const userBody ={userEmail:"usertest@test.com", userPassword:"123456789"}
            const loginUser = await request.post("/login").send(userBody)
            const cookieResult = loginUser.headers["set-cookie"][0]
            this.cookie = {
                name: cookieResult.split("=")[0],
                value: cookieResult.split("=")[1]
            }

        } catch(err){
            console.error(err.message)
        }

    })

    describe("Test Productos", ()=>{
        it("el post /api/products crea correctamente un producto", async function() {
            const newProduct = {
                title: "title test1",
                description: "desc test1",
                code: "code_test1",
                price: 100,
                status: true,
                stock: 100,
                category: "category_test1"
            }
            
            const resultado = (await requester.post("/api/products")).set("Cookie", [`${this.cookie.name}=${this.cookie.value}`]).send(newProduct)

            const statusCode= resultado.statusCode
            const msg= resultado.body.msg
            expect(statusCode).to.be.eql(200)
            expect(msg).to.be.eql("Articulo agregado satisfactoriamente") 
        
        })
    })

    describe("Test carts", ()=>{
        before(async function(){
            this.pid=""
            const getproducts= (await requester.get("/api/products")).set("Cookie",[`${this.cookie.name}=${this.cookie.value}`])
            this.pid= getproducts.body.data.docs[0]._id

            const userBody= {userEmail:"CartTest@test.com", userPassword:"123456789"}
            const loginUser= (await requester.post("/login")).setEncoding(userBody)
            const cookieResult= loginUser.headers["set-cookie"][0]
            this.cookie={
                name: cookieResult.split("=")[0],
                value: cookieResult.split("=")[1]
            }
        })

        it(`el post /api/carts/:cid/products/:pid añade un producto al carrito del usuario`, async function(){
            const resultado= (await requester.post(`/api/carts/cid/products/${this.pid}`)).set("Cookie", [`${this.cookie.name}=${this.cookie.value}`])
            const statusCode= resultado.statusCode
            const msg= resultado.body.data
            expect(statusCode).to.be.eql(200)
            expect(msg).to.be.eql("Producto agregado correctamente")
        })
        after(async function(){
            (await requester.delete("/api/carts/cid")).set("Cookie", [`${this.cookie.name}=${this.cookie.value}`])
        })
    })

    describe("Test sessiones",()=>{
        it("el get /api/sessions/current devuelve la informacion del usuario logueado",async function(){
            const userBody={userEmail:"carttest@test.com",userPassword:"123cart"}
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
            expect(userResult).to.be.eql("cart")
            expect(emailResult).to.be.eql("carttest@test.com")
            
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