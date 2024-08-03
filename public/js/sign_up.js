document.addEventListener("DOMContentLoaded", function(){
  const redirect = document.querySelector("#redirect");
  redirect.addEventListener("click", function(event) {
    event.preventDefault();

    fetch('/login')
      .then(data => {
        console.log('Success:', data);
        window.location.href = '/login'; // Redirect to login page on success
      })
  })
})


document.addEventListener("DOMContentLoaded", function() {
  const signupForm = document.querySelector("form"); // Adjust the selector as needed
  signupForm.addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent the default form submission

    // Collect form data
    const accountType = document.querySelector('input[name="accountType"]:checked').value;
    const first_name = (document.getElementById("first_name").value).toLowerCase();
    const last_name = (document.getElementById("last_name").value).toLowerCase();
    const email = (document.getElementById("email").value).toLowerCase();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm_password").value;

    // Optional: Validate the data here (e.g., check if passwords match)

    // Send the data using Fetch API
    console.log(first_name, last_name, email, password, accountType)
    fetch('/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ first_name, last_name, email, password, accountType }),
    })
    .then(response => {
      if (!response.ok) {
        var allElements = document.querySelectorAll('input[name="sign_up"]');
        document.querySelector('.error').innerHTML = ""
        for (var i=0; i<allElements.length; i++) {
            allElements[i].setAttribute('style', 'border: 2px solid #f6f6f6;');
        }
        console.log("error " + response.status)
        if(response.status == 300){
          console.log(allElements)
          for (var i=0; i<allElements.length; i++) {
            console.log(allElements[i].value)
            if(allElements[i].value == "") {
              allElements[i].setAttribute('style', 'border: 1px solid red;');
            }
          }
          console.log(response.status == 300, "response = 300")

          throw Error('Missing requirements');
        }

        if(response.status == 400){
          console.log(response.status = 400, "response = 400")
          throw Error('Email already exists');
        }
      }
      return response.json(); 
    })
    .then(data => {
      console.log('Success:', data);
      window.location.href = '/login'; // Redirect to login page on success
    })
    .catch((error) => {
      document.querySelector(".error").innerHTML = error
      alert(error.message)
      console.error('Error:', error);
      // Optionally, handle/display error messages to the user
    });
  });
});