# API Documentation - AI Programming Tutor

## Overview

This document provides detailed information about the AI Programming Tutor API endpoints, including request/response examples and use cases.

## Base URL
```
http://localhost:8000/api/v1
```

## Authentication

All endpoints (except `/auth/register` and `/auth/login`) require JWT authentication.

Include the token in the Authorization header:
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

---

## Endpoints

### Authentication

#### Register User
**POST** `/auth/register`

Create a new user account.

**Request:**
```json
{
  "email": "student@example.com",
  "username": "student123",
  "password": "securepassword",
  "full_name": "John Doe"
}
```

**Response (201):**
```json
{
  "id": 1,
  "email": "student@example.com",
  "username": "student123",
  "full_name": "John Doe",
  "is_active": true,
  "created_at": "2024-02-16T10:00:00Z"
}
```

#### Login
**POST** `/auth/login`

Authenticate and receive access token.

**Request:**
```json
{
  "email": "student@example.com",
  "password": "securepassword"
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

#### Get Current User
**GET** `/auth/me`

Get information about the currently authenticated user.

**Response (200):**
```json
{
  "id": 1,
  "email": "student@example.com",
  "username": "student123",
  "full_name": "John Doe",
  "is_active": true,
  "created_at": "2024-02-16T10:00:00Z"
}
```

---

### Problems

#### List Problems
**GET** `/problems/`

Get paginated list of programming problems.

**Query Parameters:**
- `page` (default: 1) - Page number
- `page_size` (default: 20) - Items per page
- `difficulty` (optional) - Filter by difficulty: "beginner", "intermediate", "advanced"
- `topic` (optional) - Filter by topic
- `search` (optional) - Search in title and description

**Example Request:**
```
GET /problems/?difficulty=beginner&page=1&page_size=10
```

**Response (200):**
```json
{
  "problems": [
    {
      "id": 1,
      "title": "Two Sum",
      "description": "Given an array...",
      "difficulty": "beginner",
      "topic": "arrays",
      "examples": [...],
      "starter_code": "def two_sum(nums, target):\n    pass",
      "hints": ["Use a hash map..."],
      "created_at": "2024-02-16T10:00:00Z"
    }
  ],
  "total": 50,
  "page": 1,
  "page_size": 10
}
```

#### Get Problem
**GET** `/problems/{problem_id}`

Get detailed information about a specific problem.

**Response (200):**
```json
{
  "id": 1,
  "title": "Two Sum",
  "description": "Given an array of integers...",
  "difficulty": "beginner",
  "topic": "arrays",
  "constraints": {
    "array_length": {"min": 2, "max": 10000}
  },
  "examples": [
    {
      "input": [[2, 7, 11, 15], 9],
      "expected_output": [0, 1]
    }
  ],
  "starter_code": "def two_sum(nums, target):\n    pass",
  "hints": ["Think about hash maps..."],
  "learning_objectives": ["Understand hash maps"],
  "related_concepts": ["arrays", "hash_maps"]
}
```

#### Create Problem
**POST** `/problems/`

Create a new programming problem (requires admin privileges).

**Request:**
```json
{
  "title": "Find Maximum",
  "description": "Find the maximum element in an array",
  "difficulty": "beginner",
  "topic": "arrays",
  "examples": [
    {"input": [[1, 5, 3]], "expected_output": 5}
  ],
  "test_cases": [
    {
      "id": "test_1",
      "input": [[1, 5, 3]],
      "expected_output": 5,
      "function_name": "find_max"
    }
  ],
  "starter_code": "def find_max(arr):\n    pass",
  "evaluation_criteria": {
    "check_correctness": true,
    "check_efficiency": true
  },
  "hints": ["Consider iterating through the array"],
  "time_limit": 5000,
  "memory_limit": 256
}
```

---

### Submissions

#### Submit Code
**POST** `/submissions/`

Submit code for evaluation. The submission will be evaluated asynchronously.

**Request:**
```json
{
  "problem_id": 1,
  "code": "def two_sum(nums, target):\n    hash_map = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in hash_map:\n            return [hash_map[complement], i]\n        hash_map[num] = i",
  "language": "python",
  "session_id": 1
}
```

**Response (201):**
```json
{
  "id": 42,
  "problem_id": 1,
  "code": "def two_sum(nums, target)...",
  "language": "python",
  "status": "pending",
  "submitted_at": "2024-02-16T10:30:00Z"
}
```

#### Get Submission
**GET** `/submissions/{submission_id}`

Get detailed results of a submission including AI feedback.

**Response (200):**
```json
{
  "id": 42,
  "problem_id": 1,
  "code": "def two_sum(nums, target)...",
  "language": "python",
  "status": "correct",
  "score": 95.5,
  "test_results": [
    {
      "test_id": "test_1",
      "passed": true,
      "expected": [0, 1],
      "actual": [0, 1]
    }
  ],
  "execution_time": 12.5,
  "ai_feedback": {
    "overall_assessment": "Excellent solution using hash map approach...",
    "correctness_score": 100,
    "quality_score": 95,
    "efficiency_score": 95,
    "strengths": [
      "Correct algorithm implementation",
      "Optimal time complexity O(n)"
    ],
    "issues": [
      {
        "type": "style_issue",
        "description": "Consider adding type hints"
      }
    ],
    "suggestions": [
      "Add docstring",
      "Consider edge case handling"
    ],
    "next_steps": [
      "Try solving similar problems",
      "Learn about space-time tradeoffs"
    ]
  },
  "submitted_at": "2024-02-16T10:30:00Z",
  "evaluated_at": "2024-02-16T10:30:15Z"
}
```

#### Get Problem Submissions
**GET** `/submissions/problem/{problem_id}`

Get all submissions for a specific problem by the current user.

---

### Learning Sessions

#### Start Session
**POST** `/sessions/`

Start a new learning session for a problem.

**Request:**
```json
{
  "problem_id": 1
}
```

**Response (201):**
```json
{
  "id": 1,
  "problem_id": 1,
  "started_at": "2024-02-16T10:00:00Z",
  "is_completed": false,
  "attempts_count": 0
}
```

#### Get Session
**GET** `/sessions/{session_id}`

Get details of a learning session.

#### Complete Session
**PUT** `/sessions/{session_id}/complete`

Mark a session as completed.

**Request:**
```json
{
  "final_score": 95.5
}
```

---

### AI Assistance

#### Get Hint
**POST** `/ai/hint`

Get a progressive hint for a problem.

**Request:**
```json
{
  "problem_id": 1,
  "session_id": 1,
  "current_code": "def two_sum(nums, target):\n    # stuck here",
  "hint_level": 1
}
```

**Response (200):**
```json
{
  "hint": "Think about what data structure would allow you to quickly check if a number exists. A hash map (dictionary in Python) can look up values in O(1) time.",
  "hint_level": 1,
  "remaining_hints": 2
}
```

#### Chat with AI
**POST** `/ai/chat`

Have a conversation with the AI assistant.

**Request:**
```json
{
  "message": "I'm getting an IndexError. What does that mean?",
  "context": {
    "current_code": "def two_sum(nums, target):\n    return [nums[10], nums[20]]"
  }
}
```

**Response (200):**
```json
{
  "response": "An IndexError occurs when you try to access an index that doesn't exist in a list. In your code, you're trying to access nums[10] and nums[20], but your array might not have that many elements. You should only access indices that are within the range of the array length."
}
```

#### Explain Error
**POST** `/ai/explain-error`

Get an explanation for an error message.

**Request:**
```json
{
  "error_message": "TypeError: 'NoneType' object is not subscriptable",
  "code": "def solution():\n    result = None\n    return result[0]"
}
```

---

### Progress

#### Get My Progress
**GET** `/progress/`

Get all progress records for the current user.

**Response (200):**
```json
[
  {
    "problem_id": 1,
    "problem_title": "Two Sum",
    "difficulty": "beginner",
    "is_completed": true,
    "best_score": 95.5,
    "attempts": 3,
    "total_time_spent": 1800,
    "completed_at": "2024-02-16T11:00:00Z"
  }
]
```

#### Get Statistics
**GET** `/progress/statistics`

Get comprehensive statistics for the current user.

**Response (200):**
```json
{
  "total_problems_attempted": 15,
  "total_problems_completed": 10,
  "average_score": 87.5,
  "total_time_spent": 18000,
  "problems_by_difficulty": {
    "beginner": 7,
    "intermediate": 6,
    "advanced": 2
  },
  "problems_by_topic": {
    "arrays": 5,
    "linked_lists": 3,
    "trees": 4,
    "graphs": 3
  },
  "recent_activity": [...]
}
```

#### Get Leaderboard
**GET** `/progress/leaderboard`

Get top users by problems completed.

**Response (200):**
```json
[
  {
    "rank": 1,
    "username": "coding_master",
    "problems_completed": 150,
    "average_score": 92.3
  },
  {
    "rank": 2,
    "username": "student123",
    "problems_completed": 120,
    "average_score": 88.7
  }
]
```

---

## Error Responses

All endpoints may return error responses in this format:

**400 Bad Request:**
```json
{
  "detail": "Invalid input data"
}
```

**401 Unauthorized:**
```json
{
  "detail": "Could not validate credentials"
}
```

**404 Not Found:**
```json
{
  "detail": "Resource not found"
}
```

**500 Internal Server Error:**
```json
{
  "detail": "Internal server error"
}
```

---

## Rate Limiting

(To be implemented in production)

---

## Webhooks

(Planned feature for notifications)
