import http from 'k6/http';
import { sleep } from 'k6';
import { check, group } from 'k6';
// This will export to HTML as filename "result.html" AND also stdout using the text summary
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";

export function handleSummary(data) {
  return {
    "result.html": htmlReport(data),
    stdout: textSummary(data, { indent: " ", enableColors: true }),
  };
}

export const options = {
    vus: 1000,          // Jumlah virtual users
    iterations: 3500,   // Jumlah iterasi per virtual user
   // duration: '120s',   // Durasi total uji
    thresholds: {
        http_req_duration: ['p(95)<2000'], // Ambang batas untuk durasi respons kurang dari 2000 ms (2 detik).
    },
};

export default function () {
    const baseUrl = 'https://reqres.in/api/users';

    // Skenario: Create User
    group('Create User API', () => {
        const createPayload = JSON.stringify({
            name: 'morpheus',
            job: 'leader',
        });

        const createParams = {
            headers: {
                'Content-Type': 'application/json',
            },
        };

        // Eksekusi request Create User
        const createResponse = http.post(baseUrl, createPayload, createParams);

        // Assertion: Memastikan status response 201 Created
        check(createResponse, {
            'is status 201': (r) => r.status === 201,
        });

        // Assertion: Memastikan response body berisi nama yang diharapkan
        check(createResponse, {
            'is res body has name': (r) => r.json().name === 'morpheus',
        });
    });

    // Jeda antara skenario Create User dan Update User
    sleep(1);

    // Skenario: Update User
    group('Update User API', () => {
        const userId = 2;
        const updatePayload = JSON.stringify({
            name: 'morpheus',
            job: 'zion resident',
        });

        const updateParams = {
            headers: {
                'Content-Type': 'application/json',
            },
        };

        // Eksekusi request Update User
        const updateResponse = http.put(`${baseUrl}/${userId}`, updatePayload, updateParams);

        // Assertion: Memastikan status response 200 OK
        check(updateResponse, {
            'is status 200': (r) => r.status === 200,
        });

        // Assertion: Memastikan response body berisi nama yang diharapkan setelah pembaruan
        check(updateResponse, {
            'is res body has updated job': (r) => r.json().job === 'zion resident',
        });
    });
}
