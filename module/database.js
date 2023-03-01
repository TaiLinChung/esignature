const mysql = require('mysql2/promise');
const { resolve } = require('path');

const dotenv = require('dotenv');
dotenv.config();

const pool = mysql.createPool({
    host: process.env.host,
    port : process.env.port,
    user: process.env.user,
    password: process.env.password,
    database : process.env.database
});



async function checkEmail(email){
    try{
        const result = await pool.query(`
        SELECT * 
        FROM user_private 
        WHERE 
        user_email = ?
        `,[email])
        const rows = result[0];
        return rows
    }
    catch(error){
        console.log(error.message);
    }
}


async function insertIntoUserPrivate(userName,account,
                                    password,email
                                    ,companyId,managerJudge,
                                    departmentId,
                                    ){
    try{
        const result = await pool.query(`
        INSERT INTO user_private
        (
            user_name,
            user_account,
            user_password,
            user_email,
            company_id,
            manager_judge,
            department_id
        ) 
        VALUES (?,?,?,?,?,?,?);
        `,
        [
            userName,
            account,
            password,
            email,
            companyId,
            managerJudge,
            departmentId,
        ])
        
        const rows = result[0];
        return rows
    }
    catch(error){
        console.log(error.message);
    }
}







async function getUser(account,password){
    try{
        const result = await pool.query(`
        SELECT * 
        FROM user_private 
        WHERE user_account = ? 
        and user_password = ?
        `,[account,password])
        const rows = result[0];
        return rows[0]
    }
    catch(error){
        console.log(error.message);
    }
}

// //========  manager檢查權限    ======
async function getManagerJudge(userId){
    try{
        const result = await pool.query(`
        SELECT manager_judge
        FROM user_private
        WHERE user_id = ?
        `,[userId])
        const rows = result[0];
        return rows
    }
    catch(error){
        console.log(error.message);
    }
        
}

// //============  manager獲得管理的公司名單    ======
async function getManagerCompanys(userId){
    try{
        const result = await pool.query(`
        SELECT *
        FROM company_manager
        INNER JOIN 
        company_main on
        company_manager.company_id=
        company_main.company_id
        WHERE manager_id = ?
        `,[userId])
        const rows = result[0];
        return rows
    }
    catch(error){
        console.log(error.message);
    }
        
}

// //============  manager獲得管理公司的部門ID    ======
async function getManagerCompanyId(companyName){
    try{
        const result = await pool.query(`
        SELECT *
        FROM company_main
        WHERE company_name = ?
        `,[companyName])
        const rows = result[0];
        return rows
    }
    catch(error){
        console.log(error.message);
    }
        
}






// //============  manager獲得ID公司的部門名單    ======
async function getManagerDepartments(managerCompanyId){
    try{
        const result = await pool.query(`
        SELECT department_name
        FROM company_department
        WHERE company_id = ?
        `,[managerCompanyId])
        const rows = result[0];
        return rows
    }
    catch(error){
        console.log(error.message);
    }
        
}

// //============  manager//確認部門是否屬於該公司    ============
async function judgeCompanyNameAndDepartmentName(companyName,departmentName){
    try{
        const result = await pool.query(`
        SELECT *
        FROM company_main
        INNER JOIN 
        company_department on
        company_main.company_id=
        company_department.company_id
        WHERE company_main.company_name = ?
        and company_department.department_name = ?
        `,[companyName,departmentName])
        const rows = result[0];
        return rows
    }
    catch(error){
        console.log(error.message);
    }
        
}






// //============  manager獲得該人員管理的部門id    ============
async function getManagerDepartmentId(userId,companyName,departmentName){
    try{
        const result = await pool.query(`
        SELECT *
        FROM company_manager
        INNER JOIN 
        company_main on
        company_manager.company_id=
        company_main.company_id
        INNER JOIN 
        company_department on
        company_manager.company_id=
        company_department.company_id
        WHERE company_manager.manager_id = ?
        and company_main.company_name = ?
        and company_department.department_name = ?
        `,[userId,companyName,departmentName])
        const rows = result[0];
        return rows
    }
    catch(error){
        console.log(error.message);
    }
        
}





// //============  manager獲得該管理公司部門的人員名單    ======
async function getManagerDepartmentUsers(managerDepartmentId){
    try{
        const result = await pool.query(`
        SELECT user_name
        FROM user_private
        WHERE department_id = ?
        `,[managerDepartmentId])
        const rows = result[0];
        return rows
    }
    catch(error){
        console.log(error.message);
    }
        
}


// //============  manager檢查公司是否已經被創建過    ======
async function checkCompanyMain(companyName){
    try{
        const result = await pool.query(`
        SELECT *
        FROM company_main
        WHERE company_name = ?
        `,[companyName])
        const rows = result[0];
        return rows
    }
    catch(error){
        console.log(error.message);
    }
        
}



// //============  manager insertIntocompanyMain創建公司    ======
async function inserIntoCompanyMain(companyName){
    try{
        const result = await pool.query(`
        INSERT INTO company_main
        (company_name) VALUES (?)
        `,[companyName])
        const rows = result[0];
        return rows
    }
    catch(error){
        console.log(error.message);
    }
        
}

// //============  manager insertIntocompanyManager建立管理者對應表    ======
async function inserIntoCompanyManager(insertCompanyId,userId){
    try{
        const result = await pool.query(`
        INSERT INTO company_manager
        (company_id,manager_id) VALUES (?,?)
        `,[insertCompanyId,userId])
        const rows = result[0];
        return rows
    }
    catch(error){
        console.log(error.message);
    }
        
}

// //============  manager檢查部門是否已經被創建過    ======
async function checkCompanyDepartment(companyName,departmentName){
    try{
        const result = await pool.query(`
        SELECT *
        FROM company_main
        INNER JOIN
        company_department ON
        company_main.company_id=
        company_department.company_id
        WHERE company_main.company_name = ?
        and company_department.department_name = ?
        `,[companyName,departmentName])
        const rows = result[0];
        return rows
    }
    catch(error){
        console.log(error.message);
    }
        
}


// //============  manager insertIntoCompanyDepartment建立部門    ======
async function insertIntoCompanyDepartment(companyId,departmentName){
    try{
        const result = await pool.query(`
        INSERT INTO company_department
        (company_id,department_name) VALUES (?,?)
        `,[companyId,departmentName])
        const rows = result[0];
        return rows
    }
    catch(error){
        console.log(error.message);
    }
        
}



// //============  是否有重複的帳號密碼     ============
async function checkAccountPassword(userAccount,userPassword){
    try{
        const result = await pool.query(`
        SELECT user_name
        from user_private 
        where user_account = ?
        and user_password = ?
        `,[userAccount,userPassword])
        const rows = result[0];
        return rows
    }
    catch(error){
        console.log(error.message);
    }
        
}


// //============  取得CompanyId     ============
async function getCompanyId(companyName){
    try{
        const result = await pool.query(`
        SELECT * from
        company_main
        INNER JOIN
        company_department 
        ON company_main.company_id
        = company_department.company_id
        where company_main.company_name = ?
        `,[companyName])
        const rows = result[0];
        return rows
    }
    catch(error){
        console.log(error.message);
    }
        
}


// //============  這間公司是否有重複名字的人員     ============
async function checkName(companyId,userName){
    try{
        const result = await pool.query(`
        SELECT *
        from user_private 
        where company_id = ?
        and user_name = ?
        `,[companyId,userName])
        const rows = result[0];
        return rows
    }
    catch(error){
        console.log(error.message);
    }
        
}





// //============  點擊 創建人員 按鍵 寫入註冊人員   ============
async function inserIntoUserPrivate(userName,userAccount,userPassword,
                                    userEmail,companyId,departmentId){
    try{
        const result = await pool.query(`
        INSERT INTO user_private
        (
            user_name,user_account,
            user_password,user_email,
            company_id,manager_judge,
            department_id
        ) VALUES (?,?,?,?,?,0,?)
        `,[userName,userAccount,userPassword,
            userEmail,companyId,departmentId])
        const rows = result;
        return rows
    }
    catch(error){
        console.log(error.message);
    }
        
}


//=================  取得搜尋subject的資料
async function searchSubject(instantText,endTime,userId){
    try{
        const result = await pool.query(`
        SELECT 
        signature_main.signature_id,
        user_private.user_name,
        signature_main.subject,
        signature_main.start_time
        FROM signature_main
        INNER JOIN user_private
        ON  signature_main.initiator=
        user_private.user_id
        INNER JOIN signature_participate
        ON  signature_main.signature_id=
        signature_participate.signature_id
        where signature_main.subject LIKE 
        CONCAT('%', ?, '%')
        and signature_main.end_time LIKE 
        CONCAT('%', ?, '%')
        and signature_participate.user_id = ?
        `,[instantText,endTime,userId])
        const rows = result[0];
        return rows
    }
    catch(error){
        console.log(error.message);
    }
        
}







//=================  取得main分頁上簽呈進行中預設的資料
async function getMainPageSignatures(userId,companyId){
    try{
        const result = await pool.query(`
        SELECT *
        FROM signature_main
        INNER JOIN user_private ON
        signature_main.initiator =
        user_private.user_id
        INNER JOIN signature_participate ON
        signature_main.signature_id =
        signature_participate.signature_id
        INNER JOIN signature_turn_person ON
        signature_main.signature_id =
        signature_turn_person.signature_id
        WHERE signature_participate.user_id = ?
        and user_private.company_id = ?
        and signature_main.final_state = ""
        `,[userId,companyId])
        const rows = result[0];
        return rows
    }
    catch(error){
        console.log(error.message);
    }
        
}

//=================  點擊main分頁上簽呈進行中的某筆資料
async function getContentBySignatureId(signatureId){
    try{
        const result = await pool.query(`
        SELECT * FROM signature_main
        INNER JOIN signature_turn_person
        ON signature_main.signature_id=
        signature_turn_person.signature_id
        INNER JOIN signature_version_content
        ON signature_main.signature_id=
        signature_version_content.signature_id
        INNER JOIN user_private
        ON signature_main.initiator=
        user_private.user_id
        WHERE signature_main.signature_id =?
        and signature_main.final_state = ?;
        `,[signatureId,""])
        const rows = result[0];
        return rows
    }
    catch(error){
        console.log(error.message);
    }
}


//=============     檢查該筆是不是已經被終結
async function getSignatureFinalState(signatureId){
    try{
        const result = await pool.query(`
        SELECT final_state FROM 
        signature_main
        WHERE signature_id = ? 
        `,[signatureId])
        const rows = result[0];
        return rows
    }
    catch(error){
        console.log(error.message);
    }
}



//=============     取得該簽呈編號仍未處置的簽呈動態清單
async function getSignatureDynamic(signatureId){
    try{
        const result = await pool.query(`
        SELECT user_private.user_name,
        signature_participate.confirm ,
        signature_participate.processing_time
        FROM 
        signature_participate 
        INNER JOIN user_private
        ON signature_participate.user_id=
        user_private.user_id
        WHERE signature_participate.signature_id = ? 
        `,[signatureId])
        const rows = result[0];
        return rows
    }
    catch(error){
        console.log(error.message);
    }
}








//=============     取得該簽呈編號仍未處置的清單
async function getParticipateConfirmList(signatureId){
    try{
        const result = await pool.query(`
        SELECT *FROM signature_participate
        WHERE signature_id=? and confirm=?
        `,[signatureId,""])
        const rows = result[0];
        return rows
    }
    catch(error){
        console.log(error.message);
    }
}



//===========   對sequence_num，寫入PASS
async function updatePassInParticipate(sequenceNum,time){
    try{
        const result = await pool.query(`
        UPDATE signature_participate
        SET confirm = 'pass',
        processing_time = ?
        WHERE sequence_num=?
        `,[time,sequenceNum])
        const rows = result[0];
        return rows
    }
    catch(error){
        console.log(error.message);
    }
}


//===========   更新main的finalState
async function updateFinalStateInMain(signatureId,finalState,processingTime){
    try{
        const result = await pool.query(`
        UPDATE signature_main
        SET final_state = ?,
        end_time = ?
        WHERE signature_id=?
        `,[finalState,processingTime,signatureId])
        const rows = result[0];
        return rows
    }
    catch(error){
        console.log(error.message);
    }
}



//===========   如果是最後一位，取sequence_num，寫入PASS後
//刪除signature_turn_person紀錄
async function deleteRecordInTurnPerson(signatureId){
    try{
        const result = await pool.query(`
        DELETE FROM 
        signature_turn_person
        WHERE signature_id=?
        `,[signatureId])
        const rows = result[0];
        return rows
    }
    catch(error){
        console.log(error.message);
    }
}



//===========   如果不是最後一位，更新participate寫入PASS後
//更新signature_turn_person紀錄
async function updateRecordInTurnPerson(signatureId,turnPerson){
    try{
        const result = await pool.query(`
        update signature_turn_person 
        set turn_person=?
        WHERE signature_id=?
        `,[turnPerson,signatureId])
        const rows = result[0];
        return rows
    }
    catch(error){
        console.log(error.message);
    }
}



//============  更新剩餘signature_participate為disagree  =======
async function updateDisagreeInParticipate(signatureId,processingTime){
    try{
        const result = await pool.query(`
        UPDATE signature_participate
        SET confirm = 'disagree',
        processing_time = ?
        WHERE signature_id=?
        and confirm=""
        `,[processingTime,signatureId])
        const rows = result[0];
        return rows
    }
    catch(error){
        console.log(error.message);
    }
}


//============  更新signature_version_content不通過的原因  =======
async function updateVersionContent(signatureId,getReason){
    try{
        const result = await pool.query(`
        UPDATE signature_version_content
        SET get_response = ?
        WHERE signature_id=?
        and get_response=""
        `,[getReason,signatureId])
        const rows = result[0];
        return rows
    }
    catch(error){
        console.log(error.message);
    }
}






//============  取得所有同公司的user_id與user_name對照  =======
async function getAllUserIdToUserName(companyId){
    try{
        const result = await pool.query(`
        SELECT user_id,user_name
        FROM user_private
        WHERE company_id=?;
        `,companyId)
        const rows = result[0];
        return rows
    }
    catch(error){
        console.log(error.message);
    }
}


// =========    寫入signature_main  ==========
async function insertIntoMain(write,userId){
    try{
        const result = await pool.query(`
        INSERT INTO signature_main
        (
            initiator,
            subject,
            final_state,
            start_time,
            end_time
        )
        VALUES (?,?,?,?,?);
        `,[
            userId,
            write.subject,
            "",
            write.startTime,
            ""
        ])
        const rows = result[0];
        return rows
    }
    catch(error){
        console.log(error.message);
    }
}


// =========    寫入signature_version_content  ==========
async function insertIntoVersionContent(signatureId,write){
    try{
        const result = await pool.query(`
        INSERT INTO signature_version_content
        (
            signature_id,
            text,
            file,
            get_response
        )
        VALUES (?,?,?,?);
        `,[
            signatureId,
            write.text,
            "",
            ""
        ])
        const rows = result[0];
        return rows
    }
    catch(error){
        console.log(error.message);
    }
}




// =========    寫入signature_turn_person  ==========
async function insertIntoTurnPerson(signatureId,turnPersonId){
    try{
        const result = await pool.query(`
        INSERT INTO signature_turn_person
        (
            signature_id,
            turn_person
        )
        VALUES (?,?);
        `,[
            signatureId,
            turnPersonId,
        ])
        const rows = result[0];
        return rows
    }
    catch(error){
        console.log(error.message);
    }
}


// =========    寫入signature_participate  ==========
async function insertIntoParticipate(signatureId,participantId){
    try{
        const result = await pool.query(`
        INSERT INTO signature_participate
        (
            signature_id,
            user_id,
            confirm,
            processing_time
        )
        VALUES (?,?,"","");
        `,[
            signatureId,
            participantId,
        ])
        const rows = result[0];
        return rows
    }
    catch(error){
        console.log(error.message);
    }
}


// =========    更新signature_participate為pass  ==========
async function updateInParticipate(signatureId,userId,processingTime){
    try{
        const result = await pool.query(`
        UPDATE signature_participate
        SET confirm = "pass",
        processing_time = ?
        WHERE signature_id=? 
        and user_id=?
        `,[
            processingTime,
            signatureId,
            userId
        ])
        const rows = result[0];
        return rows
    }
    catch(error){
        console.log(error.message);
    }
}


// =========    按下撰寫功能時取得人員資料  ==========

async function getDepartmentInformation(companyId){
    try{
        const result = await pool.query(`
        SELECT *
        FROM user_private
        INNER JOIN company_department
        ON user_private.department_id =
        company_department.department_id
        where user_private.company_id = ?
        `,[companyId])
        const rows = result[0];
        return rows
    }
    catch(error){
        console.log(error.message);
    }
}





async function getAllHistoryByUserId(userId){
    try{
        const result = await pool.query(`
        SELECT signature_main.initiator,
        signature_main.subject,
        signature_main.start_time,
        signature_main.end_time,
        signature_main.signature_id,
        user_private.user_name
        FROM signature_main 
        INNER JOIN user_private ON 
        signature_main.initiator =
        user_private.user_id
        INNER JOIN signature_participate ON 
        signature_main.signature_id =
        signature_participate.signature_id
        WHERE signature_participate.user_id = ? 
        and signature_main.final_state <> ?
        `,[userId,""])
        const rows = result[0];
        return rows
    }
    catch(error){
        console.log(error.message);
    }
}


// async function getSignatures(){
//     const result = await pool.query("SELECT * FROM signature_main")
//     const rows = result[0];
//     return rows
// }

async function getSingleSignature(signatureId){
    try{
        const result = await pool.query(`
        SELECT * 
        FROM signature_main
        INNER JOIN user_private
        ON signature_main.initiator=
        user_private.user_id
        INNER JOIN signature_version_content
        ON signature_main.signature_id=
        signature_version_content.signature_id
        WHERE signature_main.signature_id = ?
        `,[signatureId])
        const rows = result[0];
        return rows
    }
    catch(error){
        console.log(error.message);
    }
}



// async function getDataBySequenceNum(sequenceNum){
//     const [result] = await pool.query(`
//     SELECT * 
//     FROM signature_participate 
//     WHERE sequence_num = ? 
//     `,[sequenceNum])
//     const rows = result[0];
//     return rows
// }




// async function InsertSignatureParticipate(signatureId,userId){
//     const [result] = await pool.query(`
//     INSERT INTO signature_participate(signature_id,user_id) 
//     VALUES (?,?)
//     `,[signatureId,userId])
//     const sequenceNum = result.insertId;
//     // const userId = userId;
//     return getDataBySequenceNum(sequenceNum)
//     // return {
//     //     sequenceNum:result.insertId,
//     //     userId:userId
//     // }
// }

// const result = await InsertSignatureParticipate(99,99);
// console.log(result);

module.exports = { 
    checkEmail,
    insertIntoUserPrivate,


    getMainPageSignatures,
    getUser,
    getManagerJudge,
    getManagerCompanyId,
    getManagerCompanys,
    getManagerDepartments,
    judgeCompanyNameAndDepartmentName,
    getManagerDepartmentId,
    getManagerDepartmentUsers,

    checkCompanyMain,
    inserIntoCompanyMain,
    inserIntoCompanyManager,
    checkCompanyDepartment,
    insertIntoCompanyDepartment,

    checkAccountPassword,
    getCompanyId,
    checkName,
    inserIntoUserPrivate,

    searchSubject,

    getContentBySignatureId,

    getSignatureFinalState,
    getSignatureDynamic,
    getParticipateConfirmList,
    updatePassInParticipate,
    updateFinalStateInMain,
    deleteRecordInTurnPerson,
    updateRecordInTurnPerson,
    updateDisagreeInParticipate,
    updateVersionContent,

    //寫入簽呈
    getAllUserIdToUserName,
    insertIntoMain,
    insertIntoVersionContent,
    insertIntoTurnPerson,
    insertIntoParticipate,
    updateInParticipate,

    getDepartmentInformation,

    getAllHistoryByUserId,
    getSingleSignature
};

