
const AWS = require('aws-sdk');

const express = require("express");
const app = express();
const path = require("path");

// const express = require('express')
const cookieParser = require('cookie-parser')
// const app = express()
app.use(cookieParser())

const bodyParser = require("body-parser");
// middleware
app.use(bodyParser.urlencoded({extended:true}));

// app.use(bodyParser.json());
app.use(bodyParser.json({limit: '5000mb'}));
app.use(bodyParser.urlencoded({limit: '5000mb', extended: true}));

//serving a static file
app.use(express.static("public"));

const dotenv = require('dotenv');
dotenv.config();
const jwt = require('jsonwebtoken')
// 設定密鑰
const SECRET = process.env.SECRET;





//登入頁面
app.get("/",(req,res) => {
    res.render("login.ejs");
})

//main頁面
app.get("/main",(req,res) => {
    res.render("main.ejs");
})

//manager頁面
app.get("/manager",(req,res) => {
    res.render("manager.ejs");
})


const database = require('./module/database.js');
const getSignature = database.getSignature;

const getUser = database.getUser;
const checkEmail = database.checkEmail;
const insertIntoUserPrivate = database.insertIntoUserPrivate;
app.post("/register/confirm", async (req,res) => {
    account = req.body.account;
    password = req.body.password;
    email = req.body.email;
    if(account=="" | password=="" | email==""){
        res.send({
            error:true,
            message:"請完整填寫註冊資料"
        });
        return
    }

    //正則表達式
    const pattern = /@gmail\.com$/;
    if (!pattern.test(email)) {
        res.send({
            error:true,
            message:"信箱請符合@gmail.com的格式"
        });
        return
    }
    //確定是否有創建過相同帳密
    const doCheckAccountPassword = await getUser(account,password);
    if(doCheckAccountPassword){
        res.send({
            error:true,
            message:"此組帳號密碼已被創建過，請更換"
        });
        return
    }
    //確定是否有創建過相同信箱
    const doCheckEmail = await checkEmail(email);
    if(doCheckEmail.length==1){
        res.send({
            error:true,
            message:"此組信箱已被創建過，請更換"
        });
        return
    }

    //創建擁有管理者權限的人
    const doinsertIntoUserPrivate = await insertIntoUserPrivate
        (
        userName="管理者",
        account,
        password,
        email,
        companyId=null,
        managerJudge=1,
        departmentId=null,
        )
    res.send({
        ok:true,
        message:"創建成功，請至登入頁面登入。"
    });
   
})









app.post("/login/confirm", async (req,res) => {
    user_account = req.body.user_account;
    user_password = req.body.user_password;

    const user = await getUser(account=user_account,password=user_password);
    console.log(user);
    if(typeof(user)!=="undefined"){
        // 建立 Token & setcookie
        const token = jwt.sign({ 
                        user_id:user.user_id, 
                        user_name:user.user_name,
                        user_email:user.user_email,
                        company_id:user.company_id,
                        host_judge: user.host_judge,
                        department_id: user.department_id
                    }, SECRET, { expiresIn: '1 day' })
        res.cookie('token', token, { httpOnly: true });
        res.status(200).send({
            ok:true
        });
    }else{
        res.send({
            error:true,
            message:"帳號密碼錯誤，請再次確認"
        });
    }
    
    
})


// routing for pattern
app.delete("/logout",(req,res) => {
    res.cookie('token', '', { maxAge: -1 });
    res.status(200).send({
        ok:true
    });
});



// // 1)============================  讀登入時的all改動loadSignatureParticipate請求，連線RDS取出跟自己相關且狀態為""的簽呈    ============================
const getMainPageSignatures = database.getMainPageSignatures;
app.get("/main/signature/all", async (req,res) => {
    const token = req.cookies.token;
    if (!token) {
        res.send({
            error:true,
            message:"使用了不合法的token"
        });
        return
    }

    try{
        const decoded = jwt.verify(token, SECRET);
        const userName = decoded.user_name;
        const userId = decoded.user_id;
        const companyId = decoded.company_id;
        // console.log(decoded);
        const dealResult = await getMainPageSignatures(userId,companyId);
        // console.log(dealResult);
        res.send({
                userName:userName,
                userId:userId,
                ok:true,
                data:dealResult
            });
    }
    catch(error){
        console.log(error.message);
    }
});



// //============  manager檢查權限    ============
const getManagerJudge = database.getManagerJudge;
app.get("/main/managerjudge", async (req,res) => {
    const token = req.cookies.token;
    if (!token) {
        res.send({
            error:true,
            message:"使用了不合法的token"
        });
        return
    }
    try{
        const decoded = jwt.verify(req.cookies.token, SECRET);
        const userId = decoded.user_id;
        const managerJudge = await getManagerJudge(userId);
        // console.log(decoded);
        
        
        res.send({
            managerJudge:managerJudge[0]
            });
    }
    catch(error){
        console.log(error.message);
    }
});




// //============  manager獲得管理公司名單    ============
const getManagerCompanys = database.getManagerCompanys;
app.get("/main/manager/company", async (req,res) => {
    try{
        const decoded = jwt.verify(req.cookies.token, SECRET);
        const userId = decoded.user_id;
        
        const doGetManagerCompanys = await getManagerCompanys(userId);
        console.log("doGetManagerCompanys: ",doGetManagerCompanys);
        
        res.send({
            ok:true,
            managerCompanys:doGetManagerCompanys
            });
    }
    catch(error){
        console.log(error.message);
    }
});

// //============  manager獲得該管理公司的部門名單    ============
const getManagerCompanyId = database.getManagerCompanyId;
const getManagerDepartments = database.getManagerDepartments;
app.put("/main/manager/department", async (req,res) => {
    try{
        const decoded = jwt.verify(req.cookies.token, SECRET);
        const userId = decoded.user_id;
        const companyName = req.body.companyName;

        //先獲得公司ID

        const doGetManagerCompanyId = await getManagerCompanyId(companyName);
        const managerCompanyId = doGetManagerCompanyId[0].company_id;

        const doGetManagerDepartments = await getManagerDepartments(managerCompanyId);
        // console.log(doGetManagerDepartments);
        res.send({
            ok:true,
            managerDepartments:doGetManagerDepartments
            });
    }
    catch(error){
        console.log(error.message);
    }
});


// //============  manager獲得該管理公司部門的人員名單    ============
const judgeCompanyNameAndDepartmentName = database.judgeCompanyNameAndDepartmentName;
const getManagerDepartmentId = database.getManagerDepartmentId;
const getManagerDepartmentUsers = database.getManagerDepartmentUsers;
app.put("/main/manager/user", async (req,res) => {
    try{
        const decoded = jwt.verify(req.cookies.token, SECRET);
        const userId = decoded.user_id;
        const companyName = req.body.companyName;
        const departmentName = req.body.departmentName;

        //確認部門是否屬於該公司
        const doJudgeCompanyNameAndDepartmentName = await judgeCompanyNameAndDepartmentName(companyName,departmentName);
        if(doJudgeCompanyNameAndDepartmentName.length==0){
            res.send({
                error:true,
                message:"該公司並沒有這個部門，請再次確認。"
                });
            return
        }


        //獲得該人員管理的部門id
        const doGetManagerDepartmentId = await getManagerDepartmentId(userId,companyName,departmentName);

        const managerDepartmentId = doGetManagerDepartmentId[0].department_id;

        const doGetManagerDepartmentUsers = await getManagerDepartmentUsers(managerDepartmentId);
        // console.log(doGetManagerDepartmentUsers);
        res.send({
            ok:true,
            managerUsers:doGetManagerDepartmentUsers
            });
    }
    catch(error){
        console.log(error.message);
    }
});


// //============  點擊 創建公司 選項    ============
const checkCompanyMain = database.checkCompanyMain;
const inserIntoCompanyMain = database.inserIntoCompanyMain;
const inserIntoCompanyManager = database.inserIntoCompanyManager;
app.put("/main/manager/company/insert", async (req,res) => {
    try{
        const decoded = jwt.verify(req.cookies.token, SECRET);
        const userId = decoded.user_id;
        const companyName = req.body.companyName;
        const doCheckCompanyMain = await checkCompanyMain(companyName);
        if(doCheckCompanyMain[0]){
            res.send({
                error:true,
                message:"創建失敗，公司名稱重複。"
            });
            return
        }
        //  ===============     manager insertIntocompanyMain創建公司
        const doInserIntoCompanyMain = await inserIntoCompanyMain(companyName);
        const insertCompanyId = doInserIntoCompanyMain.insertId
        console.log(insertCompanyId);
        //  ===============     manager insertIntocompanyManager建立管理者對應表
        const doInserIntoCompanyManager = await inserIntoCompanyManager(insertCompanyId,userId);
        res.send({
            ok:true,
            message:"創建成功"
            });
    }
    catch(error){
        console.log(error.message);
    }
});


// //============  點擊 創建部門 選項    ============
const checkCompanyDepartment = database.checkCompanyDepartment;
const insertIntoCompanyDepartment = database.insertIntoCompanyDepartment;
app.put("/main/manager/department/insert", async (req,res) => {
    try{
        const decoded = jwt.verify(req.cookies.token, SECRET);
        const userId = decoded.user_id;
        const companyName = req.body.companyName;
        const departmentName = req.body.departmentName;
        const doCheckCompanyDepartment = await checkCompanyDepartment(companyName,departmentName);
        
        if(doCheckCompanyDepartment[0]){
            res.send({
                error:true,
                message:"創建失敗，公司內已經有此部門。"
            });
            return
        }
        //  ===============     manager 獲得公司ID
        const doCheckCompanyMain = await checkCompanyMain(companyName);
        const companyId = doCheckCompanyMain[0].company_id;

        // //  ===============     manager insertIntoCompanyDepartment建立部門
        const doInsertIntoCompanyDepartment = await insertIntoCompanyDepartment(companyId,departmentName);
        res.send({
            ok:true,
            message:"創建成功"
            });
    }
    catch(error){
        console.log(error.message);
    }
});



// //============  點擊 創建人員 按鍵    ============
const checkAccountPassword = database.checkAccountPassword;
const getCompanyId = database.getCompanyId;
const checkName = database.checkName;
const inserIntoUserPrivate = database.inserIntoUserPrivate;
app.put("/main/manager/private/insert", async (req,res) => {
    try{
        const companyName = req.body.companyName;
        const departmentName = req.body.departmentName;
        const userName = req.body.userName;
        const userAccount = req.body.userAccount;
        const userPassword = req.body.userPassword;
        const userEmail = req.body.userEmail;
        
        //是否有重複的帳號密碼
        const doCheckAccountPassword = await checkAccountPassword(userAccount,userPassword);
        if(doCheckAccountPassword.length==1){
            res.send({
                error:true,
                message:"此組帳號密碼已被創建過，請更換!!!"
            });
            return
        }

        //是否有重複的email
        const doCheckEmail = await checkEmail(userEmail);
        if(doCheckEmail.length==1){
            res.send({
                error:true,
                message:"此組信箱已被創建過，請更換!!!"
            });
            return
        }

        
        //取得公司companyId
        const doGetCompanyId = await getCompanyId(companyName);
        const companyId = doGetCompanyId[0].company_id;

        
        //取得部門departmentId
        let departmentId="";
        for(let i=0;i<doGetCompanyId.length;i++){
            if(doGetCompanyId[i].department_name==departmentName){
                departmentId=doGetCompanyId[i].department_id;
            }
        }

        //這間公司是否有重複名字的人員
        const doCheckName = await checkName(companyId,userName);
        if(doCheckName.length==1){
            res.send({
                error:true,
                message:"這間公司存在重複名字的人員，可以在名字後面加上部門或編號!!!"
            });
            return
        }
        
        // //點擊 創建人員 按鍵 寫入註冊人員
        
        const doInserIntoUserPrivate = await inserIntoUserPrivate(
                            userName,userAccount,userPassword,
                            userEmail,companyId,departmentId
                            );
        res.send({
            ok:true,
            message:"完成創建人員。"
        });
        return
    }
    catch(error){
        console.log(error.message);
    }
});




//=================  取得搜尋subject的資料
const searchSubject = database.searchSubject;
app.put("/main/search", async (req,res) => {
    try{
        const decoded = jwt.verify(req.cookies.token, SECRET);
        const userId = decoded.user_id;
        const instantText = req.body.instantText;
        const judgeOfInputSearch = req.body.judgeOfInputSearch;
        let endTime="";
        if(judgeOfInputSearch=="processing"){
            endTime="";
        }else{
            endTime=":";
        }
        const doSearchSubject = await searchSubject(instantText,endTime,userId);
        console.log(doSearchSubject);
        res.send({
            ok:true,
            doSearchSubject:doSearchSubject
        });
        return
    }
    catch(error){
        console.log(error.message);
    }
});







//============      按下撰寫功能時取得人員資料  ================
const getDepartmentInformation = database.getDepartmentInformation;
app.get("/main/write/information",async(req,res) => {
    const decoded = jwt.verify(req.cookies.token, SECRET);
    const userId = decoded.user_id;
    const companyId = decoded.company_id;
    try{
        const departmentInformations = await getDepartmentInformation(companyId);
        const userNameList=[];
        const userIdList=[];
        //------    取得userNameList
        for(let i=0;i<departmentInformations.length;i++){
            if(departmentInformations[i].user_id !== userId){
                userNameList.push(departmentInformations[i].user_name);
                userIdList.push(departmentInformations[i].user_id);
            }
        }

        // ------    取得departmentList & 對照表
        const groupedData = departmentInformations.reduce((acc, curr) => {
            const { department_name } = curr;
            if (!acc[department_name]) {
                acc[department_name] = [];
            }
            acc[department_name].push(curr);
            return acc;
        }, {});
        const departmentList=Object.keys(groupedData);

        res.send({
            userId:userId,
            userName:decoded.user_name,
            ok:true,
            departmentList:departmentList,
            groupedData:groupedData,
            userNameList:userNameList,
            userIdList:userIdList
        });
    }
    catch(error){
        console.log(error.message);
    }
});



//=================================     模擬寫入功能    ==============
app.put("/main/write", async (req,res) => {
    const getAllUserIdToUserName = database.getAllUserIdToUserName;
    const insertIntoMain = database.insertIntoMain;
    const insertIntoVersionContent = database.insertIntoVersionContent;

    const insertIntoTurnPerson = database.insertIntoTurnPerson;
    const insertIntoParticipate = database.insertIntoParticipate;
    const updateInParticipate = database.updateInParticipate;
    
    const decoded = jwt.verify(req.cookies.token, SECRET);
    const userId = decoded.user_id;
    const companyId = decoded.company_id;
    const write = req.body;
    // const fileUrl = req.body.file;
    // console.log(fileUrl);

    // // =========    先取得user_id與user_name的對照，將user_name的map轉為user_id的map
    const mapOfRecipientName=write.map;
    const mapOfAllParticipantId=[];
    mapOfAllParticipantId.push(userId);
    try{
        // =========    先取得所有同公司的user_id與user_name的對照
        const allDict = await getAllUserIdToUserName(companyId);
        for(let i=0;i<mapOfRecipientName.length;i++){
            for(let j=0;j<allDict.length;j++){
                if(mapOfRecipientName[i]===allDict[j].user_name){
                    mapOfAllParticipantId.push(allDict[j].user_id);
                }
            }
        }

        // =========    寫入signature_main  ==========
        const doInsertIntoMain = await insertIntoMain(subject=write.subject,startTime=write.startTime,userId);
        const signatureId = doInsertIntoMain.insertId;


        // =========    寫入signature_version_content  ==========
        // =========    先取得轉換為AWS S3 cloudfront形式的檔案連結
        let doDealAwsS3 = "";
        if(req.body.file){
            doDealAwsS3 = await dealAwsS3(fileUrl=req.body.file);
        }
        
        const doInsertIntoVersionContent = await insertIntoVersionContent(signatureId,text=write.text,file=doDealAwsS3);

        // =========    寫入signatureId和turnPerson到signature_turn_person  ==========
        const turnPersonId = mapOfAllParticipantId[1];
        const doInsertIntoTurnPerson = await insertIntoTurnPerson(signatureId,turnPersonId);
        // =========    寫入signature_participate  ==========
        for(let i=0;i<mapOfAllParticipantId.length;i++){
            let participantId = mapOfAllParticipantId[i];
            let doInsertIntoParticipate =  await insertIntoParticipate(signatureId,participantId);
        }
        // =========    更新第一筆signature_participate為pass  ==========
        const timeNow=getTime()
        const doUpdateInParticipate =  await updateInParticipate(signatureId,userId,processingTime=timeNow);
        
    }
    catch(error){
        console.log(error.message);
    }
})



//==================    處理aws s3

function dealAwsS3(fileUrl){
    return new Promise((resolve, reject) => {
        const pictureUrl = fileUrl;
        const type = pictureUrl.match(/data:(.*);base64/)[1];
        const imageBuffer = Buffer.from(pictureUrl.replace(/^data:image\/\w+;base64,/, ""), 'base64');

        const region = process.env.AWS_region;
        const bucketName = process.env.AWS_S3_bucketName;
        const accessKeyId = process.env.AWS_accessKeyId;
        const secretAccessKey = process.env.AWS_secretAccessKey;
        AWS.config.update({
            accessKeyId : accessKeyId,
            secretAccessKey : secretAccessKey,
            region : region
        })
        const s3 = new AWS.S3();
        
        function _uuid() {
            var d = Date.now();
            if (typeof performance !== 'undefined' && typeof performance.now === 'function'){
              d += performance.now(); //use high-precision timer if available
            }
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
              var r = (d + Math.random() * 16) % 16 | 0;
              d = Math.floor(d / 16);
                return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
            });
        }

        const s3PictureName = _uuid();
        const params = {
            Bucket : bucketName,
            Key : `pictures/${s3PictureName}`,
            Body : imageBuffer,
            ContentEncoding : "base64",
            ContentType : type
        }

        // 上傳的部分
        try {
            s3.upload(params,(err,) => {
                if(err){
                    console.log(err);
                    reject("上傳s3失敗");
                }else{
                    // ==============  成功上傳S3轉cloudFront型式 ==============
                    const RDSUrl = "doumq0p9cu8fw.cloudfront.net" + `/pictures/${s3PictureName}`;
                    resolve(RDSUrl);
                }
                
            })
        } catch (err) {
            console.log("error", err);
            reject("上傳s3失敗");
        }
    });
}






app.put("/getData", async (req,res) => {
    try{
        const graphicMessage = req.body;
        const comment = graphicMessage.comment;
        const pictureUrl = graphicMessage.pictureUrl;
        console.log(pictureUrl);
        //=======   圖文缺一不可    =======
        if(comment == "" || pictureUrl == ""){
            res.send({"error" : true ,"message":"圖文缺一不可"})
            return
        }

        const type = pictureUrl.match(/data:(.*);base64/)[1];
        const imageBuffer = Buffer.from(pictureUrl.replace(/^data:image\/\w+;base64,/, ""), 'base64');


        console.log("type",type);
        console.log("imageBuffer",imageBuffer);
        const region = process.env.AWS_region;
        const bucketName = process.env.AWS_S3_bucketName;
        const accessKeyId = process.env.AWS_accessKeyId;
        const secretAccessKey = process.env.AWS_secretAccessKey;
        AWS.config.update({
            accessKeyId : accessKeyId,
            secretAccessKey : secretAccessKey,
            region : region
        })
        const s3 = new AWS.S3();
        
        function _uuid() {
            var d = Date.now();
            if (typeof performance !== 'undefined' && typeof performance.now === 'function'){
              d += performance.now(); //use high-precision timer if available
            }
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
              var r = (d + Math.random() * 16) % 16 | 0;
              d = Math.floor(d / 16);
                return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
            });
        }


        const s3PictureName = _uuid();
        const params = {
            Bucket : bucketName,
            Key : `pictures/${s3PictureName}`,
            Body : imageBuffer,
            ContentEncoding : "base64",
            ContentType : type
        }

        // 上傳的部分
        s3.upload(params,(err,) => {
            if(err){
                console.log(err);
                res.send({"error" : true, "message" : "上傳s3失敗"})
            }else{
                // ==============  成功上傳S3轉cloudFront型式 ==============
                RDSUrl = "doumq0p9cu8fw.cloudfront.net" + `/pictures/${s3PictureName}`;
                console.log(RDSUrl);
                // ==============  RDS ==============
                // deliverToRDS(RDSUrl,comment);

                // res.send({
                //     "response_code" : 200,
                //     "response_message" : "Success",
                //     "response_data" : {
                //                         "graphic" : RDSUrl,
                //                         "message" : comment
                //                     },
                //     // "response_RDSUrl" : RDSUrl,
                //     // "response_comment" : comment
                // })
            }
            
        })
    }
    catch{
        console.log("error");
    }
});


//  ========    圖文上傳RDS     =======

function deliverToRDS(RDSUrl,comment){
    try{
        const connection = mysql.createConnection({
            host: process.env.host,
            port : process.env.port,
            user: process.env.user,
            password: process.env.password,
            database : process.env.database
        });
        connection.connect(function(err) {
            if (err) throw err;
            var sql = "INSERT INTO graphicMessageTable (graphic,message) VALUES ('"+RDSUrl+"','"+comment+"')";
            connection.query(sql, function (err, result) {
                if (err) throw err;
                console.log("1 record inserted");
            });
            connection.end();
        });
    }
    catch{
        console.log("deliverToRDS上傳失敗");
        res.send({"error" : true, "message" : "deliverToRDS上傳失敗"})
    }
}











//============================      main點擊時讀取singleSignature
const getContentBySignatureId = database.getContentBySignatureId;
app.get("/main/signature/single",async(req,res) => {
    const decoded = jwt.verify(req.cookies.token, SECRET);
    const userId = decoded.user_id;
    const signatureId = req.query.clickId;
    
    try{
        const dealResult = await getContentBySignatureId(signatureId).catch(e => console.log(e.message));
        console.log(dealResult);
        res.send({
                userId:userId,
                ok:true,
                data:dealResult
            });
    }
    catch(error){
        console.log(error.message);
    }
});



//============================      singleSignature中點擊查看簽呈動態
const getSignatureDynamic = database.getSignatureDynamic;
const getSignatureFinalState = database.getSignatureFinalState;
app.get("/main/signature/single/dynamic",async(req,res) => {
    try{
        const signatureId = req.query.signatureId;
        //檢查該筆是不是已經被終結
        const signatureFinalState = await getSignatureFinalState(signatureId);
        // console.log(signatureFinalState[0].final_state);
        if(signatureFinalState[0].final_state==""){
            const signatureDynamic = await getSignatureDynamic(signatureId);
            res.send({
                ok:true,
                data:signatureDynamic,
            });
        }else{
            res.send({
                error:true,
                message:"簽呈已被終結",
            });

        }
        
    }
    catch(error){
        console.log(error.message);
    }
});


//============================      獲得當下時間
function getTime(){
    const today =new Date();
    const year = today.getFullYear();
    const month = ('0' + (today.getMonth() + 1)).slice(-2);
    const day = ('0' + today.getDate()).slice(-2);
    const hours = ('0' + today.getHours()).slice(-2);
    const minutes = ('0' + today.getMinutes()).slice(-2);
    const date = year + " " + month + "/" + day + " " + hours + ":" + minutes;
    return date;
}



//============================      singleSignature中點擊同意不同意等操作

app.put("/main/signature/single/confirm",async(req,res) => {
    const getParticipateConfirmList = database.getParticipateConfirmList;
    const updatePassInParticipate = database.updatePassInParticipate;
    const updateFinalStateInMain = database.updateFinalStateInMain;
    const deleteRecordInTurnPerson = database.deleteRecordInTurnPerson;
    const updateRecordInTurnPerson = database.updateRecordInTurnPerson;
    const updateDisagreeInParticipate = database.updateDisagreeInParticipate;
    const updateVersionContent = database.updateVersionContent;
    
    const signatureId = req.body.signatureId;
    // const time=getTime();
    
    
    if(req.body.confirm=='agree'){    
        
        //=============     取得該簽呈編號仍未處置的清單
        try{
            const dealResult = await getParticipateConfirmList(signatureId);

            //===========   如果是最後一位  =======
            if(dealResult.length===1){
                
                const lastSequenceNum=dealResult[0].sequence_num;
                //============  更新signature_participate處置方法，並寫入處置時間  =======
                const timeNow=getTime();
                const updateParticipate = await updatePassInParticipate(sequenceNum=lastSequenceNum,time=timeNow);

                // //============  更新signature_main最終狀態，並寫入終止時間  =======
                const updateMain = await updateFinalStateInMain(signatureId,finalState="pass",processingTime=timeNow);
                //============  刪除signature_turn_person紀錄  =======
                const deleteResult = await deleteRecordInTurnPerson(signatureId);
            }else{
            //===========   如果不是最後一位  =======
                const timeNow=getTime();
                const nowSequenceNum=dealResult[0].sequence_num;
                // console.log(nowSequenceNum);
                const nextTurnPerson=dealResult[1].user_id;
                // console.log(nextTurnPerson);
                //============  更新signature_participate  =======
                const updateParticipate = await updatePassInParticipate(sequenceNum=nowSequenceNum,time=timeNow).catch(e => console.log(e.message));
                //============  更新signature_turn_person  =======
                const updateTurnPerson = await updateRecordInTurnPerson(signatureId,turnPerson=nextTurnPerson).catch(e => console.log(e.message));
            }
        }
        catch(error){
            console.log(error.message);
        }
        
    }else if (req.body.confirm=='disagree'){
        try{
            //============  將signature_main填入disagree最終狀態  =======
            const timeNow=getTime();
            const updateMainFinalState = await updateFinalStateInMain(signatureId,finalState="disagree",processingTime=timeNow);
            //============  刪除signature_turn_person紀錄  =======
            const deleteResult = await deleteRecordInTurnPerson(signatureId);
            //============  更新剩餘signature_participate為disagree  =======
            const updateDisagreeResult = await updateDisagreeInParticipate(signatureId,processingTime=timeNow);
            //============  更新signature_version_content不通過的原因  =======
            const reason = req.body.reason;
            const doUpdateVersionContent = await updateVersionContent(signatureId,getReason=reason);
        }
        catch(error){
            console.log(error.message);
        }
    }
})




//==================    點擊歷史紀錄

const getAllHistoryByUserId = database.getAllHistoryByUserId;
app.get("/main/signature/history",async(req,res) => {
    try{
        const decoded = jwt.verify(req.cookies.token, SECRET);
        const userId = decoded.user_id;
        const historys = await getAllHistoryByUserId(userId);
        console.log(historys);
        res.send({
            ok:true,
            historys:historys,
            userId:userId
        });
    }
    catch(error){
        console.log(error.message);
    }
    
})


//============================      點擊時讀取historySingleSignature
const getSingleSignature = database.getSingleSignature;
app.get("/main/signature/historySingle",async(req,res) => {
    try{
        const decoded = jwt.verify(req.cookies.token, SECRET);
        const user_id = decoded.user_id;
        const signatureId = req.query.clickId;
        // console.log(user_id);
        const singleSignature = await getSingleSignature(signatureId);
        console.log(singleSignature);
        res.send({
            userId:user_id,
            ok:true,
            data:singleSignature,
        });
    }
    catch(error){
        console.log(error.message);
    }

});

app.get("/main/signature/single/dynamicHistory",async(req,res) => {
    try{
        const signatureId = req.query.signatureId;
        console.log("history1");
        const signatureDynamic = await getSignatureDynamic(signatureId);
        
        res.send({
            ok:true,
            data:signatureDynamic,
        });
    //.substr(0,10)
    }
    catch(error){
        console.log(error.message);
    }
});





app.listen(3000, () => {
    console.log("Server is running on port 3000.");
});






// //  ========    RDS抓取圖文     =======
// function selectAllGraphicMessage(){
//     try{
//         console.log("抓");
//         const connection = mysql.createConnection({
//             host: process.env.host,
//             port : process.env.port,
//             user: process.env.user,
//             password: process.env.password,
//             database : process.env.database
//         });
//         var sql = "SELECT * FROM graphicMessageTable";
//         connection.query(sql,function(err,result){
//             if(err){
//                 console.log(err.message);
//                 return;
//             }
//             console.log('--------------------------SELECT----------------------------');
//             // console.log(result);
//             return result
//             console.log('------------------------------------------------------------\n\n');
//         });
//         connection.end();
//     }
//     catch{
//         console.log("deliverToRDS上傳失敗");
//         res.send({"error" : true, "message" : "deliverToRDS上傳失敗"})
//     }
// }



// const mysql = require('mysql');
// const connection = mysql.createConnection({
//     host: process.env.host,
//     user: process.env.user,
//     port : 3306,
//     password: process.env.password,
//     database: process.env.database
// });

// connection.connect();
 
// connection.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
//   if (error) throw error;
//   console.log('The solution is: ', results[0].solution);
// }
// connect.end();

// );

//===============
// const mysql = require('mysql');

// const connection = mysql.createConnection({
//     host: process.env.host,
//     user: process.env.user,
//     password: process.env.password,
//     port : 3306
// });
// connection.connect();
// connection.connect(function(err) {
//   if (err) throw err;
//   console.log("Connected!");
//   connection.query("CREATE DATABASE mydb", function (err, result) {
//     if (err) throw err;
//     console.log("Database created");
//   });
// });
// connection.end();
// connection.connect();
 
// connection.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
//   if (error) throw error;
//   console.log('The solution is: ', results[0].solution);
// });


// connection.end();



// //============================= 以下修改


// const connection = mysql.createConnection({
//     host: process.env.host,
//     user: process.env.user,
//     password: process.env.password,
//     port : 3306
// });


// const mysql = require('mysql');
// function createConnection(){
//     const connection = mysql.createConnection({
//         host: process.env.host,
//         user: process.env.user,
//         password: process.env.password,
//         port : 3306
//     })
//     return connection;
// }
// module.exports.createConnection = createConnection;







// //==================================
// const { ReplicationTimeStatus } = require("@aws-sdk/client-s3");




// function uploadData(req){
//     const data = req.body;
//     const comment = data.comment;
//     const pictureUrl = data.pictureUrl;
//     // console.log(pictureUrl);
//     const type = pictureUrl.match(/data:(.*);base64/)[1];
//     console.log(type);
//     // console.log(pictureUrl);
//     const imageBuffer = Buffer.from(pictureUrl.replace(/^data:image\/\w+;base64,/, ""), 'base64');
//     // console.log(imageBuffer);
//     // const type = imageBuffer;
//     // console.log(type);
//     // console.log(imageBuffer.split(";")[0]);

//     // const region = process.env.AWS_region;
//     // const bucketName = process.env.AWS_S3_bucketName;
//     // const accessKeyId = process.env.AWS_accessKeyId;
//     // const secretAccessKey = process.env.AWS_secretAccessKey;
    
//     // const s3 = new AWS.S3({
//     //     accessKeyId: accessKeyId,
//     //     secretAccessKey: secretAccessKey,
//     // });

//     const time = new Date().getTime();
//     const region = process.env.AWS_region;
//     const bucketName = process.env.AWS_S3_bucketName;
//     const accessKeyId = process.env.AWS_accessKeyId;
//     const secretAccessKey = process.env.AWS_secretAccessKey;

//     AWS.config.update({
//         accessKeyId : accessKeyId,
//         secretAccessKey : secretAccessKey,
//         region : region
//     })

//     const s3 = new AWS.S3();

//     const params = {
//         Bucket : bucketName,
//         Key : "pictures/123",
//         Body : imageBuffer,
//         ContentEncoding : "base64",
//         ContentType : type
//     }

//     s3.upload(params,(err,data) => {
//         if(err){
//             res.send({"error" : true})
//         }else{
//             res.send({
//                 "response_code" : 200,
//                 "response_message" : "Success",
//                 "response_data" : data
//             })
//         }
        
//     })



//     // console.log("GoodDone");
//     // console.log(imageBuffer);
//     // s3.upload({
//     //     Bucket : bucketName,
//     //     Key : "pictures/123",
//     //     Body : imageBuffer,
//     //     ContentEncoding : "base64",
//     //     ContentType : type
//     // })


// }









// //handle diggerent request
// app.get("/",(req,res) => {
//     // res.sendFile(path.join(__dirname,"index.html"));
//     let { wordInput } = req.query;
//     console.log(wordInput);
//     // console.log(req.files);
//     res.render("index.ejs");
// })

// //routing for query
// app.post("/functionForm",(req,res) => {
//     console.log(req.body);
//     console.log(req.files);
//     // let formData = req.body;
//     // res.send("Thanks for posting.");
//     // res.sendFile(path.join(__dirname,"index.html"));
// });





// require('dotenv').config();
// // console.log(process.env.AWS_accessKeyId);
// // You can either "yarn add aws-sdk" or "npm i aws-sdk"
// const AWS = require('aws-sdk');
// // // Configure AWS with your access and secret key.
// const { AWS_accessKeyId, AWS_secretAccessKey, AWS_region, AWS_S3_bucketName } = process.env;
// // // Configure AWS to use promise
// // AWS.config.setPromisesDependency(require('bluebird'));
// AWS.config.update({ accessKeyId: process.env.AWS_accessKeyId, AWS_secretAccessKey: process.env.SECRET_ACCESS_KEY, region: process.env.AWS_region });
// // // Create an s3 instance
// const s3 = new AWS.S3();
// // With this setup, each time your user uploads an image, will be overwritten.
//   // To prevent this, use a different Key each time.
//   // This won't be needed if they're uploading their avatar, hence the filename, userAvatar.js.
// const params = {
//     Bucket: AWS_S3_bucketName,
//     Key: `${userId}.${type}`, // type is not required
//     Body: base64Data,
//     ACL: 'public-read',
//     ContentEncoding: 'base64', // required
//     ContentType: `image/${type}` // required. Notice the back ticks
// }




