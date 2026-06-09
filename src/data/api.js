// src/data/api.js
const IP_ADDRESS = "10.1.12.29"; // SESUAI IP WI-FI LAPTOP LO
//const IP_ADDRESS = "172.20.10.2";
//const IP_ADDRESS = "192.168.100.251";//
const PORT = "5234";

export const BASE_URL = `http://${IP_ADDRESS}:${PORT}/api`;

export const API_ENDPOINTS = {
    login: `${BASE_URL}/failure-auth/login`,
    getProfile: (nim) => `${BASE_URL}/User/GetProfile/${nim}`,
    
    // Pastikan TIDAK ada slash di akhir FailureCode
    failureCode: `${BASE_URL}/FailureCode`, 
    
    getHistory: (nim) => `${BASE_URL}/FailureDiagnosis/history/${nim}`,
    saveHistory: `${BASE_URL}/FailureDiagnosis/history/save`,
    deleteHistory: (sessionId) => `${BASE_URL}/FailureDiagnosis/history/${sessionId}`,
};

export default BASE_URL;