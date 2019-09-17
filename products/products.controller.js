const express = require('express')
const router = express.Router()
const productService = require('./products.service')

// adds, changes, deletions will be under /admin

router.get('/:prodId',getProdById)
router.get('/cat/:category',getProdsByCategory)

module.exports = router

function getProdById(req, res, next) {
    productService.getById(req.params.prodId)
    .then(data => data ? res.json(data) : res.sendStatus(500))
    .catch(err => next(err))
}

function getProdsByCategory(req, res, next) {
    productService.getByCategory(req.params.category)
    .then(data => data ? res.json(data) : res.sendStatus(500))
    .catch(err => next(err))
}
