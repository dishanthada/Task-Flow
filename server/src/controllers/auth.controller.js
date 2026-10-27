const jwt = require('jsonwebtoken');
const axios = require('axios');
const User = require('../models/User');
const { OAuth2Client } = require('google-auth-library');

const oAuth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'postmessage'
);

/**
 * Generate a signed JWT token for a given user ID.
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }

    // Create user (passwordHash field triggers bcrypt pre-save hook)
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash: password,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          theme: user.theme,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user and return JWT
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user and explicitly select passwordHash (it's select: false)
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      '+passwordHash'
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          theme: user.theme,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current logged-in user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    res.status(200).json({
      success: true,
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          theme: user.theme,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user theme preference
 * @route   PUT /api/auth/theme
 * @access  Private
 */
const updateTheme = async (req, res, next) => {
  try {
    const { theme } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { theme },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Theme updated',
      data: { theme: user.theme },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Google login supporting access_token, authorization code, or ID token (credential)
 * @route   POST /api/auth/google
 * @access  Public
 */
const googleLogin = async (req, res, next) => {
  try {
    const { code, credential, idToken, accessToken, access_token } = req.body;
    const tokenToUse = accessToken || access_token;
    const jwtCredential = credential || idToken;

    if (!code && !jwtCredential && !tokenToUse) {
      return res.status(400).json({
        success: false,
        message: 'Google authorization token or code is required',
      });
    }

    let email;
    let name;

    // 1. If client provided Google ID Token / Credential directly
    if (jwtCredential) {
      const ticket = await oAuth2Client.verifyIdToken({
        idToken: jwtCredential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      email = payload.email;
      name = payload.name;
    }
    // 2. If client provided authorization code (auth-code flow)
    else if (code) {
      try {
        const { tokens } = await oAuth2Client.getToken({
          code,
          redirect_uri: 'postmessage',
        });

        if (tokens.id_token) {
          const ticket = await oAuth2Client.verifyIdToken({
            idToken: tokens.id_token,
            audience: process.env.GOOGLE_CLIENT_ID,
          });
          const payload = ticket.getPayload();
          email = payload.email;
          name = payload.name;
        } else if (tokens.access_token) {
          const { data } = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${tokens.access_token}` },
          });
          email = data.email;
          name = data.name;
        } else {
          return res.status(400).json({
            success: false,
            message: 'Failed to retrieve user tokens from Google',
          });
        }
      } catch (tokenErr) {
        console.error('Google token exchange error:', tokenErr.response?.data || tokenErr.message);
        return res.status(400).json({
          success: false,
          message:
            tokenErr.response?.data?.error_description ||
            tokenErr.response?.data?.error ||
            'Failed to exchange Google authorization code. Please try again.',
        });
      }
    }
    // 3. If client provided access_token (implicit flow)
    else if (tokenToUse) {
      try {
        const { data } = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenToUse}` },
        });
        email = data.email;
        name = data.name;
      } catch (tokenErr) {
        console.error('Google access_token verification error:', tokenErr.response?.data || tokenErr.message);
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired Google access token',
        });
      }
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Could not obtain email address from your Google account',
      });
    }

    // Clean and normalize name and email
    const cleanEmail = email.toLowerCase().trim();
    let cleanName =
      name && typeof name === 'string' && name.trim().length >= 2
        ? name.trim()
        : cleanEmail.split('@')[0] || 'User';
    if (cleanName.length > 50) cleanName = cleanName.slice(0, 50);

    // Check if user already exists
    let user = await User.findOne({ email: cleanEmail });

    if (!user) {
      // Create user with a dummy password since they authenticate via Google
      user = await User.create({
        name: cleanName,
        email: cleanEmail,
        passwordHash: 'GOOGLE_AUTH_MANAGED_' + Date.now(),
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Google login successful',
      data: {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          theme: user.theme,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    console.error('googleLogin unhandled error:', error);
    if (error.message && error.message.includes('Token used too late')) {
      return res.status(401).json({ success: false, message: 'Google token expired' });
    }
    next(error);
  }
};

/**
 * @desc    Update user profile (name and/or email)
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;

    const updateFields = {};

    if (name !== undefined) {
      const trimmedName = name.trim();
      if (trimmedName.length < 2 || trimmedName.length > 50) {
        return res.status(400).json({
          success: false,
          message: 'Name must be between 2 and 50 characters',
        });
      }
      updateFields.name = trimmedName;
    }

    if (email !== undefined) {
      const trimmedEmail = email.toLowerCase().trim();
      const emailRegex = /^\S+@\S+\.\S+$/;
      if (!emailRegex.test(trimmedEmail)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid email address',
        });
      }
      // Check if the new email is already in use by another user
      if (trimmedEmail !== req.user.email) {
        const existing = await User.findOne({ email: trimmedEmail });
        if (existing) {
          return res.status(400).json({
            success: false,
            message: 'An account with this email already exists',
          });
        }
      }
      updateFields.email = trimmedEmail;
    }

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields provided to update',
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateFields,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          theme: user.theme,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe, updateTheme, googleLogin, updateProfile };
