#!/bin/bash

# Lead Qualifier API Testing Script
# This script provides helper functions to test the MongoDB backend APIs

BASE_URL="http://localhost:3000/api"
COLORS='\033[0m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${COLORS}"
echo -e "${BLUE}║   Lead Qualifier API Testing Suite                    ║${COLORS}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${COLORS}"
echo ""

# Test 1: Create a new lead
create_lead() {
  echo -e "${YELLOW}[TEST 1] Creating a new lead...${COLORS}"
  
  RESPONSE=$(curl -s -X POST "$BASE_URL/leads" \
    -H "Content-Type: application/json" \
    -d '{
      "budgetScore": 4,
      "budgetEvidence": "Original Budget: INR 5-10 lacs; Converted USD: approx 6,000 - 12,000",
      "authorityScore": 2,
      "authorityEvidence": "Lead'"'"'s role: Marketing Manager; ICP decision-makers: CTO, VP Engineering",
      "needScore": 8,
      "needEvidence": "Engagement Intent: Outsourcing / Staff Augmentation / Product Build",
      "timelineScore": 8,
      "timelineEvidence": "Timeline: 2-4 Months; Client looking to start/deliver within 2-4 months",
      "overallAssessment": "Qualified with caveats: clear need and urgency",
      "qualificationReason": "Strong need and timely engagement with external resources",
      "disQualificationReason": "No senior decision-maker identified",
      "recommendedAction": "Qualify further with a stakeholder who has purchasing authority",
      "finalStatus": "⚠️ Low Priority Lead",
      "status": "Low Priority Lead",
      "leadScore": 5.5,
      "isQualified": true,
      "leadInfo": {
        "leadName": "Test Lead",
        "leadPhone": "+1 516 263 6555",
        "leadEmail": "test.lead'"$(date +%s)"'@example.com",
        "companyName": "Test Company",
        "jobTitle": "Marketing Manager",
        "companyWebsite": "example.com",
        "leadIndustry": "IT Services",
        "coSize": "1-10",
        "techTeamSize": "0",
        "location": "New York",
        "monthlyBudget": "5 - 10 lacs",
        "techStack": ["react-js", "google-cloud-platform"],
        "opportunity_type": "ECNB",
        "timeline": "2 - 4 Months",
        "receiverEmail": "receiver@example.com",
        "receiverName": "Mithun Sen",
        "leadData": {
          "success_criteria": ["Build one central lead intelligence system"],
          "lead_type": "Outbound",
          "primary_need": "Data Engg & AIA",
          "proposed_solution": "Automated Lead Management System"
        }
      }
    }')
  
  echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
  echo ""
  
  # Extract the lead ID for later tests
  LEAD_ID=$(echo "$RESPONSE" | jq -r '.data._id' 2>/dev/null)
  echo -e "${GREEN}✓ Lead ID: $LEAD_ID${COLORS}"
  echo ""
  
  echo "$LEAD_ID"
}

# Test 2: Fetch all leads
fetch_all_leads() {
  echo -e "${YELLOW}[TEST 2] Fetching all leads from MongoDB...${COLORS}"
  
  curl -s -X GET "$BASE_URL/leads" | jq '.'
  echo ""
}

# Test 3: Fetch qualified leads
fetch_qualified_leads() {
  echo -e "${YELLOW}[TEST 3] Fetching qualified leads only...${COLORS}"
  
  curl -s -X GET "$BASE_URL/leads?isQualified=true" | jq '.'
  echo ""
}

# Test 4: Fetch leads with score >= 7
fetch_high_score_leads() {
  echo -e "${YELLOW}[TEST 4] Fetching leads with score >= 7...${COLORS}"
  
  curl -s -X GET "$BASE_URL/leads?scoreMin=7" | jq '.'
  echo ""
}

# Test 5: Fetch single lead
fetch_single_lead() {
  LEAD_ID=$1
  echo -e "${YELLOW}[TEST 5] Fetching single lead: $LEAD_ID${COLORS}"
  
  curl -s -X GET "$BASE_URL/leads/$LEAD_ID" | jq '.'
  echo ""
}

# Test 6: Update a lead
update_lead() {
  LEAD_ID=$1
  echo -e "${YELLOW}[TEST 6] Updating lead: $LEAD_ID${COLORS}"
  
  curl -s -X PATCH "$BASE_URL/leads/$LEAD_ID" \
    -H "Content-Type: application/json" \
    -d '{
      "status": "Qualified",
      "leadScore": 8.5,
      "isQualified": true
    }' | jq '.'
  echo ""
}

# Test 7: Delete a lead (optional - comment out to keep data)
delete_lead() {
  LEAD_ID=$1
  echo -e "${YELLOW}[TEST 7] Deleting lead: $LEAD_ID${COLORS}"
  
  curl -s -X DELETE "$BASE_URL/leads/$LEAD_ID" | jq '.'
  echo ""
}

# Test 8: Test duplicate prevention
test_duplicate_prevention() {
  echo -e "${YELLOW}[TEST 8] Testing duplicate email prevention...${COLORS}"
  
  curl -s -X POST "$BASE_URL/leads" \
    -H "Content-Type: application/json" \
    -d '{
      "budgetScore": 5,
      "authorityScore": 5,
      "needScore": 5,
      "timelineScore": 5,
      "status": "pending",
      "leadScore": 5,
      "isQualified": false,
      "leadInfo": {
        "leadName": "Duplicate Test",
        "leadEmail": "duplicate@example.com",
        "companyName": "Test Company",
        "jobTitle": "Manager",
        "coSize": "1-10",
        "techTeamSize": "0"
      }
    }' | jq '.'
  
  echo -e "${YELLOW}Trying to create duplicate...${COLORS}"
  
  curl -s -X POST "$BASE_URL/leads" \
    -H "Content-Type: application/json" \
    -d '{
      "budgetScore": 6,
      "authorityScore": 6,
      "needScore": 6,
      "timelineScore": 6,
      "status": "pending",
      "leadScore": 6,
      "isQualified": false,
      "leadInfo": {
        "leadName": "Different Name",
        "leadEmail": "duplicate@example.com",
        "companyName": "Different Company",
        "jobTitle": "Director",
        "coSize": "10-50",
        "techTeamSize": "5"
      }
    }' | jq '.'
  
  echo ""
}

# Main execution
if [ "$1" == "all" ]; then
  LEAD_ID=$(create_lead)
  fetch_all_leads
  fetch_single_lead "$LEAD_ID"
  update_lead "$LEAD_ID"
elif [ "$1" == "create" ]; then
  create_lead
elif [ "$1" == "fetch-all" ]; then
  fetch_all_leads
elif [ "$1" == "fetch-qualified" ]; then
  fetch_qualified_leads
elif [ "$1" == "fetch-high-score" ]; then
  fetch_high_score_leads
elif [ "$1" == "fetch" ] && [ -n "$2" ]; then
  fetch_single_lead "$2"
elif [ "$1" == "update" ] && [ -n "$2" ]; then
  update_lead "$2"
elif [ "$1" == "delete" ] && [ -n "$2" ]; then
  delete_lead "$2"
elif [ "$1" == "duplicate-test" ]; then
  test_duplicate_prevention
else
  echo "Usage:"
  echo "  ./test-api.sh all                           # Run all tests"
  echo "  ./test-api.sh create                        # Create a new lead"
  echo "  ./test-api.sh fetch-all                     # Fetch all leads"
  echo "  ./test-api.sh fetch-qualified               # Fetch qualified leads"
  echo "  ./test-api.sh fetch-high-score              # Fetch high-scoring leads"
  echo "  ./test-api.sh fetch <LEAD_ID>              # Fetch single lead"
  echo "  ./test-api.sh update <LEAD_ID>             # Update lead"
  echo "  ./test-api.sh delete <LEAD_ID>             # Delete lead"
  echo "  ./test-api.sh duplicate-test                # Test duplicate prevention"
  echo ""
  echo "Examples:"
  echo "  ./test-api.sh create"
  echo "  ./test-api.sh fetch-all"
  echo "  ./test-api.sh fetch 507f1f77bcf86cd799439011"
  echo "  ./test-api.sh update 507f1f77bcf86cd799439011"
fi
