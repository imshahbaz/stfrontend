# Axios Centralization Task

## Overview
Centralize all axios requests by updating components to use the API methods defined in axios.js instead of making direct api calls.

## Components to Update
- [ ] Strategies.js: Replace direct api calls with strategyAPI methods
- [ ] Signup.js: Replace direct api calls with userAPI methods
- [ ] Settings.js: Replace direct api calls with authAPI methods
- [ ] Login.js: Replace direct api calls with authAPI methods
- [ ] Calculator.js: Replace direct api calls with marginAPI methods
- [ ] AdminDashboard.js: Replace direct api calls with marginAPI methods

## API Methods Available in axios.js
- authAPI: login, logout, getMe, updateUsername
- userAPI: signup, verifyOtp
- strategyAPI: getStrategies, fetchWithMargin
- marginAPI: getAllMargins, loadFromCsv
