import { productModel } from '../models/products.model.js';

export default class ProductManagerDB {
    constructor() {
        this.status = 0;
        this.statusMsg = "inicializado";
    }

    checkStatus = () => {
        return this.status;
    }

    showStatusMsg = () => {
        return this.statusMsg;
    }

    addProduct = async (product) => {
        try {
            await productModel.create(product);
            this.status = 1;
            this.statusMsg = "El producto fue registrado correctamente";
        } catch (err) {
            this.status = -1;
            this.statusMsg = `Ocurrio un error al intentar agregar el producto: ${err}`;
        }
    }

    getProducts = async (query, limit = 10, page = 1, sort) => {
        try {
            if (query) { query = JSON.parse(query) };

            const products = await productModel.paginate(query, {
                limit: limit,
                page: page,
                sort: { price: sort },
                lean: true,
            });
            
            if (products.hasPrevPage) {
                products.prevLink = `http://localhost:8080/api/products/?${query ? 'query=' + query + "&" : ""
                    }${'limit=' + limit}${'&page=' + (+page - 1)}${sort ? '&sort=' + sort : ''}`;
            } else {
                products.prevLink = null;
            };

            if (products.hasNextPage) {
                products.nextLink = `http://localhost:8080/api/products/?${query ? 'query=' + query + "&" : ""
                    }${'limit=' + limit}${'&page=' + (+page + 1)}${sort ? '&sort=' + sort : ''}`;
            }
            else {
                products.nextLink = null
            };

            return {
                status: 'success',
                payload: products.docs,
                totalPages: products.totalDocs,
                prevPage: products.prevPage,
                nextPage: products.nextPage,
                page: products.page,
                hasPrevPage: products.hasPrevPage,
                hasNextPage: products.hasNextPage,
                prevLink: products.prevLink,
                nextLink: products.nextLink,
            };
        } catch (err) {
            return {
                status: 'error',
                message: `Ocurrio un error al intentar obtener los productos: ${err}`,
            }
        }
    }

    getProductById = async (id) => {
        try {
            return await productModel.findById(id);
        } catch (err) {
            return {
                message: `Ocurrio un error al intentar obtener el producto con ID [${id}]: ${err}`,
            }
        }
    }

    updateProduct = async (id, data) => {
        try {
            if (data === undefined || Object.keys(data).length === 0) {
                this.status = -1;
                this.statusMsg = "Se requieren datos para poder actualizar un producto";
            } else {
                const productUpdated = await productModel.findByIdAndUpdate(id, data, {
                    new: true,
                });
                this.status = 1;
                productUpdated.modifiedCount === 0
                    ? this.statusMsg = `El producto con ID [${id}] no existe o no hay cambios por realizar`
                    : this.statusMsg = `El producto con id [${id}] fue actualizado`;
            }
        } catch (err) {
            this.status = -1;
            this.statusMsg = `Ocurrio un error al intentar actualizar el producto con id [${id}]: ${err}`;
        }
    }

    deleteProduct = async (id) => {
        try {
            const process = await productModel.findByIdAndDelete(id);
            this.status = 1;
            process.deletedCount === 0
                ? this.statusMsg = `El producto con ID [${id}] no existe`
                : this.statusMsg = `El producto con ID [${id}] fue eliminado correctamente`;
        } catch (err) {
            this.status = -1;
            this.statusMsg = `Ocurrio un error al intentar eliminar el producto con ID [${id}]: ${err}`;
        }
    }
}
