import prisma from '../config/prisma.js';
import bcrypt from 'bcrypt';

const Admin = {
    async obtenerPorUsuario(usuario) {
        return await prisma.administrador.findUnique({
            where: { usuario }
        });
    },

    async crear(admin) {
        const { usuario, password, nombre, email } = admin;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const result = await prisma.administrador.create({
            data: {
                usuario,
                password: hashedPassword,
                nombre,
                email
            }
        });
        return result.id;
    },

    async verificarPassword(password, hashedPassword) {
        return await bcrypt.compare(password, hashedPassword);
    },

    async actualizarPassword(id, nuevaPassword) {
        const hashedPassword = await bcrypt.hash(nuevaPassword, 10);
        await prisma.administrador.update({
            where: { id },
            data: { password: hashedPassword }
        });
        return true;
    },

    async actualizarConfiguracion(id, config) {
        await prisma.administrador.update({
            where: { id },
            data: config
        });
        return true;
    }
};

export default Admin;
