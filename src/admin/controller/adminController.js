'use-strict';
const adminService = require('../services/adminService');

// <---- User Management Controller ----->

exports.getUsersList = async (req, res) => {
    const retval = await adminService.getUsersList(req, res);
    return retval;
}

exports.getUserDetails = async (req, res) => {
    const retval = await adminService.getUserDetails(req, res);
    return retval;
}

exports.addUser = async (req, res) => {
    const retval = await adminService.addUser(req, res);
    return retval;
}

exports.updateUser = async (req, res) => {
    const retval = await adminService.updateUser(req, res);
    return retval;
}

exports.updateUserStatus = async (req, res) => {
    const retval = await adminService.updateUserStatus(req, res);
    return retval;
}
exports.deleteUser = async (req, res) => {
    const retval = await adminService.deleteUser(req, res);
    return retval;
}

// exports.getActivityLog = async (req, res) => {
//     const retval = await adminService.getActivityLog(req, res);
//     return retval;
// }

// <---- Post Management Controller ----->

exports.deletePost = async (req, res) => {
    const retval = await adminService.deletePost(req, res);
    return retval;
}

exports.disablePost = async (req, res) => {
    const retval = await adminService.disablePost(req, res);
    return retval;
}

exports.getAllPosts = async (req, res) => {
    const retval = await adminService.getAllPosts(req, res);
    return retval;
}

// <---- Report Management Controller ----->

exports.getAllReports = async (req, res) => {
    const retval = await adminService.getAllReports(req, res);
    return retval;
}