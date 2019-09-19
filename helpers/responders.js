function respondOK(res, obj) {
    obj = { returned: obj, resultCode : 200, result: "OK" }
    res.send(JSON.stringify(obj))
}

function respondError(res, obj) {
    obj = { returned: obj, resultCode : 500, result: "NotOk" }
    res.send(JSON.stringify(obj))
}

module.exports = { respondOK, respondError }