const prompt = require('prompt-sync')({ sigint: true });
const NodeRSA = require('node-rsa'); // verify if it works on client side | add a servlet - web code it.
const fs = require('fs');
/** This file is to be run at CLIENT SIDE */

// GLOBAL VARIABLES
N = 2048; //security parameter
MAX = 50; //MAX range of salary level, e.g., [1,50]

// -------------------------------------------------------------------------------------
// -- THIS SECTION OF THE CODE IS TO BE IMPROVED WHEN LINKING TO THE MONGODB DATABASE --
// -------------------------------------------------------------------------------------

// NEED TO TALK SERVER and retrive the public key of the given applicant ID
function get_pub_key(id) {
    // Load the public key
    const publicKeyData = fs.readFileSync('./publickey.pem', 'utf8');
    const publicKey = new NodeRSA(publicKeyData);

    // Extract n and e
    const publicKeyComponents = publicKey.exportKey('components-public');
    const n = BigInt(`0x${publicKeyComponents.n.toString('hex')}`);
    const e = BigInt(publicKeyComponents.e);

    //console.log(`Public Key - n: ${n}, e: ${e}`)

    return [e, n];
}

// NEED TO TALK SERVER and retrive the private key of the given applicant ID
function get_private_key(id) {
    // Load the private key
    const privateKeyData = fs.readFileSync('./privatekey.pem', 'utf8');
    const privateKey = new NodeRSA(privateKeyData);

    // Extract d, n, and e
    const privateKeyComponents = privateKey.exportKey('components');
    const n = BigInt(`0x${privateKeyComponents.n.toString('hex')}`);
    const e = BigInt(privateKeyComponents.e);
    const d = BigInt(`0x${privateKeyComponents.d.toString('hex')}`);

    //console.log(`Private Key - n: ${n}, e: ${e}, d: ${d}`)

    return [d, n];
}

// -------------------------------------------------------------------------------------
// -- THIS SECTION OF THE CODE IS TO BE IMPROVED WHEN LINKING TO THE MONGODB DATABASE --
// -------------------------------------------------------------------------------------

// -------------------------------------------------------------------------------------

// return a^b % c
function modPow(base, exponent, modulus) {
    if (modulus === BigInt(1)) return BigInt(0);
    let result = BigInt(1);
    base = base % modulus;
    while (exponent > 0) {
        if (exponent % BigInt(2) === BigInt(1))
            result = (result * base) % modulus;
        exponent = exponent >> BigInt(1);
        base = (base * base) % modulus;
    }
    return result;
}

// encrypt message m using (e,n)
function rsa_encrypt(m, e, n) {
    //cipher =  m^e % n
    biM = BigInt(m);
    biEx = BigInt(e);
    biMod = BigInt(n);
    biRet = modPow(biM, biEx, biMod)
    return biRet;
}

// decrypt cipher text c using (d,n)
function rsa_decrypt(c, d, n) {
    biM = BigInt(c);
    biEx = BigInt(d);
    biMod = BigInt(n);
    biRet = modPow(biM, biEx, biMod)
    return biRet;
}

function rand_int(N_LIMIT) {
    if (N_LIMIT <= 0) {
        throw new Error("N_LIMIT must be positive and greater than zero.");
    }

    // Calculate the number of bytes needed
    let num_bytes = Math.ceil(N_LIMIT / 8);

    // Generate a random number based on the bit width
    let randomValue = BigInt(0);
    for (let i = 0; i < num_bytes; i++) {
        randomValue = (randomValue << BigInt(8)) | BigInt(Math.floor(Math.random() * 256));
    }

    // Ensure the number fits exactly within N_LIMIT bits by applying a bitmask
    let bitmask = (BigInt(1) << BigInt(N_LIMIT)) - BigInt(1);
    return randomValue & bitmask;
}

// -------------------------------------------------------------------------------------

// -------------------------------------------------------------------------------------
// -- THIS SECTION OF THE CODE IS TO BE IMPROVED WHEN LINKING TO THE MONGODB DATABASE --
// -------------------------------------------------------------------------------------

// Function to save a message using the API
async function save_msg1(_id, msg_1) {
    msg_1 = msg_1.toString();
    try {
        const response = await fetch('http://localhost:3000/msg1', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ _id, msg_1 })
        });

        if (!response.ok) {
            const errorDetails = await response.text(); // Using .text() in case the response is not JSON
            throw new Error(`Request failed with status ${response.status}: ${errorDetails}`);
        }

        const data = await response.json();
        console.log('Response:', data);
    } catch (error) {
        console.error('Error updating msg_1:', error);
    }
}

//IMPROVE LATER
async function read_msg1(app_id) {
    try {
        const response = await fetch('http://localhost:3000/get_msg1', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ _id: app_id }) // Make sure to send the _id as a string
        });

        if (!response.ok) {
            const errorDetails = await response.text(); // Using .text() in case the response is not JSON
            throw new Error(`Request failed with status ${response.status}: ${errorDetails}`);
        }

        const data = await response.json();
        return data.msg_1;
    } catch (error) {
        console.error('Error reading msg_1:', error);
        return null; // or handle error as appropriate
    }
}

//IMPROVE LATER
async function save_msg2(_id, msg_2) {
    // Convert each BigInt to a string
    const msg_2AsStringArray = msg_2.map(bi => bi.toString());

    try {
        const response = await fetch('http://localhost:3000/msg2', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ _id, msg_2: msg_2AsStringArray })
        });

        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Response:', data);
    } catch (error) {
        console.error('Error updating msg_2:', error);
    }
}

//IMPROVE LATER
async function read_msg2(app_id) {
    try {
        const response = await fetch('http://localhost:3000/get_msg2', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ _id: app_id }) // Make sure to send the _id as a string
        });

        if (!response.ok) {
            const errorDetails = await response.text(); // Using .text() in case the response is not JSON
            throw new Error(`Request failed with status ${response.status}: ${errorDetails}`);
        }

        const data = await response.json();
        return data.msg_2;
    } catch (error) {
        console.error('Error reading msg_2:', error);
        return null; // or handle error as appropriate
    }
}

//IMPROVE LATER
async function save_msg3(_id, msg_3) {
    msg_3 = msg_3.toString();
    try {
        const response = await fetch('http://localhost:3000/msg3', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ _id, msg_3 })
        });

        if (!response.ok) {
            const errorDetails = await response.text(); // Using .text() in case the response is not JSON
            throw new Error(`Request failed with status ${response.status}: ${errorDetails}`);
        }

        const data = await response.json();
        console.log('Response:', data);
    } catch (error) {
        console.error('Error updating msg_3:', error);
    }
}

async function read_msg3(app_id) {
    try {
        const response = await fetch('http://localhost:3000/get_msg3', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ _id: app_id }) // Make sure to send the _id as a string
        });

        if (!response.ok) {
            const errorDetails = await response.text(); // Using .text() in case the response is not JSON
            throw new Error(`Request failed with status ${response.status}: ${errorDetails}`);
        }

        const data = await response.json();
        return data.msg_3;
    } catch (error) {
        console.error('Error reading msg_3:', error);
        return null; // or handle error as appropriate
    }
}

//IMPROVE LATER
async function save_x(_id, x) {
    x = x.toString();
    try {
        const response = await fetch('http://localhost:3000/rand_int_x', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ _id, x })
        });

        if (!response.ok) {
            const errorDetails = await response.text(); // Using .text() in case the response is not JSON
            throw new Error(`Request failed with status ${response.status}: ${errorDetails}`);
        }

        const data = await response.json();
        console.log('Response:', data);
    } catch (error) {
        console.error('Error updating x:', error);
    }
}

async function read_x(app_id) {
    try {
        const response = await fetch('http://localhost:3000/get_rand_int_x', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ _id: app_id }) // Make sure to send the _id as a string
        });

        if (!response.ok) {
            const errorDetails = await response.text(); // Using .text() in case the response is not JSON
            throw new Error(`Request failed with status ${response.status}: ${errorDetails}`);
        }

        const data = await response.json();
        console.log('x:', data.x);
        return data.x;
    } catch (error) {
        console.error('Error reading x:', error);
        return null; // or handle error as appropriate
    }
}

// -------------------------------------------------------------------------------------
// -- THIS SECTION OF THE CODE IS TO BE IMPROVED WHEN LINKING TO THE MONGODB DATABASE --
// -------------------------------------------------------------------------------------

// -------------------------------------------------------------------------------------

// -------------------------------------------------------------------------------------
// -- THIS SECTION OF THE CODE IS TO BE IMPROVED WHEN LINKING TO THE MONGODB DATABASE --
// -------------------------------------------------------------------------------------

// bob case: bob has a secret in mind: J //Alice_id is the applicants public key (in db)
async function msg1(app_id, alice_id, J) {
    J_BigInt = BigInt(J);
    console.log("DEBUG msg1: N: " + N + ", MAX: " + MAX + ", J salary offer: " + J);
    var x = rand_int(N);
    const x_str = x.toString();
    await save_x(app_id, x_str);
    [e, n] = get_pub_key(alice_id);
    var C = rsa_encrypt(x, e, n);
    var m = (C - J_BigInt + BigInt(1)) % n;
    //console.log("DEBUG msg1: x: " + x + ", C: " + C + "m: " + m);
    const m_str = m.toString();
    await save_msg1(app_id, m_str);
}

// I is the secret MIN SALARY number in mind of alice
async function msg2(app_id, alice_id, I) {
    const m = await read_msg1(app_id);
    BigInt(m);
    console.log("m: " + typeof m)
    console.log("DEBUG msg2: expected salary: " + I + ", m: " + m);

    const [d, n] = get_private_key(alice_id);
    //console.log("DEBUG MSG2 step2: d: " + d + ", n: " + n);

    const p = BigInt(rand_int(N / 2));
    let m_adjusted = BigInt(m) - BigInt(1);
    const W = [p];
    const Y = [];

    for (let i = 1; i <= MAX; i++) {
        // Incremental update for m_adjusted to avoid recalculating each time
        m_adjusted += BigInt(1);

        const yi = rsa_decrypt(m_adjusted, d, n);
        Y.push(yi); // If Y array is not used later, consider removing this line to save memory

        // Simplify the conditional logic to update W directly based on comparison
        const wi = (BigInt(i) > I) ? (yi + BigInt(1)) : yi;
        W.push(wi.toString());
    }
    //console.log("DEBUG msg2 generated: " + W);
    await save_msg2(app_id, W);
}

// J number: salary offer
// TRUE means: expected salary > salary_offer (DON'T COME!)
async function msg3(app_id, J) {
    const x = await read_x(app_id);
    var WstringArray = await read_msg2(app_id);
    const w = WstringArray.map(str => BigInt(str));
    p = w[0];
    var res = (w[J]) == (x);
    //console.log("DEBUG msg3: x: " + x, "msg2: " + w + "p: " + p + "\nw[J]:" + w[J] + ", x:" + x + ", res:" + res + ", J: " + J);
    console.log("RESULT: ", res);
    await save_msg3(app_id, res);
}

// -------------------------------------------------------------------------------------
// -- THIS SECTION OF THE CODE IS TO BE IMPROVED WHEN LINKING TO THE MONGODB DATABASE --
// -------------------------------------------------------------------------------------

// -------------------------------------------------------------------------------------

// USE THIS CODE TO CHECK IF THE d, n, and e ARE WORKING
// return [e, n, d]
// where (e, n) is the public key and
// d is the secret key
/*
function rsa_key_gen() {
    // IMPROVE LATER
    d = 11414734057222616310729717182445058144797405741596462291585003629407254069415219712798342663001027181662933835926497456873725810838463657123915419471604122718016709320673750872966698955939251806330471452249622647774522454263893749488872987236627369036502238111721541035995737861175015639343159102542775179070942151042188368789909558693852455729366917048261195208630100027816675518782783192786812421403623325618092375699821335847809351840661213756760212058830158310831224232035809081257595355564548873359940786064884091856835983638834928214109980281889386321563808272960105611032180985737283918598220846448890744509673n;
    e = 65537;
    n = 24685280511737291046239679095393558014703434419633966315908476583417363799612778561876422475007369028366398112691465561165925374193050410721994550269279636712445506640785204123465386882540529471423201041613051294083447552717135939952227981010620289871151532061636516577332211589104999173589593073860612338253814918038326018987923817051450620679844031666159045478210265960767748586032928107994938432399275270159588952336511393271002740582256821979909839599354337341249286973714959068362927350269167247160112683931928070277829761928725662228898513424439961647024336038718510968116146600227538100862436437186972277694863n; //from wiki page: https://en.wikipedia.org/wiki/RSA_(cryptosystem)
    return [BigInt(e), BigInt(n), BigInt(d)];
}
*/

// unit testing rsa
function unit_test_rsa() {
    m = 65;
    [e, n, d] = rsa_key_gen();
    c = rsa_encrypt(m, e, n);
    m2 = rsa_decrypt(c, d, n);
    if (m != m2) {
        console.log("ERROR: rsa fails: m: " + m + ", m2: " + m2);
    } else {
        console.log("OK: rsa pass: m: " + m + ", m2: " + m2);
    }
}

async function unit_test_yao() {
    const application_id = "65df8d0d8566547c01620494";
    const applicant_id = "6608a649e1fccdd86e4359ec";

    // Use prompt to ask for the salary offer
    const salary_offer_str = prompt("Please enter the salary for the job listing - EMPLOYER: ", "");
    const salary_offer = parseInt(salary_offer_str, 10); // Convert the input string to an integer
    const salary_offer_modified = salary_offer / 10000;

    // You could also use prompt for expected salary
    const expected_salary_str = prompt("Please enter the expected salary - APPLICANT: ", "");
    const expected_salary = parseInt(expected_salary_str, 10); // Convert to integer
    const expected_salary_modified = expected_salary / 10000;

    // Ensure inputs are valid numbers
    if ((isNaN(salary_offer) || isNaN(expected_salary)) && (isNaN(salary_offer_modified) || isNaN(expected_salary_modified))) {
        console.error("Invalid input for salary offer or expected salary.");
        return;
    }

    await msg1(application_id, applicant_id, salary_offer_modified);
    await msg2(application_id, applicant_id, expected_salary_modified);
    await msg3(application_id, salary_offer_modified);
}

function unit_test() {
    //unit_test_rsa();
    unit_test_yao();
}
// ---------------------------
// ---- unit testing code ----
// ---------------------------
unit_test();