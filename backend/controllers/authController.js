// give me the code for this file.
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// LOGIN CONTROLLER
exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

   
    const user = await User.findOne({ email, role });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: "Invalid email or role"
      });
    }


    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        error: "Invalid password"
      });
    }

    //  Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      "secretkey",
      { expiresIn: "1d" }
    );

    res.json({
      success: true,
      token,
      role: user.role
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
};