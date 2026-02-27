#!/bin/bash

# Bitespeed Identity API Test Script
# This script demonstrates how to test the API with curl

echo "🚀 Bitespeed Identity API Test Suite"
echo "===================================="
echo ""

BASE_URL="${1:-http://localhost:3000}"

echo "Testing against: $BASE_URL"
echo ""

# Test 1: Health Check
echo "📋 Test 1: Health Check"
curl -s -X GET "$BASE_URL/health" | jq . 2>/dev/null || curl -s -X GET "$BASE_URL/health"
echo ""
echo ""

# Test 2: New Customer
echo "📋 Test 2: New Customer (Email + Phone)"
curl -s -X POST "$BASE_URL/identify" \
  -H "Content-Type: application/json" \ 
  -d '{"email":"lorraine@hillvalley.edu","phoneNumber":"123456"}' | jq . 2>/dev/null || \
  curl -s -X POST "$BASE_URL/identify" \
    -H "Content-Type: application/json" \
    -d '{"email":"lorraine@hillvalley.edu","phoneNumber":"123456"}'
echo ""
echo ""

# Test 3: Same Phone, Different Email
echo "📋 Test 3: Existing Phone, New Email"
curl -s -X POST "$BASE_URL/identify" \
  -H "Content-Type: application/json" \
  -d '{"email":"mcfly@hillvalley.edu","phoneNumber":"123456"}' | jq . 2>/dev/null || \
  curl -s -X POST "$BASE_URL/identify" \
    -H "Content-Type: application/json" \
    -d '{"email":"mcfly@hillvalley.edu","phoneNumber":"123456"}'
echo ""
echo ""

# Test 4: Only Email
echo "📋 Test 4: Query with Email Only"
curl -s -X POST "$BASE_URL/identify" \
  -H "Content-Type: application/json" \
  -d '{"email":"lorraine@hillvalley.edu","phoneNumber":null}' | jq . 2>/dev/null || \
  curl -s -X POST "$BASE_URL/identify" \
    -H "Content-Type: application/json" \
    -d '{"email":"lorraine@hillvalley.edu","phoneNumber":null}'
echo ""
echo ""

# Test 5: Only Phone
echo "📋 Test 5: Query with Phone Only"
curl -s -X POST "$BASE_URL/identify" \
  -H "Content-Type: application/json" \
  -d '{"email":null,"phoneNumber":"123456"}' | jq . 2>/dev/null || \
  curl -s -X POST "$BASE_URL/identify" \
    -H "Content-Type: application/json" \
    -d '{"email":null,"phoneNumber":"123456"}'
echo ""
echo ""

# Test 6: Invalid Request
echo "📋 Test 6: Invalid Request (Missing both fields)"
curl -s -X POST "$BASE_URL/identify" \
  -H "Content-Type: application/json" \
  -d '{}' | jq . 2>/dev/null || \
  curl -s -X POST "$BASE_URL/identify" \
    -H "Content-Type: application/json" \
    -d '{}'
echo ""
echo ""

echo "✅ Test suite completed!"
echo ""
echo "💡 Tip: Install 'jq' for pretty JSON output:"
echo "   Ubuntu/Debian: sudo apt-get install jq"
echo "   macOS: brew install jq"
echo "   Or visit: https://stedolan.github.io/jq/"
