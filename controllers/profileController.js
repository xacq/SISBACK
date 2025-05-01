const User = require('../models/userModel');

exports.saveProfile = async (req, res) => {
  try {
    const userId = req.params.userId;
    const profileData = req.body;

    // Validación básica
    if (!profileData.age || !profileData.weight || !profileData.height) {
      return res.status(400).json({
        success: false,
        message: 'Edad, peso y altura son campos obligatorios'
      });
    }

    await User.createUserProfile(userId, profileData);

    res.status(201).json({
      success: true,
      message: 'Perfil guardado exitosamente'
    });

  } catch (error) {
    console.error('Error saving profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error al guardar el perfil'
    });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const userId = req.params.userId;
    const profile = await User.getUserProfile(userId);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Perfil no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: profile
    });

  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el perfil'
    });
  }
};