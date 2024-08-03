import { msg2, msg3 } from './sal_alg_html.js';

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

function fetchListings() {
    fetch('/api/applicant_applications')
        .then(response => response.json())
        .then(jobListings => {
            const listingsElement = document.getElementById('jobList');
            listingsElement.innerHTML = '';
            jobListings.forEach(job => {
                //console.log(job._id)
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

                listingsElement.appendChild(jobListDiv);

                jobListDiv.addEventListener('click', function () {
                    showJobInfo(job._id, job.application_id); // Pass the current job's ID to the get_job function
                });
            });

        })
        .catch(error => console.error('Error fetching job listings:', error));
}

document.addEventListener("DOMContentLoaded", function () {
    fetchListings();
});


async function showJobInfo(jobId, applicationId) {
    // Fetch job details from the database
    const jobListing = await getJobListingById(jobId);
    if (!jobListing) {
        console.error('Job listing not found');
        return;
    }
    const application = await getApplication(applicationId);
    if (!application) {
        console.error('Job application not found');
        return;
    }
    console.log(jobListing);
    console.log(application);

    // Display job details
    document.getElementById('jobNameHeader').textContent = jobListing[0].jobTitle + ' Details';

    // Clear previous content
    const jobStatusContainer = document.getElementById('jobDescriptionContainer');
    jobStatusContainer.innerHTML = '';

    // Create area to display job description 
    const jobDesc = document.createElement('div');
    jobDesc.innerHTML = `<strong>Job Description:</strong> <br> ${jobListing[0].jobDescription} <br><br>`;
    jobStatusContainer.appendChild(jobDesc);

    // Create area to display applicant details
    const individualApplicantContainer = document.createElement('div');
    individualApplicantContainer.className = 'jobApplicantContainer';
    individualApplicantContainer.innerHTML = "<strong>Negotiation Status:<strong>"

    // Progress bar
    const progressBarDiv = document.createElement('div');
    progressBarDiv.className = 'progress';
    progressBarDiv.innerHTML = `
    <div class="progress-bar" role="progressbar" style="width: 0%;" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
`;
    individualApplicantContainer.appendChild(progressBarDiv);

    const progressBar = individualApplicantContainer.querySelector('.progress-bar');

    if (application[0].msg_1 == "" && application[0].msg_2 == "" && application[0].msg_3 == "") {
        progressBar.style.width = '0%';
    } else if (application[0].msg_1 != "" && application[0].msg_2 == "" && application[0].msg_3 == "") {
        progressBar.style.width = '33%';
    } else if (application[0].msg_1 != "" && application[0].msg_2 != "" && application[0].msg_3 == "") {
        progressBar.style.width = '66%';
    } else if (application[0].msg_1 != "" && application[0].msg_2 != "" && application[0].msg_3 != "") {
        progressBar.style.width = '100%';
    } else {
        console.error('Invalid progress value');
        return;
    }
    progressBar.innerHTML = ''; // Empty to hide the percentage

    // Append the applicant container to the job applicant container
    jobStatusContainer.appendChild(individualApplicantContainer);


    if (application[0].msg_1 != "" && application[0].msg_2 == "") {
        // Section to show up when applicant salary needed for msg2
        const salaryInputSection = document.createElement('div');
        salaryInputSection.className = 'salaryInputSection';
        salaryInputSection.id = 'inputSection';
        salaryInputSection.innerHTML = "<strong> We are waiting for your desired salary to start finish the negotiation. </strong> <br>";

        const inputBox = document.createElement('input');
        inputBox.type = 'number';
        inputBox.min = 1;
        inputBox.max = 300000;
        inputBox.style.width = '210px';
        inputBox.placeholder = 'Enter desired salary here...';

        // Create text area for private RSA key
        const rsaKeyInput = document.createElement('textarea');
        rsaKeyInput.placeholder = 'Paste your private RSA key here...';
        rsaKeyInput.style.width = '210px';
        rsaKeyInput.style.height = '60px'; // Adjust height as needed
        rsaKeyInput.className = 'rsaKeyInputStyle';

        const submitButton = document.createElement('button');
        submitButton.textContent = 'Submit';
        submitButton.className = 'buttonStyle';

        salaryInputSection.appendChild(inputBox);
        salaryInputSection.appendChild(rsaKeyInput); // Add RSA key input to the section
        salaryInputSection.appendChild(submitButton);

        //error area
        const inputError = document.createElement('div');
        inputError.className = 'errorStyle';
        inputError.style.display = 'none';
        salaryInputSection.appendChild(inputError);

        jobStatusContainer.appendChild(salaryInputSection);

        submitButton.addEventListener('click', function () {
            var desiredSalary = inputBox.value;
            const privateKey = rsaKeyInput.value; // Get the value from the textarea
            if (desiredSalary === '') {
                console.log('You didn’t put anything in the salary input -- please enter a value.');
                inputError.textContent = 'Enter value before submitting...';
                inputError.style.display = 'flex';
            } else if (privateKey === '') {
                console.log('Private key is missing -- please paste your private key.');
                inputError.textContent = 'Private key required before submitting...';
                inputError.style.display = 'flex';
            } else {
                desiredSalary = desiredSalary / 10000;
                msg2(applicationId, desiredSalary, privateKey);
                setTimeout(() => {
                    showJobInfo(jobId, applicationId);
                    inputBox.value = '';
                    rsaKeyInput.value = '';
                }, 1500);
            }
        });
    }

    // if user just applied/not msg1 recieved yet, let user know
    if (application[0].msg_1 == "" && application[0].msg_2 == "" && application[0].msg_3 == "" && application[0].count < 3) {
        const recentApplyDiv = document.createElement('div');
        recentApplyDiv.className = 'newRoundArea';
        recentApplyDiv.style.display = 'flex';
        recentApplyDiv.innerHTML = `<strong>Waiting on employer to review application and begin negotiation.</strong>`
        jobStatusContainer.appendChild(recentApplyDiv);
    }

    // Go another round area, up to 3 rounds and if failed three times end negotiation
    if (application[0].msg_1 != "" && application[0].msg_2 != "" && application[0].msg_3 == "true" && application[0].count < 3) {
        const newRoundDiv = document.createElement('div');
        newRoundDiv.className = 'newRoundArea';
        newRoundDiv.style.display = 'flex';
        newRoundDiv.innerHTML = `<strong>Negotiation was <span style="color: red"> not a success</span>. On trial ${application[0].count} of 3, waiting on employer to start a new round.</strong>`
        jobStatusContainer.appendChild(newRoundDiv);
    } else if (application[0].msg_1 != "" && application[0].msg_2 != "" && application[0].msg_3 == "true" && application[0].count == 3) {
        const endRoundDiv = document.createElement('div');
        endRoundDiv.className = 'endRoundArea';
        endRoundDiv.style.display = 'flex';
        endRoundDiv.innerHTML = `<strong>Negotiation was <span style="color: red"> not a success</span>. ${application[0].count} of 3 negotiations failed, negotation over.</strong>`
        const endNegotiationButton = document.createElement('button');
        const endNegotiationText = document.createTextNode('Finish');
        endNegotiationButton.id = 'buttonID';
        endNegotiationButton.className = 'buttonStyle';
        endNegotiationButton.addEventListener('click', async function () {
            // Delete Application
            try {
                const response = await fetch(`/api/delete_application/${application[0]._id}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    console.log('Job application deleted successfully');
                    // Refresh screen
                    fetchListings();
                    document.getElementById('jobDetail').style.display = 'none';

                } else {
                    console.error('Failed to delete job application');
                    // Optionally, handle error cases
                }
            } catch (error) {
                console.error('Error deleting job application:', error);
                // Optionally, handle error cases
            }
        })
        endNegotiationButton.appendChild(endNegotiationText);
        endRoundDiv.appendChild(endNegotiationButton);
        jobStatusContainer.appendChild(endRoundDiv);
    }

    // Negotiation Successfull
    const negotiationSucessDiv = document.createElement('div');
    negotiationSucessDiv.className = 'negotiationSuccess';
    if (application[0].msg_1 != "" && application[0].msg_2 != "" && application[0].msg_3 == "false" && application[0].count <= 3) {
        negotiationSucessDiv.style.display = 'flex';
    } else if (application[0].msg_1 == "" || application[0].msg_2 == "" || application[0].msg_3 != "" || application[0].count >= 3) {
        negotiationSucessDiv.style.display = 'none';
    }
    negotiationSucessDiv.innerHTML = '<strong>The negotiation was a <span style="color: green">success</span>, employer will reach out shortly.</strong>'
    jobStatusContainer.appendChild(negotiationSucessDiv);

    // Unhide the section with applicants
    document.getElementById('jobDetail').style.display = 'block';
}

// Functions to fetch data from the database
async function getJobListingById(jobId) {
    try {
        const response = await fetch(`/api/job_listing?jobId=${jobId}`);
        const jobListing = await response.json();
        console.log()
        return jobListing;
    } catch (error) {
        console.error('Error fetching job listing:', error);
        return null;
    }
}
async function getApplication(applicationId) {
    try {
        const response = await fetch(`/api/job_application?applicationId=${applicationId}`);
        const application = await response.json();
        return application;
    } catch (error) {
        console.error('Error fetching job application:', error);
        return null;
    }
}
