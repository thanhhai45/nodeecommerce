'use strict'

const express = require('express');
const productController = require('../../controllers/product.controller');
const router = express.Router();
const { authentication } = require('../../auth/authUtils');
const { asyncHandler } = require('../../helpers/asyncHandler');

// authentication
router.use(authentication)
router.post('', asyncHandler(productController.createProduct));

module.exports = router 