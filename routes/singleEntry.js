const router = require('express').Router();
let User = require('../models/user');
let Entry = require('../models/dailyEntry')
const jsdom = require("jsdom");
const FormData = require('form-data');
const { JSDOM } = jsdom;
// const Razorpay = require('razorpay');

const axios = require('axios');

axios.defaults.withCredentials = true

function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function replaceHess(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
  }

// var instance = new Razorpay({
//     key_id: 'rzp_test_QDrP0cyZ8YdsBD',
//     key_secret: 'AUI8eq4kPExpUOFsLIHgRNKy',
//   });

router.route('/').post((req, res) => {
    const username = req.body.userID;
    const password = req.body.password;
    let userData={}
    let bankData={}
    let nCaptcha = 0
    let msg
    User.findOne({userId: username}, function(err, user) {
        if (user != null){
            axios.get('https://mdtpl.masterdigitaltechnology.com/Users/Login')
            .then(async response => {
                let tokenKey = "__RequestVerificationToken";
                const loginDom = new JSDOM(response.data);
                let tokenValue = loginDom.window.document.getElementsByName(tokenKey)[0].value;
                const userId = user.userId;//userId pass here from Frontend Input
                const pass = password;//passWord pass here from from Frontend Input
                let form = new FormData();
                form.append('UserName', userId);
                form.append('Password', pass);
                form.append("__RequestVerificationToken", tokenValue);
                let today = new Date().toISOString().slice(0, 10);
                let isEntryDone=false;
                console.log("userName date",username,today);
                // Entry.findOne({userId: username, eDate:today}, function(err,entry) {
                //     if(entry != null && entry.isEntryDone === "true"){
                //         isEntryDone=true;
                //     } 
                // });
                var headers = {
                    'Cookie':JSON.stringify(response.headers['set-cookie'])
                }
                await axios.post('https://mdtpl.masterdigitaltechnology.com/Users/Login', form, 
                { headers: {...headers,...form.getHeaders()} })
                .then(async response => {
                    const afterLoginDom = new JSDOM(response.data);
                    
                    if(afterLoginDom.window.document.getElementsByClassName("card-title")[0].innerHTML === "Login"){
                        msg="check username or pass"
                        axios.get('https://mdtpl.masterdigitaltechnology.com/Users/Login')
                        .then(async response => {
                            let tokenKey = "__RequestVerificationToken";
                            const loginDom = new JSDOM(response.data);
                            let tokenValue = loginDom.window.document.getElementsByName(tokenKey)[0].value;
                            const userId = user.userId;//userId pass here from Frontend Input
                            const pass = user.pass;//passWord pass here from from Frontend Input
                            let form = new FormData();
                            form.append('UserName', userId);
                            form.append('Password', pass);
                            form.append("__RequestVerificationToken", tokenValue);
                            var headers = {
                                'Cookie':JSON.stringify(response.headers['set-cookie'])
                            }
                            await axios.post('https://mdtpl.masterdigitaltechnology.com/Users/Login', form, 
                            { headers: {...headers,...form.getHeaders()} })
                            .then(async response => {
                                const afterLoginDom2 = new JSDOM(response.data);
                                if(afterLoginDom2.window.document.getElementsByClassName("card-title")[0].innerHTML === "Login"){
                                    msg="check username or pass"
                                }
                                else{
                                    User.updateOne({userId:user.userId},{ $set: { pass: password } })
                                    .then(() =>  msg ="login success")
                                    .catch(err => res.status(400).json('Error:'+ err)); 
                                }
                            })
                            .catch(error => {
                                msg="check username or pass"
                                console.log(error);
                            });
                            
                            res.json({"userID":user.userId,"isFirst":user.isFirst,"nCaptcha":user.nCaptcha,"msg":msg,"isEntryDone":isEntryDone});
                        })
                        .catch(error => {console.log(error);});
                    }
                    else{
                        res.json({"userID":user.userId,"isFirst":user.isFirst,"nCaptcha":user.nCaptcha,"msg":"login success","isEntryDone":isEntryDone});
                    }
                })
                .catch(error => {
                    res.json({"msg":"check username or pass"})
                    console.log(error);
                });  
            })
            .catch(error => {console.log(error);});
        }
        else{
            axios.get('https://mdtpl.masterdigitaltechnology.com/Users/Login')
            .then(async response => {
                let tokenKey = "__RequestVerificationToken";
                const loginDom = new JSDOM(response.data);
                let tokenValue = loginDom.window.document.getElementsByName(tokenKey)[0].value;
                const userId = username;//userId pass here from Frontend Input
                const pass = password;//passWord pass here from from Frontend Input
                let form = new FormData();
                form.append('UserName', userId);
                form.append('Password', pass);
                form.append("__RequestVerificationToken", tokenValue);
                var headers = {
                    'Cookie':JSON.stringify(response.headers['set-cookie'])
                }
                await axios.post('https://mdtpl.masterdigitaltechnology.com/Users/Login', form, 
                { headers: {...headers,...form.getHeaders()} })
                .then(async response => {
                    console.log("login success")
                    const afterLoginDom3 = new JSDOM(response.data);
                    if(afterLoginDom3.window.document.getElementsByClassName("card-title")[0].innerHTML === "Login"){
                        res.json({"msg":"check username or pass"})
                    }
                    if(afterLoginDom3.window.document.getElementsByClassName("card-title")[0].innerHTML === "User Details"){
                        planName = afterLoginDom3.window.document.getElementsByClassName("text-primary")[3].innerHTML; 
                        await axios.get('https://mdtpl.masterdigitaltechnology.com/Users/MyProfile',{ headers: {...headers} })
                        .then(async response=>{
                            const profileDom = new JSDOM(response.data);
                            userName = profileDom.window.document.getElementById("Name").value;
                            nomineeName = profileDom.window.document.getElementsByName("Nominee")[0].value;
                            bankName = profileDom.window.document.getElementsByName("BankName")[0].value;
                            accountNumber = profileDom.window.document.getElementsByName("AccountNo")[0].value;
                            email = profileDom.window.document.getElementsByName("Email")[0].value;
                            mobileNumber = profileDom.window.document.getElementsByName("MobileNo")[0].value;
                            ifscCode = profileDom.window.document.getElementsByName("IFSCCode")[0].value;
                            accountHolderName = profileDom.window.document.getElementsByName("AccountHolderName")[0].value;
    
                            if(planName === "8 Digit Barcode Project (60000.00)"){
                                nCaptcha= 700
                            }else if(planName === "8 Digit Barcode Project (25000.00)"){
                                nCaptcha=300
                            }
    
                            bankData = {
                                bankName: bankName,
                                accountNumber: accountNumber,
                                ifsccode: ifscCode,
                                accountHolderName: accountHolderName 
                            }
                            userData={
                                userId: userId,
                                pass: pass,
                                planName: planName,
                                userName: userName,
                                nCaptcha: nCaptcha,
                                nomineeName: nomineeName,
                                bank:[bankData],
                                email: email,
                                phoneNo: mobileNumber,
                            };
                            const newUser = new User(userData)
                            newUser.save()
                            .then(() => res.json({"userID":userId,"isFirst":"true","msg":"login success","loop":"3"}))
                            .catch(err => res.status(400).json('Error:'+ err));
                        })
                        .catch(error => {console.log(error);});
                    }    
                })
                .catch(error => {
                    res.json({"msg":"check username or pass"})
                    console.log(error);
                });  
            })
            .catch(error => {console.log(error);});
        }
    });
});

router.route('/startEntry').post((req, res) => {
    const username = req.body.userID;
    const password = replaceHess(req.body.password,"#","%23");
    let couponCode = "none"; 
    couponCode = req.body.couponCode;
    let speed = 400;
    if(couponCode === "kkhome"){
        speed=100;
    }
    if(couponCode === "freefun"){
        speed=250;
    }
    if(couponCode === "sm"){
        speed=175;
    }
    let today = new Date().toISOString().slice(0, 10);
    Entry.findOne({userId: username, eDate:today}, function(err,entry) {
        if(entry == null){
            let entryData={
                userId: username,
                isPaymentDone: "free",
                eDate:today,
                couponCode:couponCode
            };
            const EntryData = new Entry(entryData)
            EntryData.save()
            .then(() => {console.log("entry data save")})
            .catch(err => res.status(400).json('Error:'+ err));  
        }
        // else{
        //     Entry.updateOne({userId:username , eDate:today},{ $set: { isEntryDone: true } })
        //     .then(() =>  console.log("set entry done in data base"))
        //     .catch(err => res.status(400).json('Error:'+ err)); 
        //     res.json({"success":"Your task is completed"})
        // }    
    });
    // User.findOne({userId: username,isFirst:"true"}, function(err, user) {

    // });
    axios.get(`https://shjhx4r8zj.execute-api.us-east-1.amazonaws.com/?userId=${username}&pass=${password}&speed=${speed}`)
    .then(async response => {
        console.log("response:- ",response.data); 
    })
    .catch(error => {
        console.log(error);
    });
    setTimeout(()=>{ Entry.updateOne({userId:username , eDate:today},{ $set: { isEntryDone: true } })
    .then(() =>  console.log("set entry done in data base"))
    .catch(err => res.status(400).json('Error:'+ err));
    res.json({"success":"Your task is completed","isEntryDone":true}); },300000);
});

// router.route('/singlePayment').post(async(req, res) => {
//     Razorpay.orders.create({
//         amount: 50000,
//         currency: "INR",
//         receipt: "receipt#1",
//         notes: {
//           key1: "value3",
//           key2: "value2"
//         }
//       })
// });
module.exports = router; 