'use-strict';
const adminService = require('../services/adminService');

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
exports.deleteUser = async (req, res) => {
    const retval = await adminService.deleteUser(req, res);
    return retval;
}

// exports.getActivityLog = async (req, res) => {
//     const retval = await adminService.getActivityLog(req, res);
//     return retval;
// }

exports.deletePost = async (req, res) => {
    const retval = await adminService.deletePost(req, res);
    return retval;
}