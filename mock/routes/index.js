const express = require('express');
const router = express.Router();

module.exports = router;

router.get('/feopen/illegal/order', function(req, res) {
    if (req.query.type === 'list') {
        res.json(require('./illegal/order'));
    } else {
        res.json(require('./illegal/order-deital'));
    }
});

router.post('/feopen/illegal/order', function(req, res) {
    res.json(require('./illegal/order-post'));
});

router.post('/feopen/illegal/result', function(req, res) {
    res.json(require('./illegal/result'));
});

router.get('/feopen/illegal/violation/preorder', function(req, res) {
    res.json(require('./illegal/preorder'));
});

router.post('/feopen/illegal/prepay', function(req, res) {
    res.json(require('./illegal/prepay'));
});

router.get('/feopen/illegal/car', function(req, res) {
    res.json(require('./illegal/car'));
});

router.get('/feopen/base/address', function(req, res) {
    res.json(require('./illegal/address'));
});

router.get('/feopen/illegal/defaultcity', function(req, res) {
    res.json(require('./illegal/defaultcity'));
});

router.get('/feopen/illegal/bonuses', function(req, res) {
    res.json(require('./illegal/bonuses'));
});