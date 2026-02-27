@echo off
REM Bitespeed Identity API Test Script for Windows

echo 🚀 Bitespeed Identity API Test Suite
echo ====================================
echo.

set BASE_URL=%1
if "%BASE_URL%"=="" set BASE_URL=http://localhost:3000

echo Testing against: %BASE_URL%
echo.

REM Test 1: Health Check
echo 📋 Test 1: Health Check
curl -s -X GET "%BASE_URL%/health"
echo.
echo.

REM Test 2: New Customer
echo 📋 Test 2: New Customer ^(Email + Phone^)
powershell -Command "Invoke-RestMethod -Uri '%BASE_URL%/identify' -Method POST -ContentType 'application/json' -Body '{\"email\":\"lorraine@hillvalley.edu\",\"phoneNumber\":\"123456\"}' | ConvertTo-Json"
echo.
echo.

REM Test 3: Same Phone, Different Email
echo 📋 Test 3: Existing Phone, New Email
powershell -Command "Invoke-RestMethod -Uri '%BASE_URL%/identify' -Method POST -ContentType 'application/json' -Body '{\"email\":\"mcfly@hillvalley.edu\",\"phoneNumber\":\"123456\"}' | ConvertTo-Json"
echo.
echo.

REM Test 4: Only Email
echo 📋 Test 4: Query with Email Only
powershell -Command "Invoke-RestMethod -Uri '%BASE_URL%/identify' -Method POST -ContentType 'application/json' -Body '{\"email\":\"lorraine@hillvalley.edu\",\"phoneNumber\":null}' | ConvertTo-Json"
echo.
echo.

REM Test 5: Only Phone
echo 📋 Test 5: Query with Phone Only
powershell -Command "Invoke-RestMethod -Uri '%BASE_URL%/identify' -Method POST -ContentType 'application/json' -Body '{\"email\":null,\"phoneNumber\":\"123456\"}' | ConvertTo-Json"
echo.
echo.

REM Test 6: Invalid Request
echo 📋 Test 6: Invalid Request ^(Missing both fields^)
powershell -Command "Invoke-RestMethod -Uri '%BASE_URL%/identify' -Method POST -ContentType 'application/json' -Body '{}' | ConvertTo-Json"
echo.
echo.

echo ✅ Test suite completed!
echo.
echo Usage: test-api.bat [BASE_URL]
echo Example: test-api.bat http://localhost:3000
