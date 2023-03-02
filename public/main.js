let judgeOfInputSearch="processing";

const signOutButton = document.querySelector(".signOutButton");
signOutButton.addEventListener("click",function (e) {
    async function signOut() {
        try {
            const response = await fetch("/logout", {
                method: "DELETE",          
                headers: new Headers({
                    "content-type": "application/json"
                })
            });
            const data = await response.json();
            if(data.ok==true){
                window.location.href = '/login';
            }
        } catch (error) {
            console.error(error);
        }
    }
    signOut();
});



//============      main畫面的trackByIDCross按叉叉
const trackByIdSetionCross = document.querySelector(".trackByIdSetionCross");
trackByIdSetionCross.addEventListener("click",function (e) {
    window.location.reload();
});



//============      main畫面的撰寫按叉叉
const writeSetionCross = document.querySelector(".writeSetionCross");
writeSetionCross.addEventListener("click",function (e) {
    window.location.reload();
});


// //============  確認是否具備manager_judge的身分    ============
async function managerJudge() {
    try {
        const response = await fetch("/main/managerjudge", {
            method: "GET",          
            headers: new Headers({
                "content-type": "application/json"
            })
        });
        const data = await response.json();
        if(data.managerJudge.manager_judge){
            document.querySelector(".menuManager").style.display="block";
        }
    } catch (error) {
        console.error(error);
    }
}
managerJudge();



// //============  點擊管理者權限    ============
const menuManager = document.querySelector(".menuManager");
menuManager.addEventListener("click",function (e){
    window.location.href = '/manager';
})



// //============  載入畫面時去RDS獲取資料P2-2的輪到你簽/其他人在簽資料    ============
async function loadSignatureTrack() {
    try {
        const response = await fetch("/main/signature/all", {
            method: "GET",          
            headers: new Headers({
                "content-type": "application/json"
            })
        });
        const data = await response.json();
        
        if(data.ok==true){
            dealSignatureTrack(userId=data.userId,userName=data.userName,signatureAll=data.data);
        }
        else if(data.error){
            window.location.href = '/login';
        }
    } catch (error) {
        console.error(error);
    }
}
loadSignatureTrack();


function dealSignatureTrack(userId,userName,signatureAll){
    //若有先刪掉
    document.querySelectorAll(".singleSignatureBlock").forEach(e => e.remove());
    const yourturnBlock = document.querySelector(".yourturnBlock");
    const otheroneBlock = document.querySelector(".otheroneBlock");
    
    const trackByIDNavLeftContent = document.querySelector(".trackByIDNavLeftContent");
    const trackByIDSubjectContent = document.querySelector(".trackByIDSubjectContent");
    const trackByIDInitiatorContent = document.querySelector(".trackByIDInitiatorContent");
    const trackByIDStarttimeContent = document.querySelector(".trackByIDStarttimeContent");
    const trackByIDMessageBlock = document.querySelector(".trackByIDMessageBlock");
    
    // //============  管理者權限的人只看的到管理者權限選項    ============
    if(userName=="管理者"){
        document.querySelector(".menuWrite").style.display="none";
        document.querySelector(".menuProcessing").style.display="none";
        document.querySelector(".menuHistory").style.display="none";
        document.querySelector(".textBlock").style.display="none";
        document.querySelector(".searchInput").style.display="none";
        document.querySelector(".generalSlogan").style.display="none";
        document.querySelector(".helloName").style.color = "rgb(245, 118, 140)";
        document.querySelector(".managerImgBlock").style.display="block";
        document.querySelector(".managerSlogan").style.display="block";
    }
    document.querySelector(".helloName").textContent=userName;
    


    for(i=0;i<signatureAll.length;i++){
        const singleSignatureBlock = document.createElement("div");
        singleSignatureBlock.setAttribute("class","singleSignatureBlock");
        const signatureId =  signatureAll[i].signature_id
        singleSignatureBlock.setAttribute("id",signatureId);
        const signatureContainer = document.createElement("div");
        signatureContainer.setAttribute("class","signatureContainer");

        const initiatorName = document.createElement("div");
        initiatorName.setAttribute("class","initiatorName");
        const signatureTitle = document.createElement("div");
        signatureTitle.setAttribute("class","signatureTitle");
        const signatureStartTime = document.createElement("div");
        signatureStartTime.setAttribute("class","signatureStartTime");
        initiatorName.textContent=signatureAll[i].user_name;
        signatureTitle.textContent=signatureAll[i].subject;
        signatureStartTime.textContent=signatureAll[i].start_time;

        signatureContainer.appendChild(initiatorName);
        signatureContainer.appendChild(signatureTitle);
        signatureContainer.appendChild(signatureStartTime);
        singleSignatureBlock.appendChild(signatureContainer);

        if(signatureAll[i].turn_person==userId){
            yourturnBlock.appendChild(singleSignatureBlock);
            
        }else{
            otheroneBlock.appendChild(singleSignatureBlock);
        }

        //====================  點擊到個別簽程跳出簽程內容
        const singleSignatureListener=document.getElementById(signatureId);
        singleSignatureListener.addEventListener("click",function (e){
            const signatureIdClick = e.currentTarget.id;
            async function loadSingleSignature() {
                try {
                    const response = await fetch("/main/signature/single?clickId="+signatureIdClick, {
                        method: "GET",         
                        headers: new Headers({
                           "content-type": "application/json"
                        })
                    });
                    const data = await response.json();
                    
                    if(data.ok==true){
                        const sectionContainer = document.querySelector(".sectionContainer");    
                        const trackByIDSetion = document.querySelector(".trackByIDSetion");
                        const trackByIDClickbuttonBlock = document.querySelector(".trackByIDClickbuttonBlock");
                        const result = data.data[0];
                        if(result.turn_person==data.userId){
                            trackByIDClickbuttonBlock.style.display="flex";
                        }
                        //=======   如果有附檔 才跳出顯示可以下載欄
                        // console.log("file:----",result.file);
                        if(result.file!==""){
                            document.querySelector(".trackByIDDownloadAttachment").title=result.file;
                            document.querySelector(".trackByIDAttachmentAndInitiatorMethodsContainer").style.display="flex";
                        }

                        sectionContainer.style.display = "none";
                        trackByIDSetion.style.display = "flex";
                        
                        trackByIDNavLeftContent.textContent=result.signature_id;
                        trackByIDSubjectContent.textContent=result.subject;
                        trackByIDInitiatorContent.textContent=result.user_name;
                        trackByIDStarttimeContent.textContent=result.start_time;
                        // trackByIDMessageBlock.textContent=result.text;
                        trackByIDMessageBlock.innerHTML = result.text;
                    }
                } catch (error) {
                    console.error(error);
                }
            }
            loadSingleSignature();
            
        }, true)
    }
}








//==========    點擊為這篇簽呈寫入同意或不同意  ==========
const trackByIDClickbuttonBlock = document.querySelector(".trackByIDClickbuttonBlock");
trackByIDClickbuttonBlock.addEventListener("click",function (e){
                            
    const buttonChoiceOnclick = e.target.textContent;
    const signatureIdClick = document.querySelector(".trackByIDNavLeftContent").textContent;
    async function singleSignatureConfirm(method,reason) {
        try {
            const response = await fetch("/main/signature/single/confirm", {
                method: "PUT",  
                body: JSON.stringify({
                    confirm:method,
                    signatureId:signatureIdClick,
                    reason:reason
                }),       
                headers: new Headers({
                   "content-type": "application/json"
                })
            });
        } catch (error) {
            console.error(error);
        }
    }

    //TrackByID頁面動態創建不通過原因留言、確認送出的那一格
    function createTrackByIDRecordAndDoubleConfirmbuttonContainer(){
        const trackByIDRecordAndDoubleConfirmbuttonContainer = document.querySelector(".trackByIDRecordAndDoubleConfirmbuttonContainer");
        
        //刪除所有子節點
        while (trackByIDRecordAndDoubleConfirmbuttonContainer.hasChildNodes()) {
            trackByIDRecordAndDoubleConfirmbuttonContainer.removeChild(trackByIDRecordAndDoubleConfirmbuttonContainer.lastChild);
          }

        const trackByIDRecordBlock = document.createElement("div");
        trackByIDRecordBlock.setAttribute("class","trackByIDRecordBlock");
        const trackByIDRecordTitle = document.createElement("div");
        trackByIDRecordTitle.setAttribute("class","trackByIDRecordTitle");
        trackByIDRecordTitle.textContent="不通過原因 : ";
        const trackByIDRecordContainer = document.createElement("div");
        trackByIDRecordContainer.setAttribute("class","trackByIDRecordContainer");
        const trackByIDRecordInput = document.createElement("input");
        trackByIDRecordInput.setAttribute("class","trackByIDRecordInput");
        trackByIDRecordInput.setAttribute("type","text");
        const trackByIDRecordText = document.createElement("div");
        trackByIDRecordText.setAttribute("class","trackByIDRecordText");
        const trackByIDDoubleConfirmbuttonBlock = document.createElement("div");
        trackByIDDoubleConfirmbuttonBlock.setAttribute("class","trackByIDDoubleConfirmbuttonBlock");
        trackByIDDoubleConfirmbuttonBlock.textContent="確認送出";

        trackByIDRecordContainer.appendChild(trackByIDRecordInput);
        trackByIDRecordContainer.appendChild(trackByIDRecordText);
        trackByIDRecordBlock.appendChild(trackByIDRecordTitle);
        trackByIDRecordBlock.appendChild(trackByIDRecordContainer);
        trackByIDRecordAndDoubleConfirmbuttonContainer.appendChild(trackByIDRecordBlock);
        trackByIDRecordAndDoubleConfirmbuttonContainer.appendChild(trackByIDDoubleConfirmbuttonBlock);

    }
    
    let method="";
    if(buttonChoiceOnclick == "同意鈕"){
        method="agree";
        trackByIDClickbuttonBlock.style.display="none";
        singleSignatureConfirm(method="agree");
        console.log("同意鈕");
        window.location.reload();
        
        
    }else if(buttonChoiceOnclick == "不同意鈕"){
        method="disagree";
        alert("請確認填寫原因後再次按下確認");
        createTrackByIDRecordAndDoubleConfirmbuttonContainer();

    }else if(buttonChoiceOnclick == "退回重新修改"){
        // method="sendback";
        // alert("請確認填寫原因後再次按下確認");
        createTrackByIDRecordAndDoubleConfirmbuttonContainer();

        
    }
    const trackByIDDoubleConfirmbuttonBlock = document.querySelector(".trackByIDDoubleConfirmbuttonBlock");
    trackByIDDoubleConfirmbuttonBlock.addEventListener("click",function (e){
        let reason = document.querySelector(".trackByIDRecordInput").value;
        console.log("reason= ",reason);
        console.log("method= ",method);
        singleSignatureConfirm(method,reason);
        window.location.reload();
    })
},false);

//點擊查看簽呈動態
const trackByIDMapContent = document.querySelector(".trackByIDMapContent");
trackByIDMapContent.addEventListener("click",function (e){
    document.querySelector(".trackByIDMessageBlock").style.height="380px";
    const signatureIdClick =  document.querySelector(".trackByIDNavLeftContent").textContent;
    async function singleSignatureProcessing(signatureIdClick) {
        try {
            const response = await fetch("/main/signature/single/dynamic?signatureId="+signatureIdClick, {
                method: "GET",         
                headers: new Headers({
                   "content-type": "application/json"
                })
            });
            const data = await response.json();
            // console.log(data);
            if(data.ok){
                                                    
                const trackByIDMapParticipateContainer = document.querySelector(".trackByIDMapParticipateContainer");
                
                const trackByIDMapParticipateContentBlock = document.querySelector(".trackByIDMapParticipateContentBlock");
                
                // const trackByIDMapParticipateSingle = document.createElement("div");
                // trackByIDMapParticipateSingle.setAttribute("class","trackByIDMapParticipateSingle");
                //刪除原本的
                document.querySelectorAll(".trackByIDMapParticipateSingleAll").forEach(e => e.remove());                                  
                for(let i=0;i<data.data.length;i++){
                    // console.log(i);
                    const trackByIDMapParticipateSingleTop = document.createElement("div");
                    trackByIDMapParticipateSingleTop.setAttribute("class","trackByIDMapParticipateSingleTop");
                    trackByIDMapParticipateSingleTop.textContent=data.data[i].user_name;
                    const trackByIDMapParticipateSingleDownContainer = document.createElement("div");
                    trackByIDMapParticipateSingleDownContainer.setAttribute("class","trackByIDMapParticipateSingleDownContainer");
                    const trackByIDMapParticipateSingleDown = document.createElement("div");
                    trackByIDMapParticipateSingleDown.setAttribute("class","trackByIDMapParticipateSingleDown");
                    if(data.data[i].processing_time==""){
                        trackByIDMapParticipateSingleDown.textContent="none";
                    }else{
                        trackByIDMapParticipateSingleDown.textContent=data.data[i].processing_time.substr(5,11);
                    }
                    console.log(trackByIDMapParticipateSingleDown)
                    if(data.data[i].confirm==='pass'){
                        const trackByIDMapParticipateSingleTopCheck = document.createElement("img");
                        trackByIDMapParticipateSingleTopCheck.src="/styles/check.png";
                        trackByIDMapParticipateSingleTopCheck.setAttribute("class","trackByIDMapParticipateSingleTopCheck");
                        trackByIDMapParticipateSingleTop.appendChild(trackByIDMapParticipateSingleTopCheck);
                    }else{                                                          
                        const trackByIDMapParticipateSingleTopCheck = document.createElement("img");
                        trackByIDMapParticipateSingleTopCheck.src="/styles/selectFalse.png";
                        trackByIDMapParticipateSingleTopCheck.setAttribute("class","trackByIDMapParticipateSingleTopCheck");
                        trackByIDMapParticipateSingleTop.appendChild(trackByIDMapParticipateSingleTopCheck);
                    }
                    const trackByIDMapParticipateSingleAll = document.createElement("div");
                    trackByIDMapParticipateSingleAll.setAttribute("class","trackByIDMapParticipateSingleAll");
                    trackByIDMapParticipateSingleAll.appendChild(trackByIDMapParticipateSingleTop);
                    trackByIDMapParticipateSingleDownContainer.appendChild(trackByIDMapParticipateSingleDown);
                    trackByIDMapParticipateSingleAll.appendChild(trackByIDMapParticipateSingleDownContainer);
                    trackByIDMapParticipateContentBlock.appendChild(trackByIDMapParticipateSingleAll);
                    trackByIDMapParticipateContainer.appendChild(trackByIDMapParticipateContentBlock);
                }
                trackByIDMapParticipateContainer.style.display="flex";
                
            }
        } catch (error) {
            console.error(error);
        }
    }
    singleSignatureProcessing(signatureIdClick);
}, false);





//============  嘗試主畫面上點擊撰寫    ============
const writeTitle = document.querySelector(".writeTitle");
writeTitle.onclick=function(event){
    const sectionContainer = document.querySelector(".sectionContainer");
    const writeSetion = document.querySelector(".writeSetion");
    sectionContainer.style.display = "none";
    writeSetion.style.display = "flex";

    //============= 1. 先發出需求取得參與者資料
    async function getInformation() {
        try {
            const response = await fetch("/main/write/information", {
                method: "GET",               
                headers: new Headers({
                    "content-type": "application/json"
                })
            });
            const responseTransfer = await response.json();

            //======    建立部門選項
            
            const departmentList = responseTransfer.departmentList;
            departmentList.push("全部");
            const groupedData = responseTransfer.groupedData;
            console.log(groupedData);

            const menu_department_body=document.querySelector(".menu_department_body");
            for(let i=0;i<departmentList.length;i++){
                const chooseDepartmentDiv = document.createElement("div");
                chooseDepartmentDiv.textContent=responseTransfer.departmentList[i];
                chooseDepartmentDiv.setAttribute("id","Department"+i.toString());
                
                

                menu_department_body.appendChild(chooseDepartmentDiv);
                writeBlockReceiverContentBlock=document.querySelector(".writeBlockReceiverContentBlock");
                
                //===========   點選部門
                chooseDepartmentDiv.addEventListener('click', function(e) {
                    console.log(e.target.textContent);
                    const departmentName=e.target.textContent;
                    document.querySelector(".menu_block").style.display="block";

                    
                    if(departmentName=="全部"){
                        //刪除原本的
                        document.querySelectorAll(".receiverItem").forEach(e => e.remove());
                        const userIdList = responseTransfer.userIdList;
                        console.log(responseTransfer.userNameList);
                        userAllNameList=responseTransfer.userNameList;
                        const menu_body=document.querySelector(".menu_body");
                        

                        //去除依序參與者欄內已經存在的名單
                        const itemsToRemove=[]
                        const writeBlockReceiverSingleAll=document.querySelectorAll(".writeBlockReceiverSingle");
                        for(let i=0;i<writeBlockReceiverSingleAll.length;i++){
                            itemsToRemove.push(writeBlockReceiverSingleAll[i].textContent);
                        }
                        // console.log(itemsToRemove);
                        const departmentNameList=[];
                        const userName=responseTransfer.userName;
                        // console.log(userName);
                        for(let i=0;i<userAllNameList.length;i++){
                            if(userAllNameList[i]!==userName){
                                departmentNameList.push(userAllNameList[i]);
                            }
                        }
                        const nameList = userAllNameList.filter(item => !itemsToRemove.includes(item));



                        //======    建立人員名單選項
                        for(let i=0;i<nameList.length;i++){
                            const chooseItemDiv = document.createElement("div");
                            chooseItemDiv.textContent=nameList[i];
                            chooseItemDiv.setAttribute("id","Choice"+i.toString());
                            chooseItemDiv.setAttribute("class","receiverItem");
                            
                            menu_body.appendChild(chooseItemDiv);
                            writeBlockReceiverContentBlock=document.querySelector(".writeBlockReceiverContentBlock");
    
                            chooseItemDiv.addEventListener('click', function(e) {
                                const writeBlockReceiverSingleCancel = document.createElement("img");
                                writeBlockReceiverSingleCancel.src="/styles/cancel.png";
                                writeBlockReceiverSingleCancel.setAttribute("class","writeBlockReceiverSingleCancel");
                                writeBlockReceiverSingleCancel.setAttribute("id","item"+e.target.id.replace('Choice', ''));
                                const writeBlockReceiverSingle = document.createElement("div");
                                writeBlockReceiverSingle.setAttribute("class","writeBlockReceiverSingle");
                                // writeBlockReceiverSingle.setAttribute("id","writeBlockReceiverSingle");
                                writeBlockReceiverSingle.textContent=e.target.textContent;
                                writeBlockReceiverSingle.appendChild(writeBlockReceiverSingleCancel);
                                
                                //====================================  這裡點擊後刪除收件人Item，還給choice
                                e.target.style.display="none";
                                writeBlockReceiverSingleCancel.addEventListener('click', function(e) {
                                    const disappearItemId=e.target.id;
                                    // console.log(disappearItemId);
                                    // const needAppearChoiceId="Choice"+disappearItemId.replace('item', '')
                                    // document.getElementById(needAppearChoiceId).style.display="block";
                                    e.target.parentNode.remove();
                                });
                                writeBlockReceiverContentBlock.appendChild(writeBlockReceiverSingle);
                            });

                    
                        }


                    }
                    else{
                        //去除依序參與者欄內已經存在的名單
                        const itemsToRemove=[]
                        const writeBlockReceiverSingleAll=document.querySelectorAll(".writeBlockReceiverSingle");
                        for(let i=0;i<writeBlockReceiverSingleAll.length;i++){
                            itemsToRemove.push(writeBlockReceiverSingleAll[i].textContent);
                        }
                        const departmentNameList=[];
                        const userName=responseTransfer.userName;
                        console.log(userName);
                        for(let i=0;i<groupedData[departmentName].length;i++){
                            if(groupedData[departmentName][i].user_name!==userName){
                                departmentNameList.push(groupedData[departmentName][i].user_name);
                            }
                        }
                        const nameList = departmentNameList.filter(item => !itemsToRemove.includes(item));


                        document.querySelectorAll(".receiverItem").forEach(e => e.remove());
                        const menu_body=document.querySelector(".menu_body");
                        //======    建立人員名單選項
                        for(let i=0;i<nameList.length;i++){
                            const chooseItemDiv = document.createElement("div");
                            chooseItemDiv.textContent=nameList[i];
                            chooseItemDiv.setAttribute("id","Choice"+i.toString());
                            chooseItemDiv.setAttribute("class","receiverItem");
                            
                            menu_body.appendChild(chooseItemDiv);
                            writeBlockReceiverContentBlock=document.querySelector(".writeBlockReceiverContentBlock");
    
                            chooseItemDiv.addEventListener('click', function(e) {
                                const writeBlockReceiverSingleCancel = document.createElement("img");
                                writeBlockReceiverSingleCancel.src="/styles/cancel.png";
                                writeBlockReceiverSingleCancel.setAttribute("class","writeBlockReceiverSingleCancel");
                                writeBlockReceiverSingleCancel.setAttribute("id","item"+e.target.id.replace('Choice', ''));
                                const writeBlockReceiverSingle = document.createElement("div");
                                writeBlockReceiverSingle.setAttribute("class","writeBlockReceiverSingle");
                                // writeBlockReceiverSingle.setAttribute("id","writeBlockReceiverSingle");
                                writeBlockReceiverSingle.textContent=e.target.textContent;
                                writeBlockReceiverSingle.appendChild(writeBlockReceiverSingleCancel);
                                
                                //====================================  這裡點擊後刪除收件人Item，還給choice
                                e.target.style.display="none";
                                writeBlockReceiverSingleCancel.addEventListener('click', function(e) {
                                    const disappearItemId=e.target.id;
                                    console.log(disappearItemId);
                                    // const needAppearChoiceId="Choice"+disappearItemId.replace('item', '')
                                    // document.getElementById(needAppearChoiceId).style.display="block";
                                    e.target.parentNode.remove();
                                });
                                writeBlockReceiverContentBlock.appendChild(writeBlockReceiverSingle);
                            });

                    
                        }
                    }
                    //===========   如果沒有剩餘人員    就創建一格無剩餘人員
                    const itemNum = document.querySelectorAll(".receiverItem");
                    if(itemNum.length==0){
                        const menu_body=document.querySelector(".menu_body");
                        const chooseItemDiv = document.createElement("div");
                        chooseItemDiv.textContent="無剩餘人員";
                        // chooseItemDiv.setAttribute("id","Choice"+i.toString());
                        chooseItemDiv.setAttribute("class","receiverItem");
                        
                        menu_body.appendChild(chooseItemDiv);
                    }
                    // const chooseItemDiv = document.createElement("div");
                    //         chooseItemDiv.textContent=nameList[i];
                    //         chooseItemDiv.setAttribute("id","Choice"+i.toString());
                    //         chooseItemDiv.setAttribute("class","receiverItem");
                            
                    //         menu_body.appendChild(chooseItemDiv);

                
                });
                  
            }

            const button_department_icon = document.querySelector("#writeReceiverdepartmentDoubleDown");
            button_department_icon.addEventListener("click",function (e) {
                if(e.target.className=="fa fa-angle-double-down"){
                    e.target.className="fa fa-angle-double-up";
                    document.querySelector(".menu_department_body").style.display="block";
                    document.querySelector(".menu_body").style.display="block";
                    // document.querySelector(".menu_block").style.display="block";
                }else{
                    e.target.className="fa fa-angle-double-down";
                    document.querySelector(".menu_department_body").style.display="none";
                    document.querySelector(".menu_body").style.display="none";
                    document.querySelector(".menu_block").style.display="none";
                }
            })


            // const userIdList = responseTransfer.userIdList;
            // const menu_body=document.querySelector(".menu_body");
            // //======    建立人員名單選項
            // for(let i=0;i<userIdList.length;i++){
            //     const chooseItemDiv = document.createElement("div");
            //     chooseItemDiv.textContent=responseTransfer.userNameList[i];
            //     chooseItemDiv.setAttribute("id","Choice"+i.toString());
            //     chooseItemDiv.setAttribute("class","receiverItem");

            //     menu_body.appendChild(chooseItemDiv);
            //     writeBlockReceiverContentBlock=document.querySelector(".writeBlockReceiverContentBlock");
                
            //     chooseItemDiv.addEventListener('click', function(e) {
            //         const writeBlockReceiverSingleCancel = document.createElement("img");
            //         writeBlockReceiverSingleCancel.src="/styles/cancel.png";
            //         writeBlockReceiverSingleCancel.setAttribute("class","writeBlockReceiverSingleCancel");
            //         writeBlockReceiverSingleCancel.setAttribute("id","item"+e.target.id.replace('Choice', ''));
            //         const writeBlockReceiverSingle = document.createElement("div");
            //         writeBlockReceiverSingle.setAttribute("class","writeBlockReceiverSingle");
            //         // writeBlockReceiverSingle.setAttribute("id","writeBlockReceiverSingle");
            //         writeBlockReceiverSingle.textContent=e.target.textContent;
            //         writeBlockReceiverSingle.appendChild(writeBlockReceiverSingleCancel);
                    
            //         //====================================  這裡點擊後刪除收件人Item，還給choice
            //         e.target.style.display="none";
            //         writeBlockReceiverSingleCancel.addEventListener('click', function(e) {
            //             const disappearItemId=e.target.id;
            //             // console.log(disappearItemId);
            //             const needAppearChoiceId="Choice"+disappearItemId.replace('item', '')
            //             document.getElementById(needAppearChoiceId).style.display="block";
            //             e.target.parentNode.remove();
            //         });
            //         writeBlockReceiverContentBlock.appendChild(writeBlockReceiverSingle);
            //     });

                
            // }

 
            // const button_icon = document.querySelector("#writeReceiverCustomerDoubleDown");
            // button_icon.addEventListener("click",function (e) {
            //     if(e.target.className=="fa fa-angle-double-down"){
            //         e.target.className="fa fa-angle-double-up";
            //         document.querySelector(".menu_body").style.display="block";
            //     }else{
            //         e.target.className="fa fa-angle-double-down";
            //         document.querySelector(".menu_body").style.display="none";
            //     }
            // },
            // false
            // );  
        }catch (error) {
            console.error(error);
        }
    }
    getInformation();

}


//==================預設日期
function getTime(){
    const today =new Date();
    const year = today.getFullYear();
    const month = ('0' + (today.getMonth() + 1)).slice(-2);
    const day = ('0' + today.getDate()).slice(-2);
    const hours = ('0' + today.getHours()).slice(-2);
    const minutes = ('0' + today.getMinutes()).slice(-2);
    const date = year + "-" + month + "-" + day + " " + hours + ":" + minutes;
    return date;
}






//=======================   寫入畫面點擊送出    =======================
const writeBlockConfirmBotton = document.querySelector(".writeBlockConfirmBotton");
writeBlockConfirmBotton.addEventListener("click",function (e) {
    // const writeBlockSubjectContentInput = document.querySelector(".writeBlockSubjectContentInput");
    subject=document.querySelector(".writeBlockSubjectContentInput").value;
    // console.log(writeBlockSubjectContentInput.value=="");
    writeBlockReceiverAll = document.querySelectorAll(".writeBlockReceiverSingle");
    // console.log(writeBlockReceiverAll);
    if(writeBlockReceiverAll.length==0 || subject==""){
        alert("請確認");
    }else{

        const timeNow=getTime();
        const writeBlockText = document.querySelector(".writeBlockText").value.replace(/\n/g, '<br>');
        const receiverAllList=[];
        for(let i=0;i<writeBlockReceiverAll.length;i++){
            receiverAllList.push(writeBlockReceiverAll[i].textContent);
        }
        //==================        還須取得檔案    ==================
        console.log("fileUrl: ",fileUrl);
        async function write() {
            try {
                const response = await fetch("/main/write", {
                    method: "PUT",  
                    body: JSON.stringify({
                        subject:subject,
                        map:receiverAllList,
                        startTime:timeNow,
                        text:writeBlockText,
                        file:fileUrl,
                    }),         
                    headers: new Headers({
                        "content-type": "application/json"
                    })
                });
                const data = await response.json();
                
            } catch (error) {
                console.error(error);
            }
        }
        write();
        window.location.reload();
    }
},
false
);

















//=======================   按下選單上的簽呈進行中

const menuProcessing = document.querySelector(".menuProcessing");
menuProcessing.addEventListener("click",function (e) {
    document.querySelector(".menuManager").style.backgroundColor = "rgb(201, 206, 206)";
    document.querySelector(".menuHistory").style.backgroundColor = "rgb(201, 206, 206)";
    document.querySelector(".menuProcessing").style.backgroundColor = "rgb(166, 223, 248)";
    loadSignatureTrack();
    document.querySelector(".historyYoursBlock").style.display="none";
    document.querySelector(".historyOthersBlock").style.display="none";
    document.querySelector(".yourturnBlock").style.display="block";
    document.querySelector(".otheroneBlock").style.display="block";
    judgeOfInputSearch="processing";
    document.querySelector(".searchInput").value="";
    document.querySelector(".signatureMenu").style.display="none";
});



//============      main畫面的historyTrackByIDCross按叉叉
const historyTrackByIdSetionCross = document.querySelector(".historyTrackByIdSetionCross");
historyTrackByIdSetionCross.addEventListener("click",function (e) {
    // document.querySelector(".historyTrackByIDSetion").style.display="none";
    // document.querySelector(".sectionContainer").style.display="flex";
    // loadSignatureTrack();
    window.location.reload();
});







//=======================   按下選單上的歷史紀錄
const menuHistory = document.querySelector(".menuHistory");
const historyYoursBlock = document.querySelector(".historyYoursBlock");
const historyOthersBlock = document.querySelector(".historyOthersBlock");
const yourturnBlock = document.querySelector(".yourturnBlock");
const otheroneBlock = document.querySelector(".otheroneBlock");
menuHistory.addEventListener("click",function (e) {
    yourturnBlock.style.display="none";
    otheroneBlock.style.display="none";
    historyYoursBlock.style.display="block";
    historyOthersBlock.style.display="block";
    judgeOfInputSearch="history";
    document.querySelector(".searchInput").value="";
    document.querySelector(".signatureMenu").style.display="none";

    //=======================   取得跟自己相關的signature_participate

    async function allSignaturesHistory() {
        try {
            const response = await fetch("/main/signature/history", {
                method: "GET",         
                headers: new Headers({
                   "content-type": "application/json"
                })
            });
            const data = await response.json();
            historyDatas=data.historys;
            userId=data.userId;
            //===================   歷史紀錄頁面填值
            console.log(historyDatas);
            console.log(userId);

            
            
            if(data.ok){
                //==============    先刪除原本的singleSignatureBlock
                document.querySelectorAll(".historySingleSignatureBlock").forEach(e => e.remove());
                document.querySelector(".menuProcessing").style.backgroundColor = "rgb(201, 206, 206)";
                document.querySelector(".menuManager").style.backgroundColor = "rgb(201, 206, 206)";
                document.querySelector(".menuHistory").style.backgroundColor = "rgb(166, 223, 248)";
                
                
                const historyYoursBlock = document.querySelector(".historyYoursBlock");
                const historyOthersBlock = document.querySelector(".historyOthersBlock");              
            
                for(i=0;i<historyDatas.length;i++){
                    const historySingleSignatureBlock = document.createElement("div");
                    historySingleSignatureBlock.setAttribute("class","historySingleSignatureBlock");
                    // singleSignatureBlock.setAttribute("class","historyItem");

                    const historySignatureId =  historyDatas[i].signature_id
                    historySingleSignatureBlock.setAttribute("id",historySignatureId);
                    const historySignatureContainer = document.createElement("div");
                    historySignatureContainer.setAttribute("class","historySignatureContainer");
            
                    const historyInitiatorName = document.createElement("div");
                    historyInitiatorName.setAttribute("class","historyInitiatorName");
                    const historySignatureTitle = document.createElement("div");
                    historySignatureTitle.setAttribute("class","historySignatureTitle");
                    const historySignatureStartTime = document.createElement("div");
                    historySignatureStartTime.setAttribute("class","historySignatureStartTime");
                    const historySignatureProcessingTime = document.createElement("div");
                    historySignatureProcessingTime.setAttribute("class","historySignatureProcessingTime");
                    historyInitiatorName.textContent=historyDatas[i].user_name;
                    historySignatureTitle.textContent=historyDatas[i].subject;
                    historySignatureStartTime.textContent=historyDatas[i].start_time.substr(0,10);
                    historySignatureProcessingTime.textContent=historyDatas[i].end_time.substr(0,10);
            
                    historySignatureContainer.appendChild(historyInitiatorName);
                    historySignatureContainer.appendChild(historySignatureTitle);
                    historySignatureContainer.appendChild(historySignatureStartTime);
                    historySignatureContainer.appendChild(historySignatureProcessingTime);
                    historySingleSignatureBlock.appendChild(historySignatureContainer);
            
                    if(historyDatas[i].initiator===userId){
                        historyYoursBlock.appendChild(historySingleSignatureBlock);
                        
                    }else{
                        historyOthersBlock.appendChild(historySingleSignatureBlock);
                    }


                    //==================點擊到個別歷史簽程跳出簽程內容
                    const historySingleSignatureListener=document.getElementById(historyDatas[i].signature_id);
                    historySingleSignatureListener.onclick=function(event){
                    const signatureIdClick = event.currentTarget.id;
                        async function loadSingleSignature(signatureIdClick) {
                            try {
                                const response = await fetch("/main/signature/historySingle?clickId="+signatureIdClick, {
                                    method: "GET",         
                                    headers: new Headers({
                                    "content-type": "application/json"
                                    })
                                });
                                const data = await response.json();

                                if(data.ok==true){
                                    const sectionContainer = document.querySelector(".sectionContainer");    
                                    const historyTrackByIDSetion = document.querySelector(".historyTrackByIDSetion");
                                    sectionContainer.style.display = "none";
                                    historyTrackByIDSetion.style.display = "flex";
                                    const result = data.data[0];
                                    document.querySelector(".historyTrackByIDNavLeftContent").textContent=result.signature_id;
                                    document.querySelector(".historyTrackByIDSubjectContent").textContent=result.subject;
                                    document.querySelector(".historyTrackByIDInitiatorContent").textContent=result.user_name;
                                    document.querySelector(".historyTrackByIDStarttimeContent").textContent=result.start_time;
                                    document.querySelector(".historyTrackByIDMessageBlock").innerHTML = result.text;
                                    document.querySelector(".historyTrackByIDProcessingContent").textContent=result.end_time;

                                    if(result.final_state=="disagree"){
                                        document.querySelector(".historyTrackByIDFinalStateContent").textContent="不通過";
                                    }else{
                                        document.querySelector(".historyTrackByIDFinalStateContent").textContent="通過";
                                    }                                   

                                    document.querySelector(".historyTrackByIDMapParticipateContainer").style.display="none";
                                    
                                    //如果有不同意紀錄才創建
                                    if(result.get_response){
                                        const historyTrackByIDResponseContainer = document.querySelector(".historyTrackByIDResponseContainer");
                                        const historyTrackByIDResponseBlock =  document.createElement("div");
                                        historyTrackByIDResponseBlock.setAttribute("class","historyTrackByIDResponseBlock");

                                        const historyTrackByIDResponseTitle =  document.createElement("div");
                                        historyTrackByIDResponseTitle.setAttribute("class","historyTrackByIDResponseTitle");
                                        const historyTrackByIDResponseContent =  document.createElement("div");
                                        historyTrackByIDResponseContent.setAttribute("class","historyTrackByIDResponseContent");
                                        
                                        const historyTrackByIDResponseText =  document.createElement("div");
                                        historyTrackByIDResponseText.setAttribute("class","historyTrackByIDResponseText");
                                        historyTrackByIDResponseText.textContent=result.get_response;
                                        historyTrackByIDResponseContent.appendChild(historyTrackByIDResponseText);
                                        historyTrackByIDResponseTitle.textContent="不通過原因 : ";
                                        historyTrackByIDResponseBlock.appendChild(historyTrackByIDResponseTitle);
                                        historyTrackByIDResponseBlock.appendChild(historyTrackByIDResponseContent);
                                        historyTrackByIDResponseContainer.appendChild(historyTrackByIDResponseBlock); 
                                    }

                                    // 如果有附件檔案才創建
                                    if(result.file){
                                        const historyTrackByIDDownloadFileBlock = document.querySelector(".historyTrackByIDDownloadFileBlock");
                                        
                                        const historyTrackByIDDownloadFileContentWord =  document.createElement("span");
                                        historyTrackByIDDownloadFileContentWord.setAttribute("class","historyTrackByIDDownloadFileContentWord");
                                        historyTrackByIDDownloadFileContentWord.textContent="點擊下載附件檔案";
                                        const historyTrackByIDDownloadFileContentIcon =  document.createElement("img");
                                        historyTrackByIDDownloadFileContentIcon.src="/styles/select.png";
                                        historyTrackByIDDownloadFileContentIcon.setAttribute("class","historyTrackByIDDownloadFileContentIcon");
                                        const historyTrackByIDDownloadFileContent = document.createElement("div");
                                        historyTrackByIDDownloadFileContent.setAttribute("class","historyTrackByIDDownloadFileContent");
                                        historyTrackByIDDownloadFileContent.appendChild(historyTrackByIDDownloadFileContentWord);
                                        historyTrackByIDDownloadFileContent.appendChild(historyTrackByIDDownloadFileContentIcon);
                                        historyTrackByIDDownloadFileContent.title = result.file;

                                        const historyTrackByIDDownloadFileTitle =  document.createElement("div");
                                        historyTrackByIDDownloadFileTitle.setAttribute("class","historyTrackByIDDownloadFileTitle");
                                        historyTrackByIDDownloadFileTitle.textContent="附件檔案 : ";

                                        historyTrackByIDDownloadFileBlock.appendChild(historyTrackByIDDownloadFileTitle);
                                        historyTrackByIDDownloadFileBlock.appendChild(historyTrackByIDDownloadFileContent);


                                        // //歷史紀錄下載功能
                                        // const historyTrackByIDDownloadFileContent = document.querySelector(".historyTrackByIDDownloadFileContent");
                                        historyTrackByIDDownloadFileContent.addEventListener('click', (event) => {
                                            event.preventDefault();
                                            const url = "https://"+historyTrackByIDDownloadFileContent.title;
                                            // console.log(url);
                                            downloadImage(url);
                                        })
                                    }



                                    //點擊查看簽呈動態
                                    const historyTrackByIDMapContent = document.querySelector(".historyTrackByIDMapContent");
                                    historyTrackByIDMapContent.addEventListener("click",function (e){
                                        document.querySelector(".historyTrackByIDMessageBlock").style.height="300px";
                                        async function singleSignatureProcessing(signatureIdClick) {
                                            try {
                                                const response = await fetch("/main/signature/single/dynamicHistory?signatureId="+signatureIdClick, {
                                                    method: "GET",         
                                                    headers: new Headers({
                                                    "content-type": "application/json"
                                                    })
                                                });
                                                const data = await response.json();
                                                // console.log(data);
                                                if(data.ok){
                                                    
                                                    const historyTrackByIDMapParticipateContainer = document.querySelector(".historyTrackByIDMapParticipateContainer");
                                                    
                                                    const historyTrackByIDMapParticipateContentBlock = document.querySelector(".historyTrackByIDMapParticipateContentBlock");
                                                    
                                                    // const trackByIDMapParticipateSingle = document.createElement("div");
                                                    // trackByIDMapParticipateSingle.setAttribute("class","trackByIDMapParticipateSingle");
                                                    //刪除原本的
                                                    document.querySelectorAll(".historyTrackByIDMapParticipateSingleAll").forEach(e => e.remove());                                  
                                                    for(let i=0;i<data.data.length;i++){
                                                        // console.log(i);
                                                        const historyTrackByIDMapParticipateSingleTop = document.createElement("div");
                                                        historyTrackByIDMapParticipateSingleTop.setAttribute("class","historyTrackByIDMapParticipateSingleTop");
                                                        historyTrackByIDMapParticipateSingleTop.textContent=data.data[i].user_name;
                                                        const historyTrackByIDMapParticipateSingleDownContainer = document.createElement("div");
                                                        historyTrackByIDMapParticipateSingleDownContainer.setAttribute("class","historyTrackByIDMapParticipateSingleDownContainer");
                                                        const historyTrackByIDMapParticipateSingleDown = document.createElement("div");
                                                        historyTrackByIDMapParticipateSingleDown.setAttribute("class","historyTrackByIDMapParticipateSingleDown");
                                                        historyTrackByIDMapParticipateSingleDown.textContent=data.data[i].processing_time.substr(5,11);
                                                        
                                                        if(data.data[i].confirm==='pass'){
                                                            const historyTrackByIDMapParticipateSingleTopCheck = document.createElement("img");
                                                            historyTrackByIDMapParticipateSingleTopCheck.src="/styles/check.png";
                                                            historyTrackByIDMapParticipateSingleTopCheck.setAttribute("class","historyTrackByIDMapParticipateSingleTopCheck");
                                                            historyTrackByIDMapParticipateSingleTop.appendChild(historyTrackByIDMapParticipateSingleTopCheck);
                                                        }else{                                                            
                                                            const historyTrackByIDMapParticipateSingleTopCheck = document.createElement("img");
                                                            historyTrackByIDMapParticipateSingleTopCheck.src="/styles/cross-circle.png";
                                                            historyTrackByIDMapParticipateSingleTopCheck.setAttribute("class","historyTrackByIDMapParticipateSingleTopCheck");
                                                            historyTrackByIDMapParticipateSingleTop.appendChild(historyTrackByIDMapParticipateSingleTopCheck);
                                                        }
                                                        const historyTrackByIDMapParticipateSingleAll = document.createElement("div");
                                                        historyTrackByIDMapParticipateSingleAll.setAttribute("class","historyTrackByIDMapParticipateSingleAll");
                                                        historyTrackByIDMapParticipateSingleAll.appendChild(historyTrackByIDMapParticipateSingleTop);
                                                        historyTrackByIDMapParticipateSingleDownContainer.appendChild(historyTrackByIDMapParticipateSingleDown);
                                                        historyTrackByIDMapParticipateSingleAll.appendChild(historyTrackByIDMapParticipateSingleDownContainer);
                                                        historyTrackByIDMapParticipateContentBlock.appendChild(historyTrackByIDMapParticipateSingleAll);
                                                        
                                                    }
                                                    historyTrackByIDMapParticipateContainer.style.display="flex";
                                                    
                                                }
                                            } catch (error) {
                                                console.error(error);
                                            }
                                        }
                                        singleSignatureProcessing(signatureIdClick);

                                    });

                                }



                            } catch (error) {
                                console.error(error);
                            }
                        }
                        loadSingleSignature(signatureIdClick);

                    }

                }
            
            }
        } catch (error) {
            console.error(error);
        }
    }
    allSignaturesHistory();



});


//  ============= 即時輸入  =============
const searchInput = document.querySelector(".searchInput");
searchInput.addEventListener("input", (e)=>{
    // 在這裡添加事件處理程序
    e.stopPropagation();
    let instantText = e.target.value;
    if(instantText !== ""){
        async function search() {
            try {
                const response = await fetch("/main/search", {
                    method: "PUT",
                    body: JSON.stringify({
                        instantText:instantText,
                        judgeOfInputSearch:judgeOfInputSearch
                    }),
                    headers: new Headers({
                       "content-type": "application/json"
                    })
                });
                const data = await response.json();
                const searchInput = document.querySelector(".searchInput").value;
                if(data.ok && data.doSearchSubject.length!==0){
                    const doSearchSubject = data.doSearchSubject
                    buildSearchMenu(doSearchSubject);
                    document.querySelector(".generalSlogan").style.display="none";
                }else if(data.ok && data.doSearchSubject.length==0 && searchInput !=""){
                    //刪除原本的
                    document.querySelectorAll(".menuSignatureBlock").forEach(e => e.remove());
                    
                    signatureMenu.style.display="block";
                    const menuSignatureBlock = document.createElement("div");
                    menuSignatureBlock.setAttribute("class","menuSignatureBlock");
                    const menuTitle = document.createElement("div");
                    menuTitle.setAttribute("class","menuTitle");
                    menuTitle.textContent="沒有符合主旨關鍵字的搜尋結果";
                    const menuContainer = document.createElement("div");
                    menuContainer.setAttribute("class","menuContainer");
                    menuContainer.appendChild(menuTitle);
                    menuSignatureBlock.appendChild(menuContainer);
                    signatureMenu.appendChild(menuSignatureBlock);
                    document.querySelector(".signatureMenuNavContainer").style.display="none";
                    document.querySelector(".generalSlogan").style.display="none";
                }else{
                    signatureMenu.style.display="none";
                }

            } catch (error) {
                console.error(error);
            }
        }
        search();
    }else{
        signatureMenu.style.display="none";
    }   

}, { once: false })


const signatureMenu = document.querySelector(".signatureMenu");
signatureMenu.style.display="none";
//=======   創建search menu     ======
function buildSearchMenu(doSearchSubject){
    const signatureMenu = document.querySelector(".signatureMenu");
    signatureMenu.style.display="block";
    
    document.querySelector(".signatureMenuNavContainer").style.display="flex";
    //刪除原本的
    document.querySelectorAll(".menuSignatureBlock").forEach(e => e.remove());
    for(let i=0;i<doSearchSubject.length;i++){
        // console.log(doSearchSubject[i]);
        const menuSignatureBlock = document.createElement("div");
        menuSignatureBlock.setAttribute("class","menuSignatureBlock");
        const signatureId =  doSearchSubject[i].signature_id;
        menuSignatureBlock.setAttribute("id",signatureId);
        const menuContainer = document.createElement("div");
        menuContainer.setAttribute("class","menuContainer");

        const menuInitiator = document.createElement("div");
        menuInitiator.setAttribute("class","menuInitiator");
        const menuTitle = document.createElement("div");
        menuTitle.setAttribute("class","menuTitle");
        const menuStartTime = document.createElement("div");
        menuStartTime.setAttribute("class","menuStartTime");
        menuInitiator.textContent=doSearchSubject[i].user_name;
        menuTitle.textContent=doSearchSubject[i].subject;
        menuStartTime.textContent=doSearchSubject[i].start_time;

        menuContainer.appendChild(menuInitiator);
        menuContainer.appendChild(menuTitle);
        menuContainer.appendChild(menuStartTime);
        menuSignatureBlock.appendChild(menuContainer);

        const signatureMenu = document.querySelector(".signatureMenu");
        signatureMenu.appendChild(menuSignatureBlock);

        const singleMenuItem=document.getElementById(signatureId);
        singleMenuItem.addEventListener("click",function (e){
            const signatureIdClick = e.currentTarget.id;
            async function loadSingleSignature() {
                try {
                    const response = await fetch("/main/signature/single?clickId="+signatureIdClick, {
                        method: "GET",         
                        headers: new Headers({
                           "content-type": "application/json"
                        })
                    });
                    const data = await response.json();
                    // console.log(data.data[0].file);
                    // console.log(data.data[0]);
                    if(data.ok==true){
                        const sectionContainer = document.querySelector(".sectionContainer");    
                        const trackByIDSetion = document.querySelector(".trackByIDSetion");
                        const trackByIDClickbuttonBlock = document.querySelector(".trackByIDClickbuttonBlock");
                        
                        const result = data.data[0];
                        if(result.turn_person==data.userId){
                            trackByIDClickbuttonBlock.style.display="flex";
                        }

                        sectionContainer.style.display = "none";
                        trackByIDSetion.style.display = "flex";
                        
                        document.querySelector(".trackByIDNavLeftContent").textContent=result.signature_id;
                        document.querySelector(".trackByIDSubjectContent").textContent=result.subject;
                        document.querySelector(".trackByIDInitiatorContent").textContent=result.user_name;
                        document.querySelector(".trackByIDStarttimeContent").textContent=result.start_time;
                        document.querySelector(".trackByIDMessageBlock").textContent=result.text;
                    }
                } catch (error) {
                    console.error(error);
                }
            }
            loadSingleSignature();
            
        }, true)
    }
}


let fileUrl="";
const attachmentInput = document.querySelector(".writeBlockAttachmentBlockInput")
attachmentInput.setAttribute('placeholder', '請選擇檔案');
attachmentInput.addEventListener("change", e => {
    if(e.target.files.length !== 0){
        const picture = e.target.files[0]; // 取得file Object
        const reader = new FileReader();
        const fileMaxSize = 1024; //1MB
        const fileSize = e.target.files[0].size/1024;

        if(fileSize>fileMaxSize){
            alert("附建檔案大小不可大於1MB");
        }else{
            reader.addEventListener("load", () => { // load 時可以取得 fileReader 回傳的結果
                fileUrl=reader.result;
                // console.log(pictureUrl);
                // console.log("fileSize= ",fileSize);
            });
            reader.readAsDataURL(picture);
        }
        
    }
    
});





// //進行中下載功能
const trackByIDDownloadAttachment = document.querySelector('.trackByIDDownloadAttachment');
trackByIDDownloadAttachment.addEventListener('click', (event) => {
  event.preventDefault();
  const url = "https://"+trackByIDDownloadAttachment.title;
  downloadImage(url);
})

// // //歷史紀錄下載功能
// const historyTrackByIDDownloadFileContent = document.querySelector(".historyTrackByIDDownloadFileContent");
// historyTrackByIDDownloadFileContent.addEventListener('click', (event) => {
//     event.preventDefault();
//     const url = "https://"+historyTrackByIDDownloadFileContent.title;
//     console.log(url);
//     // downloadImage(url);
//   })


function downloadImage(url) {
    fetch(url)
    .then(resp => resp.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      // the filename you want
      a.download = 'todo-1.jpg';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      alert('your file has downloaded!'); // or you know, something with better UX...
    }
  ).catch(() => alert('oh no!'));
}









// //下載功能
// const btn = document.getElementById('downloadImage');
// const url = "https://doumq0p9cu8fw.cloudfront.net/pictures/cd3f7897-5e19-4414-9088-94db479a23b2";

// btn.addEventListener('click', (event) => {
//   event.preventDefault();
//   console.log('ABC')
//   downloadImage(url);
// })


// function downloadImage(url) {
//     fetch(url)
//     .then(resp => resp.blob())
//     .then(blob => {
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.style.display = 'none';
//       a.href = url;
//       // the filename you want
//       a.download = 'todo-1.jpg';
//       document.body.appendChild(a);
//       a.click();
//       window.URL.revokeObjectURL(url);
//       alert('your file has downloaded!'); // or you know, something with better UX...
//     }
//   ).catch(() => alert('oh no!'));
// }

