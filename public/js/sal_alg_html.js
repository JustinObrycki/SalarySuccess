// GLOBAL VARIABLES
const N = 2048; //security parameter
const MAX = 50; //MAX range of salary level, e.g., [1,50]

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

function rsa_encrypt(m, e, n) {
    var biM = BigInt(m);
    var biEx = BigInt(e);
    var biMod = BigInt(n);
    var biRet = modPow(biM, biEx, biMod)
    return biRet;
}

function rsa_decrypt(c, d, n) {
    var biM = BigInt(c);
    var biEx = BigInt(d);
    var biMod = BigInt(n);
    var biRet = modPow(biM, biEx, biMod)
    return biRet;
}

function gcd(a, b) {
    while (b != 0n) {
        let t = b;
        b = a % b;
        a = t;
    }
    return a;
}

function rand_int() {
    const min = 1n;
    const max = 2n ** 64n - 1n;
    let randBigInt;
    do {
        randBigInt = min + BigInt(Math.floor(Math.random() * Number(max - min))) + 1n;
    } while (gcd(randBigInt, 65537n) !== 1n);
    return randBigInt;
}

async function get_pub_key(app_id) {
    try {
        const response = await fetch(`http://localhost:3000/api/public_key/${app_id}`);
        if (!response.ok) {
            throw new Error(`error! status: ${response.status}`);
        }
        const data = await response.json();
        return [BigInt(data.e), BigInt(data.n)];
    } catch (error) {
        console.error("Failed to fetch public key using job ID:", error);
        throw error;
    }
}

async function get_private_key(privateKeyText) {
    try {
        const response = await fetch('http://localhost:3000/api/private_key', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ privateKeyText })
        });
        if (!response.ok) {
            throw new Error(`error! status: ${response.status}`);
        }
        const keyData = await response.json();
        return [BigInt(keyData.d), BigInt(keyData.n)];
    } catch (error) {
        console.error('Failed to fetch private key:', error);
        throw error;
    }
}

async function save_msg1(_id, msg_1, count) {
    msg_1 = msg_1.toString();
    try {
        const response = await fetch('http://localhost:3000/msg1', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ _id, msg_1, count })
        });
        if (!response.ok) {
            const errorDetails = await response.text();
            throw new Error(`Request failed with status ${response.status}: ${errorDetails}`);
        }
        const data = await response.json();
        console.log('Response:', data);
    } catch (error) {
        console.error('Error updating msg_1:', error);
    }
}

async function read_msg1(app_id) {
    try {
        const response = await fetch('http://localhost:3000/get_msg1', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ _id: app_id })
        });
        if (!response.ok) {
            const errorDetails = await response.text();
            throw new Error(`Request failed with status ${response.status}: ${errorDetails}`);
        }
        const data = await response.json();
        return data.msg_1;
    } catch (error) {
        console.error('Error reading msg_1:', error);
        return null;
    }
}

async function save_msg2(_id, msg_2) {
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

async function read_msg2(app_id) {
    try {
        const response = await fetch('http://localhost:3000/get_msg2', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ _id: app_id })
        });

        if (!response.ok) {
            const errorDetails = await response.text();
            throw new Error(`Request failed with status ${response.status}: ${errorDetails}`);
        }
        const data = await response.json();
        return data.msg_2;
    } catch (error) {
        console.error('Error reading msg_2:', error);
        return null;
    }
}

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
            const errorDetails = await response.text();
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
            body: JSON.stringify({ _id: app_id })
        });
        if (!response.ok) {
            const errorDetails = await response.text();
            throw new Error(`Request failed with status ${response.status}: ${errorDetails}`);
        }
        const data = await response.json();
        return data.msg_3;
    } catch (error) {
        console.error('Error reading msg_3:', error);
        return null;
    }
}

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
            const errorDetails = await response.text();
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
            body: JSON.stringify({ _id: app_id })
        });
        if (!response.ok) {
            const errorDetails = await response.text();
            throw new Error(`Request failed with status ${response.status}: ${errorDetails}`);
        }
        const data = await response.json();
        console.log('x:', data.x);
        return data.x;
    } catch (error) {
        console.error('Error reading x:', error);
        return null;
    }
}

export async function msg1(app_id, J, count) {
    const J_BigInt = BigInt(J);
    var x = rand_int();
    const x_str = x.toString();
    await save_x(app_id, x_str);
    const [e, n] = await get_pub_key(app_id);
    const C = rsa_encrypt(x, e, n);
    const m = (C - J_BigInt + BigInt(1)) % n;
    const m_str = m.toString();
    await save_msg1(app_id, m_str, count);
}

export async function msg2(app_id, I, privateKeyText) {
    const m = await read_msg1(app_id);
    const m_BigInt = BigInt(m);
    console.log("msg1 is: ", m_BigInt);
    const [d, n] = await get_private_key(privateKeyText);
    const p = BigInt(rand_int());
    const W = [p];
    const Y = [];
    for (let i = 1; i <= MAX; i++) {
        const yi = rsa_decrypt((m_BigInt + (BigInt(i) - BigInt(1))), d, n);
        Y.push(yi);
        const wi = (BigInt(i) > BigInt(I)) ? (BigInt(yi) + BigInt(1)) : BigInt(yi);
        W.push(wi.toString());
    }
    await save_msg2(app_id, W);
}

export async function msg3(app_id, J) {
    var x = await read_x(app_id);
    const x_BigInt = BigInt(x);
    var WstringArray = await read_msg2(app_id);
    const w = WstringArray.map(str => BigInt(str));
    var res = (w[J] == x_BigInt);
    await save_msg3(app_id, res);
}