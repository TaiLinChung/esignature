document.querySelector(".registerBlock").style.display="None";
const general= document.querySelector(".general")
const profession= document.querySelector(".profession")

general.addEventListener("click",function (e) {
    document.querySelector(".registerBlock").style.display="None";
    document.querySelector(".loginBlock").style.display="Block";
});
const loginLoginButton = document.querySelector(".loginLoginButton");  
loginLoginButton.addEventListener("click", async () => {
    const account=document.querySelector(".loginAccountInput").value;
    const password=document.querySelector(".loginPasswordInput").value;
    try {
        //============================  /login/confirm  ============================
        const response = await fetch("/login/confirm", {
            method: "POST", 
            body: JSON.stringify({
                "user_account":account ,
                "user_password":password
            }),         
            headers: new Headers({
                "content-type": "application/json"
            })
        });
        const data = await response.json();
        // //============================  跳轉頁面  ============================
        if(data.ok){
            window.location.href = '/main';
        }else{
            // window.location.href = '/login';
            console.log(data.message);
            document.querySelector(".loginMessage").textContent=data.message;
            document.querySelector(".loginMessage").style.color="red";
            document.querySelector(".loginMessageBlock").style.display="block";

        }
    } catch (error) {
        console.error(error);
    }
});



profession.addEventListener("click",function (e) {
    document.querySelector(".registerBlock").style.display="Block";
    document.querySelector(".loginBlock").style.display="None";  
});

const registerRegisterButton = document.querySelector(".registerRegisterButton");
registerRegisterButton.addEventListener("click", async () => {
    const account = document.querySelector(".registerAccountInput").value;
    const password = document.querySelector(".registerPasswordInput").value;
    const email = document.querySelector(".registerEmailInput").value;
    if(account=="" | password=="" | email==""){
        alert("請完整填寫註冊資料");
    }

    try {
        //============================  /login/confirm  ============================
        const response = await fetch("/register/confirm", {
            method: "POST", 
            body: JSON.stringify({
                account:account,
                password:password,
                email:email
            }),         
            headers: new Headers({
                "content-type": "application/json"
            })
        });
        const data = await response.json();
        // //============================  跳轉頁面  ============================
        if(data.ok){
            document.querySelector(".registerMessage").textContent=data.message;
            document.querySelector(".registerMessage").style.color="green";
            document.querySelector(".registerMessageBlock").style.display="block";
        }else{
            // window.location.href = '/login';
            document.querySelector(".registerMessage").textContent=data.message;
            document.querySelector(".registerMessage").style.color="red";
            document.querySelector(".registerMessageBlock").style.display="block";

        }
    } catch (error) {
        console.error(error);
    }

});
