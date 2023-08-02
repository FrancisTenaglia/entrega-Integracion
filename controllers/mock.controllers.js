import { Faker, en } from "@faker-js/faker";

const faker = new Faker({locale:[en]})

export const generateMockProducts = async(req, res) => {
    const products= []

    for(let i=0; i<100; i++){
        products.push(generateProducts())
    }
    return res.status(200).send({status:"OK", data: products})
}

const generateProducts =()=>{
    return{
        id:faker.database.mongodbObjectId(),
        title:faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        price: faker.commerce.price(),
        image: faker.image.urlLoremFlickr(),
        stock: faker.number.int(100),
        status: faker.datatype.boolean(0.5),
        category: faker.commerce.department()
    }
}