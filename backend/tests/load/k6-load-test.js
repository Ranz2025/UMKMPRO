import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
    stages: [
        { duration: '1m', target: 20 },   // ramp up ke 20 user
        { duration: '3m', target: 50 },   // hold 50 user
        { duration: '1m', target: 100 },  // peak load 100 user
        { duration: '1m', target: 0 },    // ramp down
    ],
    thresholds: {
        http_req_duration: ['p(95)<200'],  // 95% request < 200ms
        errors: ['rate<0.01'],             // error rate < 1%
    },
};

export default function () {
    const url = `${__ENV.BASE_URL || 'http://localhost:8000'}/api/v1/reports/dashboard?period=today`;
    const params = {
        headers: {
            'Authorization': `Bearer ${__ENV.TOKEN || 'test-token'}`,
            'X-Business-Id': `${__ENV.BUSINESS_ID || 1}`,
            'Accept': 'application/json',
        },
    };

    const res = http.get(url, params);

    check(res, {
        'status is 200': (r) => r.status === 200,
        'response time < 200ms': (r) => r.timings.duration < 200,
    });

    errorRate.add(res.status !== 200);
    sleep(1);
}
