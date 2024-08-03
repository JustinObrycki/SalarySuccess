document.addEventListener("DOMContentLoaded", function(){
  const redirect = document.querySelector("#redirect");
  redirect.addEventListener("click", function(event) {
    event.preventDefault();

    fetch('/signup')
      .then(data => {
        console.log('Success:', data);
        window.location.href = '/signup'; // Redirect to login page on success
      })
  })
})



document.addEventListener("DOMContentLoaded", function() {
const loginForm = document.querySelector("form");
  loginForm.addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent default form submission

    const email = (document.getElementById("email").value).toLowerCase();
    const password = document.getElementById("password").value;

    fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })
    .then(response => {
      if (response.ok) {
        console.log(response.ok)

        return response.json(); // If the response is OK, parse the JSON body
      }
      // If the response is not OK, parse the JSON body and then throw an error
      return response.json().then(body => {
        throw new Error(body.message); // Use the message from the server's response
      });
    })
    .then(data => {
      if (data.redirect) {
        console.log(data.redirect)
        window.location.href = data.redirect; // Redirect based on server response
      }
    })
    .catch((error) => {
      console.error('Error:', error);
      alert(error.message); // Display error message
    });
  });
});
