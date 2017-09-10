const express=require('express')
const bodyParser = require('body-parser')
const CryptoJS = require("crypto-js")
var crypto = require("crypto")
var path = require("path")
var fs = require("fs")
const router=express.Router()


var encryptStringWithRsaPublicKey = function(toEncrypt, relativeOrAbsolutePathToPublicKey) {
    //var absolutePath = path.resolve(relativeOrAbsolutePathToPublicKey)
    var publicKey = fs.readFileSync(relativeOrAbsolutePathToPublicKey, "utf8")
    var buffer = new Buffer(toEncrypt)
    var encrypted = crypto.publicEncrypt(publicKey, buffer)
    return encrypted.toString("base64")
};

var decryptStringWithRsaPrivateKey = function(toDecrypt, relativeOrAbsolutePathtoPrivateKey) {
   // var absolutePath = path.resolve(relativeOrAbsolutePathtoPrivateKey)
    var privateKey = fs.readFileSync(relativeOrAbsolutePathtoPrivateKey, "utf8")
    var buffer = new Buffer(toDecrypt, "base64")
    var decrypted = crypto.privateDecrypt(privateKey, buffer)
    return decrypted.toString("utf8")
};


var admin = require("firebase-admin");
var serviceAccount = require("./cert/serviceAccountKey.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://bucketcrypt.firebaseio.com"
});
var db = admin.database()
var ref = db.ref();
var dataRef = ref.child("secretdata");


router.post('/rsa/enc',function(req,res){
    if (!req.body) return res.sendStatus(400)
    var cipherText=encryptStringWithRsaPublicKey(req.body.text,'./routes/cert/publicKey.pem')
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
            data[el].cipher=decryptStringWithRsaPrivateKey(data[el].cipher,'./routes/cert/privateKey.pem')
           //result[key].push(data[el]); 
        }
        //console.log(JSON.stringify(result));
        res.send(data);
    }); 
    
});

router.post('/rsa/dec',function(req,res){
    if (!req.body) return res.sendStatus(400)
    var plainText=decryptStringWithRsaPrivateKey(req.body.cipher,'./routes/cert/privateKey.pem')
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