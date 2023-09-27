import UsersDTO from '../dao/DTOs/users.dto.js';

class UsersRepository {
  constructor(dao) {
    this.dao = dao;
  }

  addUser = async ({ firstName, lastName, age, email, password }) => {
    return await this.dao.addUser({ firstName, lastName, age, email, password });
  };

  addCartId = async (email, cartId) => {
    return await this.dao.addCartId(email, cartId);
  };

  getUserByEmail = async (email) => {
    const user = await this.dao.getUserByEmail(email);
    return new UsersDTO(user);
  };

  getUserById = async (id) => {
    return await this.dao.getUserById(id); // Solo para uso interno, no pasa por el DTO
  };

  getUserByCart = async (cartId) => {
    const user = await this.dao.getUserByCart(cartId);
    return new UsersDTO(user);
  };

  updateDocuments = async (userEmail, files) => {
    let array = []

    for (const property in files) {
        const obj = {}
        obj.name = files[property][0].fieldname
        obj.reference = files[property][0].path
        array.push(obj)
    }

    const updateDocs = await userModel.updateOne({ "userEmail": email }, { documents: array })
    return (updateDocs);
  };
}

export default UsersRepository;
