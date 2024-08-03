import { msg1, msg3 } from './sal_alg_html.js';

document.addEventListener("DOMContentLoaded", function () {
    const home = document.querySelector(".navbar-brand");
    home.addEventListener("click", function (event) {
      event.preventDefault();
  
      fetch('/employer_page')
        .then(data => {
          console.log('Success:', data);
          window.location.href = '/employer_page'; // Redirect to login page on success
        })
    })
  })

  document.addEventListener("DOMContentLoaded", function () {
    const home = document.querySelector("#MyListings");
    home.addEventListener("click", function (event) {
      event.preventDefault();
  
      fetch('/employer_page')
        .then(data => {
          console.log('Success:', data);
          window.location.href = '/employer_page'; // Redirect to login page on success
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

        fetch('/employer_page')
            .then(data => {
                console.log('Success:', data);
                window.location.href = '/employer_page';
            })
    })
})

document.addEventListener("DOMContentLoaded", function () {
    const redirect = document.querySelector("#account");
    redirect.addEventListener("click", function (event) {
        event.preventDefault();

        fetch('/employer_account_page')
            .then(data => {
                console.log('Success:', data);
                window.location.href = '/employer_account_page'; // Redirect to login page on success
            })
    })
})

async function showJobApplicants(jobId) {
    //console.log(jobId);
    // Fetch job details from the database
    const jobListing = await getJobListingById(jobId);
    if (!jobListing) {
        console.error('Job listing not found');
        return;
    }
    //console.log(jobListing);

    // Fetch applicants for the job from the database
    const jobApplications = await getJobApplications(jobId);
    //console.log(jobApplications);

    // Display job details
    document.getElementById('jobNameHeader').textContent = jobListing[0].jobTitle + ' Details';

    // Clear previous content
    const jobApplicantContainer = document.getElementById('allJobApplicants');
    jobApplicantContainer.innerHTML = '';

    const jobDesc = document.createElement('div');
    jobDesc.className = 'jobApplicantContainer';
    jobDesc.innerHTML = `<strong>Job Description:</strong> ${jobListing[0].jobDescription}`;
    jobApplicantContainer.appendChild(jobDesc);

    // Iterate through applicants
    jobApplications.forEach(async applicationObject => {
        //console.log("applicant id: " + applicationObject.applicant_id);

        // Fetch applicant details from the database
        const applicant = await getUserById(applicationObject.applicant_id);
        if (!applicant) {
            console.error(`Applicant with ID ${applicationObject.applicant_id} not found`);
            return;
        }
        //console.log(applicant);

        // Create HTML elements to display applicant details
        const individualApplicantContainer = document.createElement('div');
        individualApplicantContainer.className = 'jobApplicantContainer';

        // Display applicant name
        const applicantDiv = document.createElement('div');
        applicantDiv.className = 'jobApplicantInfo';
        applicantDiv.textContent = applicant[0].first_name + ' ' + applicant[0].last_name; // Assuming 'name' is a field in the user document
        individualApplicantContainer.appendChild(applicantDiv);

        // Display resume link
        const resumeLink = document.createElement('button');
        resumeLink.id = 'resumeLink';
        resumeLink.className = 'btn-primary'
        resumeLink.textContent = 'Download Resume';
        resumeLink.addEventListener('click', () => {
            if (applicationObject.applicantResume && applicationObject.applicantResume.trim() !== '') {
                window.open(`/download/${applicationObject.applicantResume}`, '_blank');
            } else {
                alert('No resume available to download.');
            }
        });
        applicantDiv.appendChild(resumeLink);

        // Take in salary and private key area
        const getInputArea = document.createElement('div');
        getInputArea.id = 'getInputArea' + applicationObject.applicant_id;
        if (applicationObject.count > 0) {
            getInputArea.style.display = 'block';
        } else {
            getInputArea.style.display = 'none';
        }
        individualApplicantContainer.appendChild(getInputArea);

        // Error Area
        const inputError = document.createElement('div');
        inputError.id = 'inputError' + applicationObject.applicant_id;
        inputError.style.display = 'none';
        inputError.className = 'errorStyle';
        individualApplicantContainer.appendChild(inputError);

        // Negotiation Area
        const negotiationDiv = document.createElement('div');
        negotiationDiv.id = 'jobApplicantContainer' + applicant[0]._id;
        negotiationDiv.className = 'negotiationArea';
        negotiationDiv.innerHTML = "<strong>Negotiation Progress:</strong>";


        const application = await getApplication(applicationObject._id);
        if (application[0].msg_1 == "" && application[0].count == "0") {
            // Decline Button
            const declineButton = document.createElement('button');
            const declineText = document.createTextNode('Decline');
            declineButton.id = 'buttonID';
            declineButton.className = 'buttonStyle';
            declineButton.addEventListener('click', function () {
                declineNegotiation(applicationObject._id, jobListing[0]._id);
            })
            declineButton.appendChild(declineText);
            applicantDiv.appendChild(declineButton);

            // Negotiate Button
            const negotiateButton = document.createElement('button');
            const negotiateText = document.createTextNode('Negotiate');
            negotiateButton.id = 'buttonID';
            negotiateButton.className = 'buttonStyle';
            negotiateButton.addEventListener('click', function () {
                showNegotiation(jobListing[0]._id, applicant[0]._id, applicationObject._id, applicant[0].publicKey, applicationObject.count);
                negotiateButton.style.display = 'none';
            })
            negotiateButton.appendChild(negotiateText);
            applicantDiv.appendChild(negotiateButton);
            negotiationDiv.style.display = 'none';
        } else if (application[0].msg_1 != "") {
            negotiationDiv.style.display = 'block';

            // Progress bar
            const progressBarDiv = document.createElement('div');
            progressBarDiv.className = 'progress';
            progressBarDiv.innerHTML = `
            <div class="progress-bar" role="progressbar" style="width: 0%;" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
        `;
            progressBarDiv.style.marginBottom = '10px';

            negotiationDiv.appendChild(progressBarDiv);

            const progressBar = negotiationDiv.querySelector('.progress-bar');
            if (application[0].msg_1 != "" && application[0].msg_2 == "" && application[0].msg_3 == "") {
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
        }

        // Employer Starts Msg3 Section
        const startMsg3Area = document.createElement('div');
        startMsg3Area.className = 'startMsg3Area';
        if (application[0].msg_1 != "" && application[0].msg_2 != "" && application[0].msg_3 == "") {
            startMsg3Area.style.display = 'flex';
        } else if (application[0].msg_1 != "" && application[0].msg_2 == "" && application[0].msg_3 != "") {
            startMsg3Area.style.display = 'none';
        }
        startMsg3Area.innerHTML = '<strong>Applicant submitted their salary, negotiate?</strong>'
        const startMsg3Button = document.createElement('button');
        const startMsg3Text = document.createTextNode('Continue');
        startMsg3Button.id = 'buttonID';
        startMsg3Button.className = 'buttonStyle';
        startMsg3Button.addEventListener('click', function () {
            // PUT IN LOGIC HERE TO START MSG3 CLEAR LOCALSTORAGE  "application_id"
            msg3(application[0]._id, localStorage.getItem(application[0]._id))
            localStorage.removeItem(application[0]._id)
            showJobApplicants(jobId)
            // will also want to call showJobApplicants here to refresh the page and show the change 
        })
        startMsg3Button.appendChild(startMsg3Text);
        startMsg3Area.appendChild(startMsg3Button);
        negotiationDiv.appendChild(startMsg3Area);

        // Go another round area, up to 3 rounds and if failed three times end negotiation
        if (application[0].msg_1 != "" && application[0].msg_2 != "" && application[0].msg_3 == "true" && application[0].count < 3) {
            const newRoundDiv = document.createElement('div');
            newRoundDiv.className = 'newRoundArea';
            newRoundDiv.style.display = 'flex';
            newRoundDiv.innerHTML = `<strong>Negotiation was <span style="color: red"> not a success</span>. On trial ${applicationObject.count} of 3, proceed with new round?</strong>`
            const startNewRoundButton = document.createElement('button');
            const startNewRoundText = document.createTextNode('Start');
            startNewRoundButton.id = 'buttonID';
            startNewRoundButton.className = 'buttonStyle';
            startNewRoundButton.addEventListener('click', async function () {
                // PUT IN LOGIC HERE TO START NEW ROUND
                /// MAKE SURE to SET X BACK TO "" IN DATABASE
                // will also want to call showJobApplicants here to refresh the page and show the change 
                try {
                    const response = await fetch('/start_new_round', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ _id: application[0]._id, msg_1: "", msg_2: "", msg_3: "", x: "" })
                    });

                    if (!response.ok) {
                        const errorDetails = await response.text();
                        throw new Error(`Request failed with status ${response.status}: ${errorDetails}`);
                    }
                    if (response.ok) {
                        setTimeout(() => {
                            getInputArea.style.display = 'block';
                            negotiationDiv.style.display = 'none';
                            showNegotiation(jobListing[0]._id, applicant[0]._id, applicationObject._id, applicant[0].publicKey, applicationObject.count);
                        }, 500);
                    }
                    return response.json();;
                } catch (error) {
                    console.error('Error starting new round:', error);
                    return null;
                }
            })
            startNewRoundButton.appendChild(startNewRoundText);
            newRoundDiv.appendChild(startNewRoundButton);
            negotiationDiv.appendChild(newRoundDiv);
        } else if (application[0].msg_1 != "" && application[0].msg_2 != "" && application[0].msg_3 == "true" && application[0].count == 3) {
            const endRoundDiv = document.createElement('div');
            endRoundDiv.className = 'endRoundArea';
            endRoundDiv.style.display = 'flex';
            endRoundDiv.innerHTML = `<strong>Negotiation was <span style="color: red"> not a success</span>. ${applicationObject.count} of 3 negotiations failed, negotation over.</strong>`
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
                        // Refresh the applicants to screen
                        showJobApplicants(application[0].job_id);
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
            negotiationDiv.appendChild(endRoundDiv);
        }


        // Negotiation Successfull
        const negotiationSucessDiv = document.createElement('div');
        negotiationSucessDiv.className = 'negotiationSuccess';
        if (application[0].msg_1 != "" && application[0].msg_2 != "" && application[0].msg_3 == "false" && application[0].count <= 3) {
            negotiationSucessDiv.style.display = 'flex';
        } else if (application[0].msg_1 == "" || application[0].msg_2 == "" || application[0].msg_3 != "" || application[0].count >= 3) {
            negotiationSucessDiv.style.display = 'none';
        }
        negotiationSucessDiv.innerHTML = '<strong>The negotiation was a <span style="color: green">success</span>, reach out to applicant.</strong>'
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
                    // Refresh the applicants to screen
                    showJobApplicants(application[0].job_id);
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
        negotiationSucessDiv.appendChild(endNegotiationButton);
        negotiationDiv.appendChild(negotiationSucessDiv);

        individualApplicantContainer.appendChild(negotiationDiv);
        // Append the applicant container to the job applicant container
        jobApplicantContainer.appendChild(individualApplicantContainer);

        if (application[0].count > 0 && application[0].msg_1 == "") {
            showNegotiation(jobListing[0]._id, applicant[0]._id, applicationObject._id, applicant[0].publicKey, applicationObject.count);
        }
    });

    // Unhide the section with applicants
    document.getElementById('jobApplicants').style.display = 'block';
}

async function showNegotiation(jobID, applicantID, applicationID, applicantPublicKey, roundCount) {
    //var msg_1 = prompt("Enter the desired salary you wish to pay for this position:")
    const inputArea = document.getElementById('getInputArea' + applicantID);
    inputArea.style.display = 'block';

    // salary input box
    const salaryInput = document.createElement('input');
    salaryInput.type = 'number';
    salaryInput.min = 1;
    salaryInput.max = 300000;
    salaryInput.style.width = '210px';
    salaryInput.style.display = 'block';
    salaryInput.style.marginBottom = '10px';
    salaryInput.placeholder = 'Enter desired salary here...';
    salaryInput.id = 'salaryInput' + applicantID;
    inputArea.appendChild(salaryInput);

    // submit button
    const submitButton = document.createElement('button');
    submitButton.textContent = 'Submit Info';
    submitButton.className = 'buttonStyle';
    submitButton.style.display = 'block';
    submitButton.addEventListener('click', function () {
        //msg1(applicationID, applicantPublicKey, parseInt(msg_1));
        const count = parseInt(roundCount) + 1;
        const msg_1 = salaryInput.value;
        //console.log(`Salary input was: ${msg_1} and the key was: ${privateKey}`);

        var sal = parseInt(msg_1);
        var _id = applicationID;


        if (msg_1 == "") {
            const errorDiv = document.getElementById('inputError' + applicantID);
            errorDiv.textContent = 'Please enter a salary';
            errorDiv.style.display = 'block';
        } else if (sal % 10000 != 0) {
            console.log('Error: Value not a $10,000 increment');

            const errorDiv = document.getElementById('inputError' + applicantID);
            errorDiv.textContent = 'Please enter a value in the hundered thousands';
            errorDiv.style.display = 'block';
        } else {
            sal = sal / 10000;
            localStorage.setItem(_id, sal);
            msg1(_id, sal, count);
            setTimeout(() => {
                showJobApplicants(jobID);
            }, 1000);
        }

    })
    inputArea.appendChild(submitButton)


    //console.log(`jobId is ${jobID}, applicantId is ${applicantID}, and applicationID is ${applicationID}`);

    //console.log(msg_1);

}

async function declineNegotiation(applicationID, jobID) {
    try {
        const response = await fetch(`/api/delete_application/${applicationID}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            console.log('Job application deleted successfully');
            // Refresh the applicants to screen
            showJobApplicants(jobID);
        } else {
            console.error('Failed to delete job application');
            // Optionally, handle error cases
        }
    } catch (error) {
        console.error('Error deleting job application:', error);
        // Optionally, handle error cases
    }
}

// Functions to fetch data from the database
async function getJobListingById(jobId) {
    try {
        const response = await fetch(`/api/job_listing?jobId=${jobId}`);
        const jobListing = await response.json();
        return jobListing;
    } catch (error) {
        console.error('Error fetching job listing:', error);
        return null;
    }
}
async function getJobApplications(jobId) {
    try {
        const response = await fetch(`/api/job_applicants?jobId=${jobId}`);
        const applicants = await response.json();
        return applicants;
    } catch (error) {
        console.error('Error fetching job applicants:', error);
        return [];
    }
}
async function getUserById(userId) {
    try {
        const response = await fetch(`/api/user?userId=${userId}`);
        const user = await response.json();
        return user;
    } catch (error) {
        console.error('Error fetching user:', error);
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

document.addEventListener("DOMContentLoaded", function () {
    function showListingBlock(jobID, jobTitle, jobLocation, jobDescription) {
        const jobListContainer = document.getElementById('jobList');

        const jobListDiv = document.createElement('div');
        jobListDiv.classList = 'jobItem';

        //jobListDiv.setAttribute('onclick', 'handleJobListingClick(\"' + jobID + '\")');
        jobListDiv.addEventListener('click', function () {
            showJobApplicants(jobID);
        })

        const jobListDetailDiv = document.createElement('div');
        jobListDetailDiv.className = 'jobListDetail';
        //
        //jobListDiv.textContent = ;
        jobListDetailDiv.innerHTML = `<strong>${jobTitle}</strong> <br> ${jobLocation}`;
        jobListDiv.appendChild(jobListDetailDiv);

        jobListContainer.appendChild(jobListDiv);

        // Delete job listing
        const deleteButtonDiv = document.createElement('div');
        deleteButtonDiv.id = 'deleteButtonDiv';
        const deleteButton = document.createElement('button');
        const buttonText = document.createTextNode('Delete Listing');
        deleteButton.appendChild(buttonText);
        deleteButton.className = 'buttonStyle';
        deleteButton.addEventListener('click', function () {
            deleteJob(jobID)
        })

        deleteButtonDiv.appendChild(deleteButton);
        jobListContainer.appendChild(deleteButtonDiv);

    }

    fetch('/api/employer_job_listings')
        .then(response => response.json())
        .then(jobListings => {
            jobListings.forEach(job => {
                showListingBlock(job._id, job.jobTitle, job.jobLocation, job.jobDescription);
            });

        })
        .catch(error => console.error('Error fetching job listings:', error));
});

async function deleteJob(jobID) {
    try {
        const response = await fetch(`/api/delete_job/${jobID}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            console.log('Job deleted successfully');
            // Refresh the applicants to screen
            //showJobApplicants(jobID);
            location.reload();
        } else {
            console.error('Failed to delete job');
            // Optionally, handle error cases
        }
    } catch (error) {
        console.error('Error deleting job:', error);
        // Optionally, handle error cases
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const createJobForm = document.querySelector("#newJobInfo"); // Adjust the selector as needed
    //console.log(createJobForm)
    createJobForm.addEventListener("submit", function (event) {
        event.preventDefault(); // Prevent the default form submission
        //console.log("in")
        // Collect form data
        const jobTitle = (document.getElementById("addJobTitle").value);
        const jobLocation = (document.getElementById("addJobLocation").value);
        const jobDescription = document.getElementById("addJobDescription").value;

        // Send the data using Fetch API
        //console.log(jobTitle, jobLocation, jobDescription)
        fetch('/create_job', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ jobTitle, jobLocation, jobDescription }),
        })
            .then(response => {
                if (!response.ok) {
                    console.log("error")
                    console.log("error " + response.status)
                    if (response.status == 400) {
                        throw Error('Missing requirements');
                    }
                }
                jobListings.push([jobTitle, jobLocation, jobDescription])
                return response.json();
            })
            .catch((error) => {
                document.querySelector(".error").textContent = error
                alert(error.message)
                console.error('Error:', error);
                // Optionally, handle/display error messages to the user
            });

        hideAddJobSection();
        location.reload(); //reload page to update the job listings.
    });
});


function showAddJobSection() {
    document.getElementById('newJobInfo').style.display = 'block'; // Show input area for new job
    document.getElementById('addJobButton').style.display = 'none'; // Hide the add job button, not needed
}
document.getElementById("addJobButton").addEventListener("click", showAddJobSection);

function hideAddJobSection() {
    document.getElementById('newJobInfo').style.display = 'none'; // Hide input area for new job
    document.getElementById('addJobButton').style.display = 'inline'; // Show add job button

    // Clearing the input boxes
    document.getElementById('addJobTitle').value = '';
    document.getElementById('addJobLocation').value = '';
    document.getElementById('addJobDescription').value = '';
}
