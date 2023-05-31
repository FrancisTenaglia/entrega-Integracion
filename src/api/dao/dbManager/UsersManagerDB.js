import crypto from 'crypto';
import mongoose from 'mongoose';
import userModel from '../models/users.model.js';

export default class Users {
    constructor() {
        this.users = [];
        this.status = 0;
        this.statusMsg = "inicializado";
    }

    static requiredFields = ['firstName', 'lastName', 'userName', 'password'];

    static #verifyRequiredFields = (obj) => {
        return Users.requiredFields.every(field => Object.prototype.hasOwnProperty.call(obj, field) && obj[field] !== null);
    }

    static #generarSha256 = (pass) => {
        return crypto.createHash('sha256').update(pass).digest('hex');
    }

    static #objEmpty (obj) {
        return Object.keys(obj).length === 0;
    }

    checkStatus = () => {
        return this.status;
    }

    showStatusMsg = () => {
        return this.statusMsg;
    }

    addUser = async (user) => {
        try {
            if (!Users.#objEmpty(user) && Users.#verifyRequiredFields(user)) {
                user.password = Users.#generarSha256(user.password);
                const process = await userModel.create(user);
                this.status = 1;
                this.statusMsg = "Usuario registrado en bbdd";
            } else {
                this.status = -1;
                this.statusMsg = `Faltan campos obligatorios (${Users.requiredFields.join(', ')})`;
            }
        } catch (err) {
            this.status = -1;
            this.statusMsg = `AddUser: ${err}`;
        }
    }

    getUsers = async () => {
        try {
            const users = await userModel.find();
            
            this.status = 1;
            this.statusMsg = 'Usuarios recuperados';
            return users;
        } catch (err) {
            this.status = -1;
            this.statusMsg = `getUsers: ${err}`;
        }
    }

    getUserById = async (id) => {
        try {
            this.status = 1;
            const user = userModel.findById(id);
            return user;
        } catch (err) {
            this.status = -1;
            this.statusMsg = `getUserById: ${err}`;
        }
    }

    updateUser = async (id, data) => {
        try {
            if (data === undefined || Object.keys(data).length === 0) {
                this.status = -1;
                this.statusMsg = "Se requiere body con data";
            } else {
                const process = await userModel.updateOne({ '_id': new mongoose.Types.ObjectId(id) }, data);
                this.status = 1;
                process.modifiedCount === 0 ? this.statusMsg = "El ID no existe o no hay cambios por realizar": this.statusMsg = "Usuario actualizado";
            }
        } catch (err) {
            this.status = -1;
            this.statusMsg = `updateUser: ${err}`;
        }
    }

    deleteUser = async (id) => {
        try {
            const process = await userModel.deleteOne({ '_id': new mongoose.Types.ObjectId(id) });
            this.status = 1;
            process.deletedCount === 0 ? this.statusMsg = "El ID no existe": this.statusMsg = "Usuario borrado";
        } catch (err) {
            this.status = -1;
            this.statusMsg = `deleteUser: ${err}`;
        }
    }

    validateUser = async (user, pass) => {
        try {
            return await userModel.findOne({ userName: user, password: crypto.createHash('sha256').update(pass).digest('hex')});
        } catch (err) {
            this.status = `validateUser: ${err}`;
        }
    }
}
