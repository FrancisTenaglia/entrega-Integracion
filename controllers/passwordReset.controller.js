import decryptQueryParam from '../services/queryParamsEncryption.js';
import { isValidPassword, createHash } from '../utils/validation.js';
import CustomError from '../services/customError.js';
import errorsDict from '../utils/dictionary';

import { FactoryUsers } from '../dao/factory.js';

const userManager = new FactoryUsers();


const ONEHOURMS = 60 * 60 * 1000;

export const checkPasswordResetLink = async(req, res) => {
    const { uid, et} = req.query;
    if (!uid || !et) { return res.status(400).json({ message:'Invalid link parameters'});}

    const expirationTimestamp = decryptQueryParam(et);

    if(new Date().getTime() > expirationTimestamp) {
        return res.redirect('/expiredLink');
    }

    const user = await userManager.getUserById(uid);
    if (!user) {
        return res.status(404).json({message:'User not found'});
    }

    return res.render('resetPassword',{ userId: uid});
};

export const resetPassword = async (req, res) => {
    const { userId, newPassword } = req.body;    
    const user = await userManager.getUserById(userId) 
    if(!user) {
        return res.status(404).json({ message:'User not found'});
    }
    
    if(isValidPassword(user, newPassword)) {
        throw new CustomError(errorsDict.INVALID_TYPE_ERROR, 'New password cannot be the same as the old one', false);
    }
    user.password = createHash(newPassword);
    await user.save();
    return( res.status(200).json({ message:'Password reset successfully'}));
};