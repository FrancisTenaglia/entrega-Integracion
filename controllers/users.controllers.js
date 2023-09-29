import { usersService } from "../repositories/_index.js";

export const changeUserRole = async (req, res) => {

    const { uid } = req.params;
    const user = await usersService.getUserById(uid);
    const validEmail = user.email;
    if (!user) { 
        return res.status(404).json({ message: 'User not found' });
    } else {
        if (uid && validEmail) {

            user.role = user.role === 'user' ? 'premium' : 'user';
            await user.save();
            return res.status(200).json({ message: 'User role updated successfully' }); 
        } else {
            return(
                console.log("No se ha subido la documentacion requerida para ejecutar esta operacion")
            )
        }
    }
};

export const getUsers = async (req, res) => {
    try {
      const users = await usersService.getUsers();
      const principalUsers = users.map(user => ({
        name: user.first_name,
        email: user.email,
        rol: user.role,
      }));
     
      return res.status(200).send(principalUsers);

    } catch (err) {
      res.status(500).send({ error: err.message });
    }
  };

export const uploadFiles = async(req, res) => {
    const files= req.files;
    const userEmail= req.session.usuario;
    const result= await usersService.updateDocuments(userEmail, files);

    res.status(200).send({status:"OK", data:result});
}