const crypto = require('../../../utils/crypto');
const utils = require('../../../utils/utils');
const mongoose = require("mongoose");

const authMethods = ['email', 'google', 'facebook', 'apple', 'github', 'phone'];
const genders = ['Male', 'Female', 'Other'];

const entitySchema = new mongoose.Schema({
    username: String,
    displayName: String,
    firstName: String,
    lastName: String,
    fullName: String,
    email: {
        type: String,
        lowercase: true,
    },
    phone: String,
    gender: {
        type: String,
        enum: genders,
    },
    status: {
        type: String,
        enum: ['pending', 'active', 'deleted', 'blocked'],
        default: 'normal',
    },
    userType: {
        type: String,
        enum: ['normal', 'creator'],
        default: 'normal',
    },
    joinedCommunity: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "community",
    },
    accountReports: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "user",
    },
    postReports: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "post",
    },
    isDisabled: {
        type: Boolean,
        default: false,
    },
    profilePicture: String,
    profileBanner: String,
    createdAt: {
        type: Date,
        default: Date.now,
    },
    lastActiveAt: Date,
    joiningDate: {
        type: Date,
        default: Date.now,
    },
    postsCount: {
        type: Number,
        default: 0,
    },
    authMethod: {
        type: String,
        enum: authMethods,
        default: 'email',
    },
    countryCode: String,
    ISOCode: String,
    activationCode: String,
    password: String,
    role: {
        type: String,
        enum: ['superAdmin', 'user', 'admin'],
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
    isPhoneVerified: {
        type: Boolean,
        default: false,
    },
    isProfileCompleted: {
        type: Boolean,
        default: false,
    },
    lastAccess: {
        type: Date,
        default: null,
    },
    about: String,
    notificationCount: {
        type: Number,
        default: 0,
    },
    googleId: String,
    facebookId: String,
    appleId: String,
    userPlan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "userPlan",
    },
    googlePurchase: {
        packageName: String,
        subscriptionId: String,
        purchaseToken: String,
        transactionId: String,
    },
    applePurchase: {
        transactionId: String,
        Receipt: String,
        subscriptionId: String,
        expiryDate: String,
    },
    planPro: {
        type: Boolean,
        default: false,
    },
});

entitySchema.statics.newEntity = async function (body, createdByAdmin = true) {
    const model = {
        username: body.username || (body.firstName ? `${body.firstName}_${utils.generateRandomAlphaNumeric()}` : utils.generateRandomAlphaNumeric()),
        displayName: body.displayName || (body.firstName && body.lastName ? `${body.firstName} ${body.lastName}` : null),
        firstName: body.firstName,
        lastName: body.lastName,
        fullName: body.firstName && body.lastName ? `${body.firstName} ${body.lastName}` : null,
        email: body.email,
        phone: body.phone,
        gender: body.gender,
        authMethod: body.authMethod,
        ISOCode: body.ISOCode,
        countryCode: body.countryCode,
        role: body.role,
        about: body.about,
        googleId: body.googleId,
        facebookId: body.facebookId,
        appleId: body.appleId,
        stripeCustomerId: body.stripeCustomerId || "",
        createdAt: new Date(),
        joiningDate: new Date(),
    };

    if (body.password) {
        model.password = await crypto.setPassword(body.password);
    }

    if (createdByAdmin) {
        model.isEmailVerified = body.authMethod === 'email';
        model.isPhoneVerified = body.authMethod === 'phone';
        model.status = 'active';
    } else {
        model.activationCode = utils.randomPin();
    }

    return model;
};

entitySchema.statics.isEmailTaken = async function (email) {
    return !!(await this.findOne({ email }));
};

entitySchema.statics.isPhoneTaken = async function (phone) {
    return !!(await this.findOne({ phone }));
};

entitySchema.statics.isPasswordMatch = async function (user, password) {
    return await crypto.comparePassword(password, user.password);
};

const Entity = mongoose.models.User || mongoose.model('User', entitySchema);

module.exports = Entity;