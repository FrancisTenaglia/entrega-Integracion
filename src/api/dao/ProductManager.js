import fs from 'fs';

class ProductManager {
    static last_id = 0;

    constructor (archivoJson){
        this.path = archivoJson;
        this.products = [];
    };
    
    getProducts = async (cantidad) => {
        try{
            const listaProductos = await fs.promises.readFile(this.path, 'utf-8');
            const listaProductosConv = await JSON.parse(listaProductos);
            return cantidad!==0? listaProductosConv.slice(0, parseInt(cantidad)) : listaProductosConv ;
        } catch(error){
            console.log(`Error obteniendo el producto: ${error}`);
        }
    };

    addProduct = async(objProduct) => {
        ProductManager.last_id = ProductManager.last_id +1;

        const new_product = {
            id: ProductManager.last_id,
            status: true,
            title: objProduct.title,
            description: objProduct.description,
            code: objProduct.code,
            price: objProduct.price,
            stock: objProduct.stock,
            category: objProduct.category,
            thumbnails: objProduct.thumbnails,
        }
        
        this.products.push(new_product);

        try {
            await fs.promises.writeFile(this.path, JSON.stringify(this.products));
            console.log('Se agrego el producto correctamente');
        } catch (error) {
            console.log(`Error al intentar agregar el producto: ${error}`);
        }        
    };


    //Retorna undefined si no encuentra el producto
    getProductsById = async (id)=> {
        try{
            const products = await fs.promises.readFile(this.path, 'utf-8');
            const productsConv = await JSON.parse(products);
            const productBuscado = productsConv.find(product => product.id === parseInt(id));
            return productBuscado;
        } catch(error){
            console.log(`Buscando el producto con id: ${id}, se produjo el siguiente error: ${error}`);
        }
    };

    updateProduct = async(id, campos, nuevosValores) => {
        try{
            const products = await fs.promises.readFile(this.path, 'utf-8');
            const productsConv = await JSON.parse(products);
            const indexBuscado = productsConv.findIndex(product => product.id === parseInt(id));
            let campo = '';
            let nuevoValor = '';
            for(let i=0; i<campos.length; i++) {
                campo=campos[i];
                nuevoValor=nuevosValores[i];
                productsConv[indexBuscado][campo] = nuevoValor; 
            }
            await fs.promises.writeFile(this.path, JSON.stringify(productsConv));
        } catch(error) {
            console.log(`Actualizando el producto con id: ${id}, se produjo el siguiente error: ${error}`);
        }
    };

    deleteProduct = async (id) => {
        try{
            const products = await fs.promises.readFile(this.path, 'utf-8')
            const productsConv = await JSON.parse(products); 
            const nuevoArrayDelete = productsConv.map(product => product.id !== parseInt(id));
            await fs.promises.writeFile(this.path, JSON.stringify(nuevoArrayDelete));
        } catch (error){
            console.log(`Intentado eliminar el producto con id: ${id}, se produjo el siguiente error: ${error}`);
        }
    };
    
};

export default ProductManager;