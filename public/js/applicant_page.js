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

document.addEventListener("DOMContentLoaded", function () {
  fetch('/api/job_listings')
    .then(response => response.json())
    .then(jobListings => {
      const listingsElement = document.getElementById('jobList');
      jobListings.forEach(job => {
        //console.log(job._id)
        const jobListDiv = document.createElement('div');
        jobListDiv.classList = 'jobItem';
        jobListDiv.setAttribute('id', job._id)
        //jobListDiv.innerHTML = `<strong>${job.jobTitle}</strong> <br> ${job.jobLocation}`;
        //jobListDiv.setAttribute('onclick', 'get_info(this.id)');

        const jobListDetailDiv = document.createElement('div');
        jobListDetailDiv.className = 'jobListDetail';
        jobListDetailDiv.innerHTML = `<strong>${job.jobTitle}</strong> <br> ${job.jobLocation}`;
        jobListDiv.appendChild(jobListDetailDiv);

        listingsElement.appendChild(jobListDiv);

        jobListDiv.addEventListener('click', function () {
          get_info(job._id); // Pass the current job's ID to the get_job function
        });
      });

    })
    .catch(error => console.error('Error fetching job listings:', error));
});

function get_info(id) {
  fetch('/get_job', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ job_id: id }), // Make sure you're stringifying the body
  })
    .then(response => {
      if (!response.ok) {
        throw Error('Could not fetch job details');
      }
      //console.log("Response OK");
      return response.json();
    })
    .then(job => {
      // Process and display the jobInfo as needed
      //console.log("Job Info:", job);
      document.getElementById('jobNameHeader').textContent = job.jobTitle + ' Details';

      document.getElementById('jobDescription').textContent = job.jobDescription;
      document.getElementById('jobDetail').style.display = 'block'; // Show job details

      document.getElementById('addResumeContainer').style.display = 'none';
      document.getElementById('applyButton').style.display = 'inline';
      document.getElementById('applyButton').addEventListener('click', clickedApply(job._id, job.employer_id))
    })
    .catch(error => console.error('Error fetching job details:', error));
}


function clickedApply(job_id, employer_id) {
  const applyDiv = document.createElement('div');

  document.getElementById('applyButton').style.display = 'none';
  document.getElementById('addResumeContainer').style.display = 'grid';

  //NEED TO ADD APPLICATION TO DATABASE
  const form = document.querySelector('#uploadForm');
  const uploadButton = form.querySelector('button[type="submit"]');
  form.addEventListener('submit', function(event) {
    uploadButton.textContent = 'Uploading...';
    uploadButton.disabled = true;
    //showLoader();
    event.preventDefault();

    const formData = new FormData(form);
    fetch('/uploadResume', {
        method: 'POST',
        body: formData,
    })
    .then(response =>  {
      if (!response.ok) {
        throw Error('Could upload application details');
      }

      return response.json()
    })
    .then(resume => {
        uploadButton.textContent = 'Submit Application';
        uploadButton.disabled = false;
        console.log(resume.fileID)
        const applicantResume = resume.fileID
        //hideLoader();
        createApplication(applicantResume, job_id, employer_id)
    });
  });
}

 function createApplication(applicantResume_id, job_id, employer_id) {
  console.log("Creating Application")
  fetch('/create_applicant', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ applicantResume_id, employer_id, job_id}), // Make sure you're stringifying the body
  })
  .then(response => {
    if (!response.ok) {
      throw Error('Could upload application details');
    }
    //console.log("Response OK");
    return response.json();
  })
}

document.addEventListener("DOMContentLoaded", function () {
  const searchForm = document.getElementById('searchForm')
  searchForm.addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent the default form submission
    const searchTerm = document.getElementById('searchInput').value;
    fetch(`/api/search_jobs?term=${encodeURIComponent(searchTerm)}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json(); // Proceed to parse the response as JSON
      })
      .then(data => {
        displaySearchResults(data); // Function to process and display search results
      })
      .catch(error => {
        console.error('Error:', error);
      });
  });
  
});

function displaySearchResults(results) {
  const listingsElement = document.getElementById('jobList');
  listingsElement.innerHTML = ''; // Clear previous results
  results.forEach(job => {
    const jobListDiv = document.createElement('div');
    jobListDiv.classList = 'jobItem';
    jobListDiv.setAttribute('id', job._id)
    //jobListDiv.textContent = job.jobTitle;
    //jobListDiv.setAttribute('onclick', 'get_info(this.id)');
    const jobListDetailDiv = document.createElement('div');
    jobListDetailDiv.className = 'jobListDetail';
    jobListDetailDiv.innerHTML = `<strong>${job.jobTitle}</strong> <br> ${job.jobLocation}`;
    jobListDiv.appendChild(jobListDetailDiv);
    listingsElement.appendChild(jobListDiv);

    jobListDiv.addEventListener('click', function () {
      get_info(job._id); // Pass the current job's ID to the get_job function
    });

  });

}

//

//   job.addEventListener("click", function(event) {
//     event.preventDefault();
//     console.log("job", job)
//     const job_id = job.id
//     console.log(job_id)

//     // fetch('/get_job')
//     // .then()
//   })
// })