import express from 'express';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { auth } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

// Helper: Extract public_id from Cloudinary URL
const getPublicIdFromUrl = (url) => {
    if (!url) return null;
    // URL format: https://res.cloudinary.com/cloud_name/image/upload/v123/folder/public_id.ext
    const matches = url.match(/\/upload\/(?:v\d+\/)?(.+)\.\w+$/);
    return matches ? matches[1] : null;
};

// Upload avatar
router.post('/avatar', auth, upload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Configure Cloudinary
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });

        // Get current user to check if they have an existing avatar
        const currentUser = await User.findById(req.user._id);
        const oldAvatarUrl = currentUser?.avatar;

        // Delete old avatar from Cloudinary if exists
        if (oldAvatarUrl) {
            const publicId = getPublicIdFromUrl(oldAvatarUrl);
            if (publicId) {
                try {
                    await cloudinary.uploader.destroy(publicId);
                    console.log('Deleted old avatar:', publicId);
                } catch (deleteError) {
                    console.error('Failed to delete old avatar:', deleteError);
                    // Continue with upload even if delete fails
                }
            }
        }

        // Upload new avatar to Cloudinary
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: process.env.CLOUDINARY_FOLDER || 'quiz',
                    transformation: [
                        { width: 200, height: 200, crop: 'fill', gravity: 'face' },
                        { quality: 'auto', fetch_format: 'auto' }
                    ]
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            uploadStream.end(req.file.buffer);
        });

        // Update user avatar
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { avatar: result.secure_url },
            { new: true }
        ).select('-password');

        res.json({
            message: 'Avatar uploaded successfully',
            avatar: result.secure_url,
            user
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Delete avatar
router.delete('/avatar', auth, async (req, res) => {
    try {
        // Configure Cloudinary
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });

        const currentUser = await User.findById(req.user._id);

        // Delete from Cloudinary if exists
        if (currentUser?.avatar) {
            const publicId = getPublicIdFromUrl(currentUser.avatar);
            if (publicId) {
                try {
                    await cloudinary.uploader.destroy(publicId);
                } catch (deleteError) {
                    console.error('Failed to delete avatar:', deleteError);
                }
            }
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { avatar: null },
            { new: true }
        ).select('-password');

        res.json({ message: 'Avatar removed', user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
