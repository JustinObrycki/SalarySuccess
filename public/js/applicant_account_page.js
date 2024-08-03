document.addEventListener("DOMContentLoaded", function () {
  const home = document.querySelector(".navbar-brand");
  home.addEventListener("click", function (event) {
    event.preventDefault();

    fetch('/applicant_page')
      .then(data => {
        console.log('Success:', data);
        window.location.href = '/applicant_page'; // Redirect to login page on success
      })
  })
})


document.addEventListener("DOMContentLoaded", function () {
  const login = document.querySelector("#logout");
  login.addEventListener("click", function (event) {
    event.preventDefault();

    fetch('/login')
      .then(data => {
        console.log('Success:', data);
        window.location.href = '/login'; // Redirect to login page on success
      })
  })
})

document.addEventListener("DOMContentLoaded", function () {
  const redirect = document.querySelector("#home");
  redirect.addEventListener("click", function (event) {
    event.preventDefault();

    fetch('/applicant_page')
      .then(data => {
        console.log('Success:', data);
        window.location.href = '/applicant_page'; // Redirect to login page on success
      })
  })
})

document.addEventListener("DOMContentLoaded", function () {
  const redirect = document.querySelector("#JobSearch");
  redirect.addEventListener("click", function (event) {
    event.preventDefault();

    fetch('/applicant_page')
      .then(data => {
        console.log('Success:', data);
        window.location.href = '/applicant_page'; // Redirect to login page on success
      })
  })
})

document.addEventListener("DOMContentLoaded", function () {
  const redirect = document.querySelector("#negotiation");
  redirect.addEventListener("click", function (event) {
    event.preventDefault();

    fetch('/applicant_negotiation_page')
      .then(data => {
        console.log('Success:', data);
        window.location.href = '/applicant_negotiation_page'; // Redirect to login page on success
      })
  })
})

document.addEventListener("DOMContentLoaded", function () {
  const redirect = document.querySelector("#MyNegotiations");
  redirect.addEventListener("click", function (event) {
    event.preventDefault();

    fetch('/applicant_negotiation_page')
      .then(data => {
        console.log('Success:', data);
        window.location.href = '/applicant_negotiation_page'; // Redirect to login page on success
      })
  })
})


function getAndDisplayUserInfo() {
  fetch('/api/user')
    .then(response => response.json())
    .then(user => {
      const nameSection = document.getElementById('user-info-name');
      const accountTypeSection = document.getElementById('user-info-account-type');
      const emailSection = document.getElementById('user-info-email');

      nameSection.innerHTML = `<strong>Name:</strong> ${user[0].first_name} ${user[0].last_name}`;
      accountTypeSection.innerHTML = `<strong>Account Type:</strong> ${user[0].accountType}`;
      emailSection.innerHTML = `<strong>Email:</strong> ${user[0].email}`;


    })
    .catch(error => console.error('Error fetching user:', error));
}

document.addEventListener("DOMContentLoaded", function () {
  getAndDisplayUserInfo();

  const submitButton = document.getElementById('submitAccountChange');
  submitButton.addEventListener('click', function () {
    const newFName = document.getElementById('firstName').value;
    document.getElementById('firstName').value = '';
    const newLName = document.getElementById('lastName').value;
    document.getElementById('lastName').value = '';
    const newEmail = document.getElementById('email').value;
    document.getElementById('email').value = '';

    const errorSection = document.getElementById('editError');
    if (newFName == "" && newLName == "" && newEmail == "") {
      errorSection.style.display = "flex";
      errorSection.textContent = "Must fill in at least one box."
    }
    else {
      errorSection.style.display = "none";
      changeUserInfo(newFName, newLName, newEmail);
    }
  })
});

function changeUserInfo(new_first_name, new_last_name, new_email) {
  fetch('/edit_account', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ new_first_name, new_last_name, new_email }),
  })
    .then(response => {
      if (response.ok) {
        //console.log(response.ok)
        getAndDisplayUserInfo();

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
}