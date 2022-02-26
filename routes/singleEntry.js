const router = require('express').Router();
let User = require('../models/user');
let Entry = require('../models/dailyEntry')
const jsdom = require("jsdom");
const FormData = require('form-data');
const { JSDOM } = jsdom;
const axios = require('axios');

axios.defaults.withCredentials = true

function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

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
                            res.json({"userID":user.userId,"isFirst":user.isFirst,"nCaptcha":user.nCaptcha,"msg":msg,"loop":"1"});
                        })
                        .catch(error => {console.log(error);});
                    }
                    else{
                        res.json({"userID":user.userId,"isFirst":user.isFirst,"nCaptcha":user.nCaptcha,"msg":"login success","loop":"2"});
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
                    console.log(response.data);
                    if(afterLoginDom3.window.document.getElementsByTagName("card-title")[0].innerHTML === "Login"){
                        res.json({"msg":"check username or pass"})
                    }
                    else{
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
    const password = req.body.password;
   
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    let yyyy = today.getFullYear();
    today = mm + '/' + dd + '/' + yyyy;
    Entry.findOne({userId: username, eDate:today}, function(err,entry) {
        if(entry == null){
            let entryData={
                userId: username,
                isPaymentDone: "free",
                eDate:today
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
    
    axios.get('https://mdtpl.masterdigitaltechnology.com/Users/Login')
    .then(async response => {
        console.log("call login page");
        let tokenKey = "__RequestVerificationToken";
        const loginDom = new JSDOM(response.data);
        let tokenValue = loginDom.window.document.getElementsByName(tokenKey)[0].value;
            // const numberWrongData=user.wrong;
            let remainData=0;
            let totalData=0;
            let wrongData=0;
            let wrongIdList=[];
            let captchaLength= 0;
            let form=new FormData();
            form.append('UserName', username);
            form.append('Password', password);
            form.append([tokenKey], tokenValue);
            headers={
                'Cookie':JSON.stringify(response.headers['set-cookie'])
            }
            await axios.post('https://mdtpl.masterdigitaltechnology.com/Users/Login', form, 
            { headers: {...headers,...form.getHeaders()} })
            .then(async response => {
                console.log(`Login success in ${username}`);
                let promises  = [];
                await axios.get('https://mdtpl.masterdigitaltechnology.com/Users/JobWork',{ headers: {...headers, referer:"https://mdtpl.masterdigitaltechnology.com/Users/TodayWork"} })
                .then(async response=>{
                    const totalDataDom = new JSDOM(response.data);
                    remainData = totalDataDom.window.document.getElementsByTagName("h3")[1].innerHTML;
                    totalData = totalDataDom.window.document.getElementsByTagName("h3")[0].innerHTML;
                    wrongData = totalDataDom.window.document.getElementsByTagName("h3")[4].innerHTML;
                    if(remainData != 0){
                        captchaLength =  totalDataDom.window.document.getElementsByClassName("noselect")[0].innerHTML.length;
                    }
                    User.updateOne({userId:username},{ $set: { nCaptcha: totalData } })
                    .then(() =>  console.log("Update total captcha successfully"))
                    .catch(err => res.status(400).json('Error:'+ err + "total captcha not updated"));
                    console.log(`Total Data is ${totalData}, Remain Data is ${remainData}, Wrong Data is ${wrongData}`);
                })
                .catch(error => {console.log(error);});
                const error = randomNumber(1,100);
                if (captchaLength == 12){
                    for (let i = 1; i <= remainData; i++) {
                        const number= randomNumber(100000000000, 999999999999)
                        let captchaForm=new FormData();
                        captchaForm.append('SystemCaptcha', wrongIdList.includes(i) ? randomNumber(100000000000, 999999999999) : number);
                        captchaForm.append('EnteredCaptcha', number);
                        captchaForm.append([tokenKey], tokenValue);
                        promises.push(
                            axios.post('https://mdtpl.masterdigitaltechnology.com/Users/JobWork', captchaForm, { headers: {...headers,...captchaForm.getHeaders(),referer:"https://mdtpl.masterdigitaltechnology.com/Users/TodayWork"} })
                            .then(()=>{ 
                                console.log(`Captcha = ${number} Loop = ${i}  ${wrongIdList.includes(i) ? "False" : "true" } Id= ${username}`);
                            })
                            .catch(error => {console.log(error);})
                        )  
                        // if (i%100 == 0){
                        //     res.json({"entryComplete":i})  
                        // }
                        await new Promise(resolve => setTimeout(resolve,150))
                    }
                }
                if (captchaLength == 8){
                    for (let i = 1; i <= remainData; i++) {
                        const number= randomNumber(10000000, 99999999)
                        let captchaForm=new FormData();
                        captchaForm.append('SystemCaptcha', wrongIdList.includes(i) ? randomNumber(10000000, 99999999) : number);
                        captchaForm.append('EnteredCaptcha', number);
                        captchaForm.append([tokenKey], tokenValue);
                        promises.push(
                            axios.post('https://mdtpl.masterdigitaltechnology.com/Users/JobWork', captchaForm, { headers: {...headers,...captchaForm.getHeaders(),referer:"https://mdtpl.masterdigitaltechnology.com/Users/TodayWork"} })
                            .then(()=>{ 
                                console.log(`Captcha = ${number} Loop = ${i}  ${wrongIdList.includes(i) ? "False" : "true" } Id= ${username}`);
                            })
                            .catch(error => {console.log(error);})
                        )
                        // if (i%100 == 0){
                        //     res.json({"entryComplete":i})  
                        // }
                        await new Promise(resolve => setTimeout(resolve,150))
                    }
                }
                if (captchaLength == 6){
                    for (let i = 1; i <= remainData; i++) {
                        const number= randomNumber(100000, 999999)
                        let captchaForm=new FormData();
                        captchaForm.append('SystemCaptcha', wrongIdList.includes(i) ? randomNumber(100000, 999999) : number);
                        captchaForm.append('EnteredCaptcha', number);
                        captchaForm.append([tokenKey], tokenValue);
                        promises.push(
                            axios.post('https://mdtpl.masterdigitaltechnology.com/Users/JobWork', captchaForm, { headers: {...headers,...captchaForm.getHeaders(),referer:"https://mdtpl.masterdigitaltechnology.com/Users/TodayWork"} })
                            .then(()=>{ 
                                console.log(`Captcha = ${number} Loop = ${i}  ${wrongIdList.includes(i) ? "False" : "true" } Id= ${username}`);
                            })
                            .catch(error => {console.log(error);})
                        )
                        // if (i%100 == 0){
                        //     res.json({"entryComplete":i})  
                        // }   
                        await new Promise(resolve => setTimeout(resolve,150))
                    }
                }
                if (captchaLength == 4){
                    for (let i = 1; i <= remainData; i++) {
                        const number= randomNumber(1000, 9999)
                        let captchaForm=new FormData();
                        captchaForm.append('SystemCaptcha', wrongIdList.includes(i) ? randomNumber(1000, 9999) : number);
                        captchaForm.append('EnteredCaptcha', number);
                        captchaForm.append([tokenKey], tokenValue);
                        promises.push(
                            axios.post('https://mdtpl.masterdigitaltechnology.com/Users/JobWork', captchaForm, { headers: {...headers,...captchaForm.getHeaders(),referer:"https://mdtpl.masterdigitaltechnology.com/Users/TodayWork"} })
                            .then(()=>{ 
                                console.log(`Captcha = ${number} Loop = ${i}  ${wrongIdList.includes(i) ? "False" : "true" } Id= ${username}`);
                            })
                            .catch(error => {console.log(error);})
                        )
                        // if (i%100 == 0){
                        //     res.json({"entryComplete":i})  
                        // }  
                        await new Promise(resolve => setTimeout(resolve,150))
                    }
                }
                return Promise.all(promises).then(() => {
                    Entry.updateOne({userId:username , eDate:today},{ $set: { isEntryDone: true } })
                    .then(() =>  console.log("set entry done in data base"))
                    .catch(err => res.status(400).json('Error:'+ err)); 
                    axios.get('https://mdtpl.masterdigitaltechnology.com//Users/Logout')
                    .then(() => { 
                        res.json({"success":"Your task is completed"})
                        console.log("logout success");
                    })  
                    .catch(error => {
                        console.log(error);
                    });  
                });            
            })
            .catch(error => {
                console.log(error);
            });     
    })
    .catch(error => {
        console.log(error);
    });
});

module.exports = router; 