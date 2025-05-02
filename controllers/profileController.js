const User = require('../models/userModel');

exports.saveProfile = async (req, res) => {
    try {
        const userIdFromParams = req.params.userId; // Obtiene el ID de la URL (es string)
        const profileData = req.body;

         // 1. Convierte el userId a número entero
        const userId = parseInt(userIdFromParams, 10);

        // 2. Valida si la conversión fue exitosa y si es un número positivo
        if (isNaN(userId) || userId <= 0) {
            console.error('[CONTROLLER] Invalid or missing userId.');
            // Devuelve un error 400 (Bad Request) porque el ID proporcionado no es válido
            return res.status(400).json({
                 success: false,
                 message: 'ID de usuario inválido o faltante en la solicitud.'
            });
        }
 
        // Validación básica de datos del perfil (como la tenías)
        if (!profileData.age || !profileData.weight || !profileData.height) {
            return res.status(400).json({
                success: false,
                message: 'Edad, peso y altura son campos obligatorios'
            });
        }
        // Puedes añadir más validaciones aquí (ej: rango de edad, etc.)

        // Llama al modelo pasando el userId NUMÉRICO validado
        await User.createUserProfile(userId, profileData);

        res.status(200).json({ // Usa 200 OK para actualización o 201 si fue una creación nueva
            success: true,
            message: 'Perfil guardado exitosamente'
        });

    } catch (error) {
        // Manejo específico para el error de Foreign Key
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(404).json({ // Usa 404 (Not Found) porque el usuario padre no existe
                success: false,
                message: 'Error: El usuario asociado al perfil no existe.'
             });
        }

        // Error genérico del servidor
        res.status(500).json({
            success: false,
            // Proporciona un mensaje más genérico en producción, pero usa error.message en desarrollo
            message: error.message || 'Error interno del servidor al guardar el perfil.'
        });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const userIdFromParams = req.params.userId;

        // --- Log y Validación del userId ---
        const userId = parseInt(userIdFromParams, 10);
        if (isNaN(userId) || userId <= 0) {
             console.error('[CONTROLLER] Invalid or missing userId for getProfile.');
             return res.status(400).json({ success: false, message: 'ID de usuario inválido.' });
        }
        const profile = await User.getUserProfile(userId);

        if (!profile) {
            return res.status(404).json({ // 404 si el perfil específicamente no se encontró
                success: false,
                message: 'Perfil no encontrado para este usuario.'
            });
        }

        res.status(200).json({
            success: true,
            data: profile // El perfil ya viene formateado (con array) desde el modelo
        });

    } catch (error) {
        console.error(`[CONTROLLER] Error fetching profile for userId ${req.params.userId}:`, error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener el perfil.'
        });
    }
};