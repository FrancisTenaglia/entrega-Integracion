class CartsRepository {
    constructor(dao) {
      this.dao = dao;
    }
  
    createCart = async () => {
      console.log('ACA TMB')
      return await this.dao.createCart();
    };
  
    getCartById = async (id) => {
      return await this.dao.getCartById(id);
    };
  
    addProductToCart = async (id, pid) => {
      console.log('ID : ',id, 'PID: ', pid)
      return await this.dao.addProductToCart(id, pid);
    };
  
    deleteProductFromCart = async (id, pid) => {
      return await this.dao.deleteProductFromCart(id, pid);
    };
  
    updateCart = async (id, { products }) => {
      return await this.dao.updateCart(id, { products });
    };
  
    updateProductQuantityFromCart = async (id, pid, { quantity }) => {
      return await this.dao.updateProductQuantityFromCart(id, pid, { quantity });
    };
  
    deleteAllProductsFromCart = async (id) => {
      return await this.dao.deleteAllProductsFromCart(id);
    };
  }
  
  export default CartsRepository;
  