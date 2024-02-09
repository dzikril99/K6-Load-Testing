import http from 'k6/http';
import { check, group } from 'k6';
// This will export to HTML as filename "result.html" AND also stdout using the text summary
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";

export function handleSummary(data) {
  return {
    "Integration.html": htmlReport(data),
    stdout: textSummary(data, { indent: " ", enableColors: true }),
  };
}

export const options = {
    vus: 10,
    iterations: 50,
    duration: '10s',
};

export default function () {
    const baseUrl = 'https://reqres.in/api/users';

    // Skenario: Create User dan Update User
    group('Integration Test', () => {
        // Langkah 1: Create User
        const createPayload = JSON.stringify({
            name: 'morpheus',
            job: 'leader',
        });

        const createParams = {
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const createResponse = http.post(baseUrl, createPayload, createParams);

        check(createResponse, {
            'is status 201': (r) => r.status === 201,
        });

        // Langkah 2: Update User (gunakan data yang baru dibuat)
        const userId = createResponse.json().id;

        const updatePayload = JSON.stringify({
            name: 'morpheus',
            job: 'zenit resident',
        });

        const updateParams = {
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const updateResponse = http.put(`${baseUrl}/${userId}`, updatePayload, updateParams);

        check(updateResponse, {
            'is status 200': (r) => r.status === 200,
        });
    });
}
