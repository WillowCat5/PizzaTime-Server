const express = require('express')
const router = express.Router()
const accountService = require('./accounts.service')


// adds, changes, deletions will be under /admin

router.get('/:accountId', accountService.getAccount)

router.post('/newaccount', accountService.newAccount)

router.post('/change/:accountId', accountService.changeAccount)

// router.get('/:accountId', accountById)

router.get('/search/:searchParam', accountService.searchAccount)


module.exports = router


// *** getAuth
