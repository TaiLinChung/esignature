// //============  點擊叉叉    ============
const managerInterfaceCross = document.querySelector(".manager_interface_cross");
managerInterfaceCross.addEventListener("click",function (e){
    window.location.href = '/main';

})



// //============  manager檢查權限    ============
async function managerJudge() {
    try {
        const response = await fetch("/main/managerjudge", {
            method: "GET",          
            headers: new Headers({
                "content-type": "application/json"
            })
        });
        const data = await response.json();
        if(data.error){
            window.location.href = '/main';
        }
        // console.log(data.managerJudge.manager_judge);
        if(!data.managerJudge.manager_judge){
            window.location.href = '/main';
        }
    } catch (error) {
        console.error(error);
    }
}
managerJudge();




// //============  manager獲得管理公司名單    ============
const dropDownCompany = document.querySelector("#button_company_DoubleDown");
dropDownCompany.addEventListener("click",function (e){
    // console.log(e.target.className=="");
    async function getManagerCompanys() {
        if(e.target.className=="fa fa-angle-double-down"){
            e.target.className="fa fa-angle-double-up";
            document.querySelector(".menu_company_body").style.display="block";
            document.querySelector(".create_user_message_content").style.display="None";
        }else{
            e.target.className="fa fa-angle-double-down";
            document.querySelector(".menu_company_body").style.display="none";
        }
        try {
            const response = await fetch("/main/manager/company", {
                method: "GET",          
                headers: new Headers({
                    "content-type": "application/json"
                })
            });
            const data = await response.json();
            if(data.ok){
                document.querySelector(".create_department_message_content").style.display="None";
                const menuCompanyBody = document.querySelector(".menu_company_body");
                document.querySelectorAll(".receiverItem").forEach(e => e.remove());
                for(let i=0;i<data.managerCompanys.length;i++){
                    // console.log(data.managerCompanys[i]);
                    let companyName=data.managerCompanys[i].company_name;
                    const chooseCompanyItemDiv = document.createElement("div");
                    chooseCompanyItemDiv.textContent=companyName;
                    chooseCompanyItemDiv.setAttribute("id","Choice"+i.toString());
                    chooseCompanyItemDiv.setAttribute("class","receiverItem");
                
                    menuCompanyBody.appendChild(chooseCompanyItemDiv);

                    chooseCompanyItemDiv.addEventListener('click', function(e) {
                        document.querySelector(".create_company_message_content").style.display="None";
                        // document.querySelector(".manager_company_name").textContent=e.target.textContent;
                        document.querySelector(".create_company_input").value=e.target.textContent;
                    })
                }

                if(data.managerCompanys.length==0){
                    const menuCompanyBody=document.querySelector(".menu_company_body");
                    const chooseCompanyItemDiv = document.createElement("div");
                    chooseCompanyItemDiv.textContent="無公司選項，請先創建。";
                    chooseCompanyItemDiv.setAttribute("class","receiverItem");

                    menuCompanyBody.appendChild(chooseCompanyItemDiv);
                }
            }
        } catch (error) {
            console.error(error);
        }
    }
    getManagerCompanys();


})


// //============  manager獲得該管理公司的部門名單    ============
const dropDownDepartment = document.querySelector("#button_department_DoubleDown");
dropDownDepartment.addEventListener("click",function (e){
    async function getManagerDepartments() {
        if(e.target.className=="fa fa-angle-double-down"){
            e.target.className="fa fa-angle-double-up";
            document.querySelector(".menu_department_body").style.display="block";
        }else{
            e.target.className="fa fa-angle-double-down";
            document.querySelector(".menu_department_body").style.display="none";
        }
        // const companyName = document.querySelector(".manager_company_name").textContent;
        const companyName = document.querySelector(".create_company_input").value;        
        // if(companyName=="公司"){
        if(companyName==""){
            document.querySelectorAll(".receiverItem").forEach(e => e.remove());
            document.querySelector(".create_department_message_content").style.display="block";
            document.querySelector(".create_department_message_content").textContent="請下拉點選公司作為查詢依據";
            document.querySelector(".create_department_message_content").style.color="red";
            const menuDepartmentBody=document.querySelector(".menu_department_body");
            const chooseDepartmentItemDiv = document.createElement("div");
            chooseDepartmentItemDiv.textContent="無部門選項，請創建!";
            chooseDepartmentItemDiv.setAttribute("class","receiverItem");

            menuDepartmentBody.appendChild(chooseDepartmentItemDiv);
        }else{
            try {
                const response = await fetch("/main/manager/department", {
                    method: "PUT",  
                        body: JSON.stringify({
                            companyName:companyName
                        }),       
                        headers: new Headers({
                           "content-type": "application/json"
                        })
                });
                const data = await response.json();
                // console.log(data);
                if(data.ok){
                    const menuDepartmentBody = document.querySelector(".menu_department_body");
                    document.querySelectorAll(".receiverItem").forEach(e => e.remove());
                    let countNum=0;
                    for(let i=0;i<data.managerDepartments.length;i++){
                        let departmentName=data.managerDepartments[i].department_name;
                        const chooseDepartmentItemDiv = document.createElement("div");
                        chooseDepartmentItemDiv.textContent=departmentName;
                        chooseDepartmentItemDiv.setAttribute("id","Choice"+i.toString());
                        chooseDepartmentItemDiv.setAttribute("class","receiverItem");

                        menuDepartmentBody.appendChild(chooseDepartmentItemDiv);
                        countNum=countNum+1;
                        chooseDepartmentItemDiv.addEventListener('click', function(e) {
                            document.querySelector(".create_user_message_content").style.display="None";
                            document.querySelector(".create_department_message_content").style.display="None";
                            // document.querySelector(".manager_department_name").textContent=e.target.textContent;
                            document.querySelector(".create_department_input").value=e.target.textContent;
                        })
    

    
                        
                    }
    
                    if(countNum==0){
                        const menuDepartmentBody=document.querySelector(".menu_department_body");
                        const chooseDepartmentItemDiv = document.createElement("div");
                        chooseDepartmentItemDiv.textContent="無部門選項";
                        chooseDepartmentItemDiv.setAttribute("class","receiverItem");
    
                        menuDepartmentBody.appendChild(chooseDepartmentItemDiv);
    
                    }
                    
                }
            } catch (error) {
                console.error(error);
            }

        }
        
    }
    getManagerDepartments();
})











// //============  manager獲得該管理公司部門的人員名單    ============
const dropDownUser = document.querySelector("#button_user_DoubleDown");
dropDownUser.addEventListener("click",function (e){
    async function getManagerUsers() {
        if(e.target.className=="fa fa-angle-double-down"){
            e.target.className="fa fa-angle-double-up";
            document.querySelector(".menu_user_body").style.display="block";
        }else{
            e.target.className="fa fa-angle-double-down";
            document.querySelector(".menu_user_body").style.display="none";
        }
        // const companyName = document.querySelector(".manager_company_name").textContent;
        const companyName = document.querySelector(".create_company_input").value;
        const departmentName = document.querySelector(".create_department_input").value;
        // const departmentName = document.querySelector(".manager_department_name").textContent;
        //刪除原有
        document.querySelectorAll(".receiverItem").forEach(e => e.remove());
        // if(departmentName=="部門" | companyName=="公司"){
        if(departmentName=="" | companyName==""){
            document.querySelector(".create_user_message_content").style.display="block";
            document.querySelector(".create_user_message_content").textContent="請下拉點選公司及部門作為查詢依據";
            document.querySelector(".create_user_message_content").style.color="red";
            
            const menuUserBody=document.querySelector(".menu_user_body");
            const chooseUserItemDiv = document.createElement("div");
            chooseUserItemDiv.textContent="無人員選項";
            chooseUserItemDiv.setAttribute("class","receiverItem");

            menuUserBody.appendChild(chooseUserItemDiv);

        }else{
            try {
                const response = await fetch("/main/manager/user", {
                    method: "PUT",  
                    body: JSON.stringify({
                        companyName:companyName,
                        departmentName:departmentName
                    }),       
                    headers: new Headers({
                       "content-type": "application/json"
                    })
                });
    
                const data = await response.json();
    
                if(data.ok){
                    const menuUserBody = document.querySelector(".menu_user_body");
                    document.querySelectorAll(".receiverItem").forEach(e => e.remove());
                    for(let i=0;i<data.managerUsers.length;i++){
                        // console.log(data.managerUsers[i].user_name);
    
                        let userName=data.managerUsers[i].user_name;
                        const chooseUserItemDiv = document.createElement("div");
                        chooseUserItemDiv.textContent=userName;
                        chooseUserItemDiv.setAttribute("id","Choice"+i.toString());
                        chooseUserItemDiv.setAttribute("class","receiverItem");
    
                        menuUserBody.appendChild(chooseUserItemDiv);                    
                    }
    
                    if(data.managerUsers.length==0){
                        const menuUserBody=document.querySelector(".menu_user_body");
                        const chooseUserItemDiv = document.createElement("div");
                        chooseUserItemDiv.textContent="無人員選項";
                        chooseUserItemDiv.setAttribute("class","receiverItem");
    
                        menuUserBody.appendChild(chooseUserItemDiv);
    
                    }
                }else if(data.error){
                    const menuUserBody=document.querySelector(".menu_user_body");
                    const chooseUserItemDiv = document.createElement("div");
                    chooseUserItemDiv.textContent="無人員選項";
                    chooseUserItemDiv.setAttribute("class","receiverItem");

                    menuUserBody.appendChild(chooseUserItemDiv);

                    document.querySelector(".create_user_message_content").style.display="block";
                    document.querySelector(".create_user_message_content").textContent=data.message;
                    document.querySelector(".create_user_message_content").style.color="red";

                }
            } catch (error) {
                console.error(error);
            }

        }
        
    }
    getManagerUsers();
})



// //============  點擊 創建公司 選項    ============
const createCompanyButton = document.querySelector(".create_company_button");
createCompanyButton.addEventListener("click",function (e){
    const createCompanyInput = document.querySelector(".create_company_input").value;
    
    if(createCompanyInput==""){
        document.querySelector(".create_company_message_content").style.display="block";
        document.querySelector(".create_company_message_content").textContent="創建公司的名稱不可空白";
        document.querySelector(".create_company_message_content").style.color="red";
    }else{
        async function inserIntoCompanyMainAndManager() {
            try {
                const response = await fetch("/main/manager/company/insert", {
                    method: "PUT",  
                    body: JSON.stringify({
                        companyName:createCompanyInput
                    }),       
                    headers: new Headers({
                    "content-type": "application/json"
                    })
                });
    
                const data = await response.json();
                document.querySelector(".create_company_message_content").style.display="block";
                document.querySelector(".create_company_message_content").textContent=data.message;
                if(data.ok){
                    document.querySelector(".create_company_message_content").style.color="green";

                }else{
                    document.querySelector(".create_company_message_content").style.color="red";
                }
    
            } catch (error) {
                console.error(error);
            }
        }
        inserIntoCompanyMainAndManager();


    }
    
    
})


// //============  點擊 創建部門 選項    ============

const createDepartmentButton = document.querySelector(".create_department_button");
createDepartmentButton.addEventListener("click",function (e){
    const createDepartmentInput = document.querySelector(".create_department_input").value;
    const companyName = document.querySelector(".manager_company_name").textContent;
    if(companyName=="公司" | createDepartmentInput==""){
        document.querySelector(".create_department_message_content").style.display="block";
        document.querySelector(".create_department_message_content").textContent="請下拉點選公司，且確實填寫欲創建的部門名稱";
        document.querySelector(".create_department_message_content").style.color="red";
    }else{
        async function inserIntoCompanyDepartment() {
            try {
                const response = await fetch("/main/manager/department/insert", {
                    method: "PUT",  
                    body: JSON.stringify({
                        companyName:companyName,
                        departmentName:createDepartmentInput
                    }),       
                    headers: new Headers({
                    "content-type": "application/json"
                    })
                });

                const data = await response.json();
                document.querySelector(".create_department_message_content").style.display="block";
                document.querySelector(".create_department_message_content").textContent=data.message;
                if(data.ok){
                    document.querySelector(".create_department_message_content").style.color="green";
                }else{
                    document.querySelector(".create_department_message_content").style.color="red";
                }

            } catch (error) {
                console.error(error);
            }
        }
        inserIntoCompanyDepartment();
    }
})


// //============  點擊 創建人員 選項    ============
const createUserButton = document.querySelector(".create_user_button");
createUserButton.addEventListener("click",function (e){
    const userNameInput = document.querySelector(".user_name_input").value;
    const userAccountInput = document.querySelector(".user_account_input").value;
    const userPasswordInput = document.querySelector(".user_password_input").value;
    const userEmailInput = document.querySelector(".user_email_input").value;
    if(userNameInput=="" | userAccountInput=="" | userPasswordInput=="" | userEmailInput==""){
        document.querySelector(".create_user_message_content").style.display="block";
        document.querySelector(".create_user_message_content").style.color="red";
        document.querySelector(".create_user_message_content").textContent="欲新建人員請完整填寫姓名、帳號、密碼、信箱。";
    }else{
        //判定姓名
        const namePattern = /^[\u4e00-\u9fa5A-Za-z]+[\d]*$/;
        const nameIsMatch = namePattern.test(userNameInput);
        if(!nameIsMatch){
            document.querySelector(".create_user_message_content").style.display="block";
            document.querySelector(".create_user_message_content").style.color="red";
            document.querySelector(".create_user_message_content").textContent="姓名只允許繁體中文及大小寫英文，如需數字編號請放在最後。";
            return
        }
        //判定帳號密碼
        const passwordPattern = /^[a-zA-Z0-9_-]{4,16}$/;
        const accountIsMatch = passwordPattern.test(userAccountInput);
        const passwordIsMatch = passwordPattern.test(userPasswordInput);
        if(!accountIsMatch | !passwordIsMatch){
            document.querySelector(".create_user_message_content").style.display="block";
            document.querySelector(".create_user_message_content").style.color="red";
            document.querySelector(".create_user_message_content").textContent="帳號密碼只可以是字母、數字、下划線或破折號，且長度限制在4到16個之間。";
            return
        }
        console.log("come on ~~");
        //判定信箱
        const emailPattern = /@gmail\.com$/;
        const emailIsMatch = emailPattern.test(userEmailInput);
        if(!emailIsMatch){
            document.querySelector(".create_user_message_content").style.display="block";
            document.querySelector(".create_user_message_content").style.color="red";
            document.querySelector(".create_user_message_content").textContent="信箱請符合@gmail.com的格式。";
            return
        }
        //判定是否有公司
        const companyName = document.querySelector(".manager_company_name").textContent;
        if(companyName=="公司"){
            document.querySelector(".create_user_message_content").style.display="block";
            document.querySelector(".create_user_message_content").style.color="red";
            document.querySelector(".create_user_message_content").textContent="請確實點選公司才能創建。";
            return
        }


        //判定是否有部門
        const departmentName = document.querySelector(".manager_department_name").textContent;
        if(departmentName=="部門"){
            document.querySelector(".create_user_message_content").style.display="block";
            document.querySelector(".create_user_message_content").style.color="red";
            document.querySelector(".create_user_message_content").textContent="請確實點選部門才能創建。";
            return
        }

        //執行創建人員
        async function inserIntoUserPrivate() {
            try {
                const response = await fetch("/main/manager/private/insert", {
                    method: "PUT",  
                    body: JSON.stringify({
                        companyName:companyName,
                        departmentName:departmentName,
                        userName:userNameInput,
                        userAccount:userAccountInput,
                        userPassword:userPasswordInput,
                        userEmail:userEmailInput,
                    }),       
                    headers: new Headers({
                    "content-type": "application/json"
                    })
                });

                const data = await response.json();
                if(data.ok){
                    document.querySelector(".create_user_message_content").style.display="block";
                    document.querySelector(".create_user_message_content").textContent=data.message;
                    document.querySelector(".create_user_message_content").style.color="green";
                }else if(data.error){
                    document.querySelector(".create_user_message_content").style.display="block";
                    document.querySelector(".create_user_message_content").textContent=data.message;
                    document.querySelector(".create_user_message_content").style.color="red";
                }

            } catch (error) {
                console.error(error);
            }
        }
        inserIntoUserPrivate();


    }
})


document.addEventListener("click",(e)=>{
    if(e.target.className !== "fa fa-angle-double-down" & e.target.className !== "fa fa-angle-double-up"){
        document.querySelector(".menu_company_body").style.display="None";
        document.querySelector(".menu_department_body").style.display="None";
        document.querySelector(".menu_user_body").style.display="None";
        document.querySelector("#button_company_DoubleDown").className="fa fa-angle-double-down";
        document.querySelector("#button_department_DoubleDown").className="fa fa-angle-double-down";
        document.querySelector("#button_user_DoubleDown").className="fa fa-angle-double-down";
    }
})