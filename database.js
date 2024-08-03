const express = require('express');
const bcrypt = require('bcrypt');
const path = require('path');
const NodeRSA = require('node-rsa'); // verify if it works on client side | add a servlet - web code it.
const multer = require('multer');
const { MongoClient, GridFSBucket } = require('mongodb');
const { ObjectId } = require('mongodb');

const app = express();
const port = 3000;
const saltRounds = 10; // Cost factor for bcrypt

// MongoDB URI and Client Setup
const uri = "mongodb+srv://HIDIN-BANDS:DRFU@cluster0.fd1xbw3.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

let db;
let gfs;
let user_id;

async function connectToMongo() {
  try {
    await client.connect();
    db = client.db("system_database"); // Assuming 'system_database' is your DB name
    gfs = new GridFSBucket(db, {
      bucketName: 'pdfs'
    });
    console.log("Connected to MongoDB");
    startServer(); // Start the server after connecting to the database
  } catch (error) {
    console.error("Connection to MongoDB failed", error);
  }
}

function startServer() {
  app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
}

connectToMongo();

app.use(express.json());
app.use(express.static('public'));


// Storage Engine
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Routes
app.get('/', (req, res) => res.redirect('/signup'));

app.get('/signup', (req, res) => res.sendFile(path.join(__dirname, 'views', 'sign_up.html')));

app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'views', 'login.html')));

app.get('/applicant_page', (req, res) => res.sendFile(path.join(__dirname, 'views', 'applicant_page.html')));

app.get('/applicant_account_page', (req, res) => res.sendFile(path.join(__dirname, 'views', 'applicant_account_page.html')));

app.get('/employer_page', (req, res) => res.sendFile(path.join(__dirname, 'views', 'employer_page.html')));

app.get('/employer_account_page', (req, res) => res.sendFile(path.join(__dirname, 'views', 'employer_account_page.html')));

app.get('/applicant_negotiation_page', (req, res) => res.sendFile(path.join(__dirname, 'views', 'applicant_negotiation_page.html')));

app.get('/verification', (req, res) => res.sendFile(path.join(__dirname, 'views', 'verification.html')));

app.get('/api/job_listings', async (req, res) => {
  try {
    // Assuming 'user_id' is available in the scope and is the ID of the currently logged-in user
    const currentUser = user_id; // Ensure this is the correct way you're accessing the logged-in user's ID

    const pipeline = [
      {
        $lookup: {
          from: "applications", // Collection to join
          let: { job_id: "$_id", current_user: new ObjectId(currentUser) }, // Define variables for use in pipeline
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$job_id", "$$job_id"] },
                    { $eq: ["$applicant_id", "$$current_user"] }
                  ]
                }
              }
            }
          ],
          as: "applications" // Output array containing the results of the join
        }
      },
      {
        $match: {
          "applications": { $eq: [] } // Filter out job listings with non-empty 'applications' arrays
        }
      }
    ];

    const jobListings = await db.collection('job_listings').aggregate(pipeline).toArray();
    res.json(jobListings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


app.get('/api/employer_job_listings', async (req, res) => {
  // Assuming you have a way to get the current employer's ID, e.g., from session or JWT
  const employerId = user_id; // Example: Getting ID from session

  try {
    const jobListings = await db.collection('job_listings').find({ employer_id: user_id }).toArray();
    res.json(jobListings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/job_applicants', async (req, res) => {
  const jobId = req.query.jobId;
  if (!jobId) {
    return res.status(400).json({ message: "Job ID required" });
  }

  try {
    const jobApplicants = await db.collection('applications').find({ job_id: new ObjectId(jobId) }).toArray();
    res.json(jobApplicants);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error' });
  }
})

app.get('/api/job_listing', async (req, res) => {
  const jobId = req.query.jobId;
  if (!jobId) {
    return res.status(400).json({ message: "Job ID required" });
  }

  try {
    const jobApplicants = await db.collection('job_listings').find({ _id: new ObjectId(jobId) }).toArray();
    res.json(jobApplicants);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error' });
  }
})

app.get('/api/user', async (req, res) => {
  const userId = req.query.userId || user_id;
  if (!userId) {
    return res.status(400).json({ message: "Job ID required" });
  }

  try {
    const user = await db.collection('users').find({ _id: new ObjectId(userId) }).toArray();
    res.json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error' });
  }
})

app.get('/api/job_application', async (req, res) => {
  const applicationId = req.query.applicationId;
  if (!applicationId) {
    return res.status(400).json({ message: "Application ID required" });
  }

  try {
    const jobApplication = await db.collection('applications').find({ _id: new ObjectId(applicationId) }).toArray();
    res.json(jobApplication);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error' });
  }
})

app.get('/api/search_jobs', async (req, res) => {
  try {
    const searchTerm = req.query.term;
    const jobs = await db.collection('job_listings').find({
      $or: [
        { jobTitle: { $regex: searchTerm, $options: 'i' } },
        { jobLocation: { $regex: searchTerm, $options: 'i' } },
        { jobDescription: { $regex: searchTerm, $options: 'i' } }
      ]
    }).toArray();

    res.json(jobs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching search results' });
  }
});

app.get('/api/applicant_applications', async (req, res) => {
  const applicantId = user_id; // Example: Getting ID from session

  try {
    const applications = await db.collection('applications').find({ applicant_id: applicantId }).toArray();

    // Extracting job IDs from applications
    const jobIds = applications.map(application => application.job_id);
    //console.log(jobIds);

    // Fetch job listings based on job IDs
    const jobListings = await db.collection('job_listings').find({ _id: { $in: jobIds } }).toArray(); //$in is an operator that selects the documents where the value of the _id field matches any value in the jobIds array.

    // Extracting application IDs and adding them to job listings
    const jobListingsWithApplicationIds = jobListings.map(job => {
      const applicationId = applications.find(application => application.job_id.equals(job._id))._id;
      return { ...job, application_id: applicationId };
    });

    res.json(jobListingsWithApplicationIds);
    console.log(jobListingsWithApplicationIds)
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/download/:fileID', async (req, res) => {
  if (!req.params.fileID || req.params.fileID.trim() === '') {
    return res.status(400).json({
      success: false,
      message: "Invalid file ID"
    });
  }
  try {
    const file = await gfs.find({ _id: new ObjectId(req.params.fileID) }).toArray();
    if (!file[0] || file.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No file found"
      });
    }
    // If file is found, set the proper content type and stream it back
    res.setHeader('Content-Type', file[0].contentType);
    const readStream = gfs.openDownloadStream(file[0]._id);
    readStream.pipe(res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

app.post('/uploadResume', upload.single('file'), async (req, res) => {
  console.log('Upload endpoint hit');
  if (req.file) {
    console.log('File received:', req.file.originalname);
    const filename = req.file.originalname;  // Ensuring the file name is received correctly
    const stream = gfs.openUploadStream(filename, {
      contentType: req.file.mimetype // This sets the content type to whatever the file's type is, which should be 'application/pdf'
    });
    console.log("File is beginning to write")
    stream.write(req.file.buffer);  // Writing the file's buffer to GridFS
    stream.end();  // Ending the write operation

    stream.on('finish', async () => {
      // Respond with JSON containing the URL to the uploaded file

      console.log('File has been written successfully');
      const fileID = stream.id
      res.json({
        success: true,
        message: 'File uploaded successfully!',
        url: `/file/${fileID}`,
        fileID: fileID
      });

    });


    stream.on('error', (error) => {
      // Respond with JSON in case of an error
      console.error('Stream error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload file',
        error: error.message
      });
    });
  } else {
    console.log('No file uploaded');
    res.status(400).json({
      success: false,
      message: 'No file uploaded'
    });
  }
});



app.post('/get_job', async (req, res) => {
  console.log("job", req.body)
  try {
    const { job_id } = req.body;
    //console.log("Received:", job_id);
    //console.log(await db.collection('job_listings').findOne({_id: new ObjectId(job_id)}))
    const jobInfo = await db.collection('job_listings').findOne({ _id: new ObjectId(job_id) });
    if (!jobInfo) {
      return res.status(404).send('Job not found');
    }
    res.json(jobInfo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/get_applications', async (req, res) => {
  try {
    const { job_id } = req.body;
    console.log("Received:", job_id);
    console.log(await db.collection('applications').find({ job_id: new ObjectId(job_id) }).toArray())
    const jobApplicants = await db.collection('applications').find({ job_id: new ObjectId(job_id) }).toArray();
    console.log("applicant: " + jobApplicants)
    if (!jobApplicants) {
      return res.status(404).send('Job not found');
    }
    res.json(jobApplicants);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/get_name', async (req, res) => {
  try {
    const { applicant_id } = req.body;
    //console.log("Received:", job_id);
    //console.log(await db.collection('job_listings').findOne({_id: new ObjectId(job_id)}))
    const applicantInfo = await db.collection('users').findOne({ _id: new ObjectId(applicant_id) });
    if (!applicantInfo) {
      return res.status(404).send('Applicant not found');
    }
    res.json(applicantInfo);

  }
  catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
})

app.post('/savePublicKey', async (req, res) => {
  try {
    const { Public_key } = req.body

    if (!Public_key) {
      return res.status(300).json({ message: 'Missing required fields' })
    }
    await db.collection('users').updateOne({ _id: user_id }, { $set: { publicKey: Public_key } });

    res.json({ message: 'User info updated successfully' });
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }

})


app.post('/signup', async (req, res) => {
  //console.log("Reached")
  try {
    //console.log(req.body);
    const { first_name, last_name, email, password, accountType } = req.body;

    if (!email || !password || !first_name || !last_name || !accountType) {
      return res.status(300).json({ message: 'Missing required fields' });
    }

    const user = await db.collection('users').findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    await db.collection('users').insertOne({ first_name, last_name, email, password: hashedPassword, accountType, publicKey: "" });

    res.json({ message: 'User created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    // Attempt to find the user by email
    const user = await db.collection('users').findOne({ email });

    // If no user is found, return an error
    if (!user) {
      console.log("User not found");
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Use bcrypt to compare the provided password with the hashed password in the database
    const match = await bcrypt.compare(password, user.password);
    // If the password doesn't match, return an error
    if (!match) {

      console.log("Password does not match");
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // If the password matches, proceed with login
    console.log("Login successful");
    user_id = user._id;
    console.log(user_id)
    console.log(user.accountType)

    if (user.publicKey == "") {
      //Public Key is not set
      res.json({ message: 'Need Public Key', redirect: '/verification' })
    } else {
      // Use the 'user' field for account type as indicated in the user object structure
      if (user.accountType === 'applicant') {
        //console.log(user.accountType  === 'applicant')
        res.json({ message: 'Login successful', redirect: '/applicant_page' });
      } else if (user.accountType === 'employer') {
        //console.log(user.accountType  === 'applicant')
        res.json({ message: 'Login successful', redirect: '/employer_page' });
      } else {
        // Handle unexpected account type
        console.log("Unexpected account type");
        res.status(500).json({ message: 'Server error' });
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


app.post('/create_job', async (req, res) => {
  try {
    const { jobTitle, jobLocation, jobDescription } = req.body;
    console.log(req.body)
    if ((jobTitle || jobLocation || jobDescription) == '') {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    console.log(user_id, jobTitle, jobLocation, jobDescription)
    await db.collection('job_listings').insertOne({ employer_id: user_id, jobTitle, jobLocation, jobDescription });

    res.json({ message: 'Job created successfully' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/edit_account', async (req, res) => {
  try {
    const { new_first_name, new_last_name, new_email } = req.body;
    console.log(req.body)
    if (new_first_name != "") {
      await db.collection('users').updateOne({ _id: user_id }, { $set: { first_name: new_first_name } });
    }
    if (new_last_name != "") {
      await db.collection('users').updateOne({ _id: user_id }, { $set: { last_name: new_last_name } });
    }
    if (new_email != "") {
      await db.collection('users').updateOne({ _id: user_id }, { $set: { email: new_email } });
    }

    res.json({ message: 'User info updated successfully' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/create_applicant', async (req, res) => {
  try {

    const applicant_id = user_id;
    const { applicantResume_id, employer_id, job_id } = req.body;
    console.log(applicant_id, employer_id, job_id)
    if ((!applicantResume_id || !job_id || !employer_id)) {
      return res.status(400).json({ message: 'Missing required fields' })
    }
    //UPDATE TO INCLUDE NEW MSG'S
    await db.collection('applications').insertOne({ applicantResume: new ObjectId(applicantResume_id), job_id: new ObjectId(job_id), employer_id: new ObjectId(employer_id), applicant_id: new ObjectId(applicant_id), msg_1: "", msg_2: "", msg_3: "", x: "", count: "0" })

    res.json({ message: 'Application created successfully' })

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' })
  }
})

app.post('/msg1', async (req, res) => {
  try {
    const { _id, msg_1, count } = req.body;
    const result = await db.collection('applications').updateMany(
      { _id: new ObjectId(_id) },
      { $set: { msg_1: msg_1, count: count } } // Set the new value of msg_1 and increment count
    );

    if (result.matchedCount === 0) {
      return res.status(404).send('Document not found');
    }
    res.json({ message: 'msg_1 updated successfully' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/msg2', async (req, res) => {
  try {
    const { _id, msg_2 } = req.body;

    // If needed, convert back to BigInt array
    // const msg_2AsBigIntArray = msg_2.map(str => BigInt(str));

    const result = await db.collection('applications').updateOne(
      { _id: new ObjectId(_id) },
      { $set: { msg_2: msg_2 } } // Assuming msg_2 is saved as an array of strings
    );

    if (result.matchedCount === 0) {
      return res.status(404).send('Document not found');
    }
    res.json({ message: 'msg_2 updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/msg3', async (req, res) => {
  try {
    const { _id, msg_3 } = req.body;
    const result = await db.collection('applications').updateOne(
      { _id: new ObjectId(_id) },
      { $set: { msg_3: msg_3 } } // Set the new value of msg_3
    );

    if (result.matchedCount === 0) {
      return res.status(404).send('Document not found');
    }
    res.json({ message: 'msg_3 updated successfully' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/rand_int_x', async (req, res) => {
  try {
    const { _id, x } = req.body;
    const result = await db.collection('applications').updateOne(
      { _id: new ObjectId(_id) },
      { $set: { x: x } } // Set the new value of x
    );

    if (result.matchedCount === 0) {
      return res.status(404).send('Document not found');
    }
    res.json({ message: 'rand_int_x updated successfully' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


app.post('/get_msg1', async (req, res) => {
  try {
    const { _id } = req.body; // Ensure this matches the JSON payload you're sending
    const projection = { msg_1: 1 };
    const document = await db.collection('applications').findOne({ _id: new ObjectId(_id) }, { projection });

    if (!document) {
      return res.status(404).send('Document not found');
    }
    res.json({ msg_1: document.msg_1 });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/get_msg2', async (req, res) => {
  try {
    const { _id } = req.body; // Ensure this matches the JSON payload you're sending
    const projection = { msg_2: 1 };
    const document = await db.collection('applications').findOne({ _id: new ObjectId(_id) }, { projection });

    if (!document) {
      return res.status(404).send('Document not found');
    }
    res.json({ msg_2: document.msg_2 });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/get_msg3', async (req, res) => {
  try {
    const { _id } = req.body; // Ensure this matches the JSON payload you're sending
    const projection = { msg_3: 1 };
    const document = await db.collection('applications').findOne({ _id: new ObjectId(_id) }, { projection });

    if (!document) {
      return res.status(404).send('Document not found');
    }
    res.json({ msg_3: document.msg_3 });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/get_rand_int_x', async (req, res) => {
  try {
    const { _id } = req.body; // Ensure this matches the JSON payload you're sending
    const projection = { x: 1 };
    const document = await db.collection('applications').findOne({ _id: new ObjectId(_id) }, { projection });

    if (!document) {
      return res.status(404).send('Document not found');
    }
    res.json({ x: document.x });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/start_new_round', async (req, res) => {
  try {
    const { _id, msg_1, msg_2, msg_3, x } = req.body;
    const result = await db.collection('applications').updateMany(
      { _id: new ObjectId(_id) },
      { $set: { msg_1: msg_1, msg_2: msg_2, msg_3: msg_3, x: x } } // Set the new value of msg_1 and increment count
    );

    if (result.matchedCount === 0) {
      return res.status(404).send('Document not found');
    }
    res.json({ message: 'msg_1, msg_2, msg_3, and x updated successfully' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/delete_job/:jobId', async (req, res) => {
  const jobId = req.params.jobId;

  try {
    // delete job from database
    await db.collection('job_listings').deleteOne({ _id: new ObjectId(jobId) });
    res.status(200).json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ message: 'Server error' });
  }
})

app.delete('/api/delete_application/:applicationId', async (req, res) => {
  const applicationId = req.params.applicationId;

  try {
    // delete job application from database
    await db.collection('applications').deleteOne({ _id: new ObjectId(applicationId) });
    res.status(200).json({ message: 'Application deleted successfully' });
  } catch (error) {
    console.error('Error deleting application:', error);
    res.status(500).json({ message: 'Server error' });
  }
})

app.get('/api/public_key/:app_id', async (req, res) => {
  try {
    const app_id = req.params.app_id;
    // First, find the job to get the applicantId
    const application = await db.collection('applications').findOne({ _id: new ObjectId(app_id) });
    if (!application || !application.applicant_id) {
      return res.status(404).json({ message: 'application not found or applicant ID missing' });
    }

    // Then, use the applicantId to find the user and get the public key
    const user = await db.collection('users').findOne({ _id: new ObjectId(application.applicant_id) });
    if (!user || !user.publicKey) {
      return res.status(404).json({ message: 'User not found or public key not available' });
    }
    //console.log("Public key found: ", user.publicKey);
    const publicKey = new NodeRSA(user.publicKey);
    //console.log("Public key NodeRSA: ", publicKey);
    const publicKeyComponents = publicKey.exportKey('components-public');

    // Check if components are Buffers or BigInts and convert appropriately
    const e = (publicKeyComponents.e instanceof Buffer) ? publicKeyComponents.e.toString('hex') : publicKeyComponents.e.toString(16);
    const n = (publicKeyComponents.n instanceof Buffer) ? publicKeyComponents.n.toString('hex') : publicKeyComponents.n.toString(16);

    res.json({ e: `0x${e}`, n: `0x${n}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


app.post('/api/private_key', (req, res) => {
  try {
    const { privateKeyText } = req.body; // Receive the private key as text from the client side
    if (!privateKeyText) {
      return res.status(400).json({ message: 'Private key text is required' });
    }
    //console.log("Public key found: ", privateKeyText);
    const privateKey = new NodeRSA(privateKeyText); // Initialize the NodeRSA object with the provided key text
    //console.log("Public key NodeRSA: ", privateKey);
    const privateKeyComponents = privateKey.exportKey('components'); // Export components from the key

    // Convert BigInt or Buffer components to Hexadecimal strings
    const d = (privateKeyComponents.d instanceof Buffer) ? privateKeyComponents.d.toString('hex') : privateKeyComponents.d.toString(16);
    const n = (privateKeyComponents.n instanceof Buffer) ? privateKeyComponents.n.toString('hex') : privateKeyComponents.n.toString(16);

    res.json({ d: `0x${d}`, n: `0x${n}` });
  } catch (error) {
    console.error('Failed to process the private key:', error);
    res.status(500).json({ message: 'Server error processing private key' });
  }
});
