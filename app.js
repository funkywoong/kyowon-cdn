const express = require('express');
const ejs = require('ejs')
const AWS = require('aws-sdk');
require('dotenv').config();

const PORT = 3000;

const CF_PUBLIC_ID = `K2TN4O1RP0JDT6`
const CF_PRIVATE_KEY = `-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEAzlp7sLbm9aRLoGg9wa40mE4hRF1PLhIFKZdJjbavnDnznOVy
o5+9Wlijuc5m+kestL+sV2IRFWYPmtBAhfB40HD1L6IMabsyIOiRkstQO9c8V5W9
9KLhRiCH+/XGhv1tsDh+UBDSmVuOy4jQRDwSHVjMx+wk6A85Na9MdKQUN1rIxMXV
i1VrWzcMYLexPUK86TZVi2o3M8XGc0Lu7seDjEAvOkxQOs+n7JuUszr0tOTLQFjh
GasLjHIFBDTn5gTw3u8/maBj4SRRfvEuXD8VJtJrJTjLICOAEQxFmf6gCrjJr2rc
LAh59OHz+60O0yUBStFvlzlEbv67rzpsMm9JtQIDAQABAoIBAHuUFJ8v6gER83iM
9O8YtMbBg4q9lr2wbQcLYzFLRr/4tLwxbQYwk+WXT/XmdiVM51EXuM5cHH8EMDQ2
o22TJccu3qc4FNb9FHhAz21p9RLhQ3Hwa2ImaWLl+IocFlihTR9LtdmdOYI+IrYh
qRg0IWUR2RGhijivZUORR+hSmwjKcfny4aers6/lSxqhomurUukec376RH0tsEPX
Z3kLxfAjckpN06sEt6hTJVbSgcGnMV3UlyJlLitRLfETiTdYDFH8zJHX0bWbiD2t
Oi8fwqOIqoF6R05yLaS9YRNJWwVEpOR4SqXuCKGahZ9ekNIb49RkSveSY6iZ+FEM
o4ytXgECgYEA8Nq3NpydYAj9pclryVrwWrigv5KJ36nc2L27rMBSZHfezEIVcRAk
W6dzA5hvFbjzI13R6aZ3VuPrz8he9SN8pN3vn1lkKPWMAYPY1u9uIxjDQP1ZJ68d
JCtsHlVab0P/zXG3NpGnx/I2M8EEE5tUExTMqDxdcz4+/XJoWdA5ZE0CgYEA21Re
zK23+FskCgW7l6WzwzesC7WT0m23ymy87mA3jfBQdtAjeUBtFKocRHAdAjs7u65O
rt9zDLyQ5Zc/SWnruuAQpXpWFrk0w93xQkNsiavinWjcIx+qO5qfLRup1k2qNDlW
P6coWWjSG+YZe3l7NefnJOPnOUWjCZ6TUfvTTwkCgYEAhk9RD9EyKVWaLJMv2i8u
DUkbyviqjeEpWGwldeYhjAkUYw8O6ee4fqvYBU9B0vk6DKTK4+KCdh/PZiU0XrsV
TNK+RzwQEI8tLcMabnFCF6w9ZcZhqzGJrJvSRPAP6DAhO62IH5QF3ggBlcaywURD
FAjrP326FwPFGIxuCHeHKZkCgYAqlTLioke5nFhe6cYGJ1HDcSeiDlro3Ax27K2x
ylR+5k15A+gfPnbvMCfU0b+QE1gBlFIKea+opWOsb7UF197ApYgV2K6mMscf0BNr
PhPwlsKktRsoZplygQ6uf1R2GxYUlZ09NoMK+OLyL7Z61pcpXCDwdJ8L640/7N3F
aRMZoQKBgGho2rWKyTX4UNzNr5YiU0DGkGlW8nbAVQRya2dhEucUj7UWWPiAmWvo
UYFzcMWHqWOEDgEZXwlZlNzliH7f9E56woyO/c3ABeQ2BAaAR4FCuo7+P9+KuKiQ
ZC6l3AgwEhjSxr8YstUD5zCA+BvHA3M60p897Cf3rDfJAxud03Wu
-----END RSA PRIVATE KEY-----`

const signer = new AWS.CloudFront.Signer(
    CF_PUBLIC_ID, CF_PRIVATE_KEY
);

const expTime = 60 * 60 * 1000;

async function startServer() {
    
    const app = express();

    // Set view module
    app.set("view engine", "ejs");
    app.use(express.static(__dirname + '/'));

    app.get("/cf", (req, res) => {
        res.render("sample", {})
    })

    app.get("/cf/cdn", (req, res) => {
        
        const policy = {
            Statement: [
                {
                    Resource: 'https://d3n16etpkcdril.cloudfront.net/hls/*',
                    Condition: {
                        DateLessThan: {
                            'AWS:EpochTime': Math.floor((Date.now() + expTime) / 1000)
                        }
                    }
                }
            ]
        }
                
        const cookie = signer.getSignedCookie({ policy: JSON.stringify(policy) })
        
        console.log(cookie);
        res.json({
            "Signed-cookie will be expired in 1 hour" : cookie
        })
    })

    app.get("/status", (req, res) => {
        return res.status(200).end()
    })

    app.listen(PORT, () => {
        console.log(`
            ################################################
                Server listening on port : ${PORT}
            ################################################
        `);
    }).on('error', err => {
        console.log(err.stack);
        process.exit(1);
    });

}

startServer();
