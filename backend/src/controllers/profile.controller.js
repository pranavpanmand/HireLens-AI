"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePreferences = exports.updateSkills = exports.updateProjects = exports.updateExperience = exports.updateEducation = exports.updateBasicInfo = exports.getProfile = void 0;
const User_1 = require("../models/User");
const StudentProfile_1 = require("../models/StudentProfile");
const errorHandler_1 = require("../middleware/errorHandler");

// Helper to initialize or get profile
async function getOrCreateProfile(userId) {
    let profile = await StudentProfile_1.StudentProfile.findOne({ userId });
    if (!profile) {
        profile = await StudentProfile_1.StudentProfile.create({ userId });
    }
    return profile;
}

const getProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const user = await User_1.User.findById(userId);
        if (!user) throw new errorHandler_1.AppError('User not found', 404);
        
        let profile = await getOrCreateProfile(userId);
        
        res.json({
            success: true,
            data: {
                user,
                profile
            }
        });
    } catch (error) {
        next(error);
    }
};
exports.getProfile = getProfile;

const updateBasicInfo = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { firstName, lastName, phone, gender, dob, city, state, country, github, linkedin, portfolio, careerPreferences } = req.body;
        
        const user = await User_1.User.findByIdAndUpdate(userId, {
            $set: { firstName, lastName, phone, gender, dob, city, state, country }
        }, { new: true, runValidators: true });

        const profile = await getOrCreateProfile(userId);
        if (github !== undefined || linkedin !== undefined || portfolio !== undefined || careerPreferences !== undefined) {
            if (github !== undefined) {
                profile.codingProfiles = { 
                    ...(profile.codingProfiles ? (typeof profile.codingProfiles.toObject === 'function' ? profile.codingProfiles.toObject() : profile.codingProfiles) : {}), 
                    github 
                };
            }
            if (linkedin !== undefined) profile.linkedinUrl = linkedin;
            if (portfolio !== undefined) profile.portfolioUrl = portfolio;
            if (careerPreferences !== undefined) profile.careerPreferences = careerPreferences;
            await profile.save();
        }

        res.json({ success: true, data: { user, profile } });
    } catch (error) {
        next(error);
    }
};
exports.updateBasicInfo = updateBasicInfo;

const updatePreferences = async (req, res, next) => {
    try {
        const profile = await getOrCreateProfile(req.user.id);
        
        const currentPrefs = profile.careerPreferences ? 
            (typeof profile.careerPreferences.toObject === 'function' ? profile.careerPreferences.toObject() : profile.careerPreferences) 
            : {};
            
        profile.careerPreferences = {
            ...currentPrefs,
            jobType: req.body.jobType || req.body.preferredJobType || currentPrefs.jobType,
            availability: req.body.availability || currentPrefs.availability,
            locations: req.body.locations || (req.body.preferredLocation ? [req.body.preferredLocation] : currentPrefs.locations || [])
        };
        await profile.save();
        res.json({ success: true, data: profile.careerPreferences });
    } catch (error) {
        next(error);
    }
};
exports.updatePreferences = updatePreferences;

const updateEducation = async (req, res, next) => {
    try {
        const { education } = req.body; // Array of education objects
        const profile = await getOrCreateProfile(req.user.id);
        profile.education = education;
        await profile.save();
        res.json({ success: true, data: profile.education });
    } catch (error) {
        next(error);
    }
};
exports.updateEducation = updateEducation;

const updateExperience = async (req, res, next) => {
    try {
        const { experience } = req.body; 
        const profile = await getOrCreateProfile(req.user.id);
        profile.experience = experience;
        await profile.save();
        res.json({ success: true, data: profile.experience });
    } catch (error) {
        next(error);
    }
};
exports.updateExperience = updateExperience;

const updateProjects = async (req, res, next) => {
    try {
        const { projects } = req.body; 
        const profile = await getOrCreateProfile(req.user.id);
        profile.projects = projects;
        await profile.save();
        res.json({ success: true, data: profile.projects });
    } catch (error) {
        next(error);
    }
};
exports.updateProjects = updateProjects;

const cloudinary_service_1 = require("../services/cloudinary.service");

const uploadProfilePhoto = async (req, res, next) => {
    try {
        if (!req.file) {
            throw new errorHandler_1.AppError('No photo uploaded', 400);
        }
        
        const userId = req.user.id;
        const user = await User_1.User.findById(userId);
        
        // Delete old photo if it exists
        if (user.profilePhotoPublicId) {
            await (0, cloudinary_service_1.deleteFromCloudinary)(user.profilePhotoPublicId, 'image').catch(console.error);
        }
        
        // Upload new photo
        const result = await (0, cloudinary_service_1.uploadToCloudinary)(req.file.buffer, `profiles/${userId}`, 'image');
        
        user.profilePhotoUrl = result.secure_url;
        user.profilePhotoPublicId = result.public_id;
        await user.save();
        
        res.json({ success: true, data: { url: user.profilePhotoUrl } });
    } catch (error) {
        next(error);
    }
};
exports.uploadProfilePhoto = uploadProfilePhoto;

const deleteProfilePhoto = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const user = await User_1.User.findById(userId);
        
        if (user.profilePhotoPublicId) {
            await (0, cloudinary_service_1.deleteFromCloudinary)(user.profilePhotoPublicId, 'image');
            user.profilePhotoUrl = null;
            user.profilePhotoPublicId = null;
            await user.save();
        }
        
        res.json({ success: true, message: 'Profile photo deleted' });
    } catch (error) {
        next(error);
    }
};
exports.deleteProfilePhoto = deleteProfilePhoto;

const updateSkills = async (req, res, next) => {
    try {
        const { skills } = req.body; // Array of strings
        const profile = await getOrCreateProfile(req.user.id);
        profile.skills = skills;
        await profile.save();
        res.json({ success: true, data: profile.skills });
    } catch (error) {
        next(error);
    }
};
exports.updateSkills = updateSkills;

const updateSummary = async (req, res, next) => {
    try {
        const { summary } = req.body;
        const profile = await getOrCreateProfile(req.user.id);
        profile.summary = summary;
        await profile.save();
        res.json({ success: true, data: profile.summary });
    } catch (error) {
        next(error);
    }
};
exports.updateSummary = updateSummary;

const updateLanguages = async (req, res, next) => {
    try {
        const { languages } = req.body;
        const profile = await getOrCreateProfile(req.user.id);
        profile.languages = languages;
        await profile.save();
        res.json({ success: true, data: profile.languages });
    } catch (error) {
        next(error);
    }
};
exports.updateLanguages = updateLanguages;

const updateAccomplishments = async (req, res, next) => {
    try {
        const { achievements } = req.body;
        const profile = await getOrCreateProfile(req.user.id);
        profile.achievements = achievements;
        await profile.save();
        res.json({ success: true, data: profile.achievements });
    } catch (error) {
        next(error);
    }
};
exports.updateAccomplishments = updateAccomplishments;
