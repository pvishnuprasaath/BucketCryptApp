const express=require('express')
const bodyParser = require('body-parser')
const CryptoJS = require("crypto-js")
const rsa=require('../helpers/rsafun')
const router=express.Router()


var admin = require("firebase-admin");
var serviceAccount = require("../helpers/cert/serviceAccountKey.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://bucketcrypt.firebaseio.com"
});
var db = admin.database()
var ref = db.ref();
var dataRef = ref.child("secretdata");


router.post('/rsa/enc',function(req,res){
    if (!req.body) return res.sendStatus(400)
    var cipherText=rsa.encryptStringWithRsaPublicKey(req.body.text,'../helpers/cert/publicKey.PEM')
    console.log(cipherText.toString())
    dataRef.push({
        text: req.body.text,
        cipher: cipherText.toString()
      });
    res.send({
        Text: req.body.text,
        Cipher: cipherText.toString()
    });
});

router.get('/rsa/dec',function(req,res){
    // var result={};
    // var key="final";
    // result[key]=[];
    dataRef.on("value", function(snapshot) {
        var data = snapshot.val();
        console.log(data);
        for(el in data){
            data[el].cipher=rsa.decryptStringWithRsaPrivateKey(data[el].cipher,'../helpers/cert/privateKey.PEM')
           //result[key].push(data[el]); 
        }
        //console.log(JSON.stringify(result));
        res.send(data);
    }); 
    
});

router.post('/rsa/dec',function(req,res){
    if (!req.body) return res.sendStatus(400)
    var plainText=rsa.decryptStringWithRsaPrivateKey(req.body.cipher,'../helpers/cert/privateKey.PEM')
    console.log(plainText)    
    res.send({
        Cipher: req.body.cipher,
        Text: plainText
    });
});

router.post('/aes/enc', function (req, res) {
    if (!req.body) return res.sendStatus(400)
    var cipherText = CryptoJS.AES.encrypt(req.body.text, 'secret')
    console.log(cipherText.toString())
    res.send({
        Text: req.body.text,
        Cipher: cipherText.toString()
    });
  })
  
router.post('/aes/dec', function (req, res) {
    if (!req.body) return res.sendStatus(400)
    var bytes  = CryptoJS.AES.decrypt(req.body.cipher, 'secret')
    var plainText = bytes.toString(CryptoJS.enc.Utf8)
    console.log(plainText)    
    res.send({
        Cipher: req.body.cipher,
        Text: plainText
    });
})

module.exports=router