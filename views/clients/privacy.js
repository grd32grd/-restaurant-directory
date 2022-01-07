// Variables
let save = document.getElementById('save');
let yes = document.getElementById('yes');
let no = document.getElementById('no');

// Function that send a PUT request allow users to modify privacy settings
save.onclick = () =>{

    //Grabs user's database ObjectID from the URL
    let id = window.location.href.substring(28,window.location.href.length);

    if (yes.checked){

        let x = new XMLHttpRequest();
        x.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                alert("Set to private.");
    
            } else if (this.readyState == 4 && this.status == 400) {
                alert(JSON.parse(x.responseText));
            }
        }

        x.open("PUT", "http://localhost:3000/users/private/" + id);
        x.setRequestHeader("Content-Type", "text/plain");
        x.send(JSON.stringify(id));
    }

    else if (no.checked){

        let y = new XMLHttpRequest();
        y.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                alert("Set to public.");
    
            } else if (this.readyState == 4 && this.status == 400) {
                alert(JSON.parse(y.responseText));
            }
        }

        y.open("PUT", "http://localhost:3000/users/public/" + id);
        y.setRequestHeader("Content-Type", "text/plain");
        y.send(JSON.stringify(id));

    }
    else {
        alert("Choose a option.");
    } 
}