# API Documentation - AI Programming Tutor

## Overview

This document provides detailed information about the AI Programming Tutor API endpoints, including request/response examples and use cases.

## Base URL
```
http://localhost:8000/api/v1
```

## Role-Based Access Control (RBAC)

The API implements role-based access control with the following roles:

### User Roles

| Role | Capabilities |
|------|--------------|
| **Student** | • View all published problems<br>• Submit code solutions<br>• Get AI feedback and hints<br>• Track personal progress<br>• View public leaderboard |
| **Teacher** | • Create and manage problems<br>• View all student submissions for their problems<br>• View class progress statistics<br>• All student capabilities |
| **Admin** | • Full system access<br>• Manage all users and problems<br>• Modify any resource (creator ownership bypassed)<br>• System administration |

### Access Control Rules

- **Create Problems**: Only Teachers and Admins
- **View Problems**: All authenticated users can see all problems
- **Update Problem**: Only problem creator or admin
- **Delete Problem**: Only problem creator or admin (soft delete)
- **API Assistance & Chat**: Students and Teachers
- **View Progress**: Users can only view their own progress (Admin can view all)
- **Submit Code**: All authenticated users
- **Leaderboard**: All users (public viewing)

### Default Role

New users are registered as **Students** by default. Teachers must be explicitly assigned the teacher role during registration, or an admin must upgrade their account.

---

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

Create a new user account as either a student or teacher.

**Request:**
```json
{
  "email": "student@example.com",
  "username": "student123",
  "password": "securepassword123",
  "full_name": "John Doe",
  "role": "student"
}
```

**Parameters:**
- `role` (optional) - "student" (default) or "teacher"

**Response (201):**
```json
{
  "id": 1,
  "email": "student@example.com",
  "username": "student123",
  "full_name": "John Doe",
  "role": "student",
  "is_active": true,
  "created_at": "2024-02-16T10:00:00Z"
}
```

**Status Codes:**
- 201 - User created successfully
- 400 - Email or username already exists
- 422 - Validation error (password too short, invalid email format)

#### Login
**POST** `/auth/login`

Authenticate and receive JWT access token.

**Request:**
```json
{
  "email": "student@example.com",
  "password": "securepassword123"
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
  "role": "student",
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

Get detailed information about a specific problem (creator or admin only).

**Required Permission:** Must be the problem creator or admin

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
      "input": [2, 7, 11, 15],
      "expected_output": [0, 1]
    }
  ],
  "starter_code": "def two_sum(nums, target):\n    pass",
  "hints": ["Think about hash maps..."],
  "learning_objectives": ["Understand hash maps"],
  "related_concepts": ["arrays", "hash_maps"],
  "created_at": "2024-02-16T10:00:00Z"
}
```

**Status Codes:**
- 200 - Problem retrieved successfully
- 403 - Only creator or admin can view this problem
- 404 - Problem not found

#### Create Problem
**POST** `/problems/`

Create a new programming problem (teachers only).

**Required Role:** Teacher

**Request:**
```json
{
  "title": "Find Maximum",
  "description": "Find the maximum element in an array",
  "difficulty": "beginner",
  "topic": "arrays",
  "examples": [
    {"input": [1, 5, 3], "expected_output": 5}
  ],
  "test_cases": [
    {
      "id": "test_1",
      "input": [1, 5, 3],
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

**Response (201):**
```json
{
  "id": 1,
  "title": "Find Maximum",
  "description": "Find the maximum element in an array",
  "difficulty": "beginner",
  "topic": "arrays",
  "examples": [...],
  "starter_code": "...",
  "created_at": "2024-02-16T10:00:00Z"
}
```

**Status Codes:**
- 201 - Problem created successfully
- 403 - Only teachers can create problems
- 422 - Validation error

#### Update Problem
**PUT** `/problems/{problem_id}`

Update a problem (creator or admin only). All fields are optional.

**Required Role:** Creator of the problem or Admin
**Required Permission:** Must be the problem creator or admin

**Request:**
```json
{
  "title": "Find Maximum Value",
  "description": "Find the maximum element in an array",
  "difficulty": "intermediate",
  "topic": "arrays",
  "starter_code": "def find_max(arr):\n    # Complete this function",
  "examples": [
    {"input": [1, 5, 3], "expected_output": 5}
  ],
  "test_cases": [
    {
      "id": "test_1",
      "input": [1, 5, 3],
      "expected_output": 5,
      "function_name": "find_max"
    }
  ],
  "is_active": true
}
```

**Response (200):**
```json
{
  "id": 1,
  "title": "Find Maximum Value",
  "description": "Find the maximum element in an array",
  "difficulty": "intermediate",
  "topic": "arrays",
  "examples": [...],
  "starter_code": "def find_max(arr):\n    # Complete this function",
  "created_at": "2024-02-16T10:00:00Z",
  "updated_at": "2024-02-16T11:30:00Z"
}
```

**Status Codes:**
- 200 - Problem updated successfully
- 403 - Only creator or admin can update this problem
- 404 - Problem not found

#### Delete Problem
**DELETE** `/problems/{problem_id}`

Soft delete a problem (creator or admin only).

**Required Permission:** Must be the problem creator or admin

**Response:** 204 No Content

**Status Codes:**
- 204 - Problem deleted successfully
- 403 - Only creator or admin can delete this problem
- 404 - Problem not found

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

**Status Codes:**
- 201 - Submission created, evaluation in progress
- 400 - Code too long (max 50,000 characters)
- 404 - Problem not found
- 413 - Code size exceeded

#### Get Submission
**GET** `/submissions/{submission_id}`

Get detailed results of a submission including AI feedback and test results.

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

**Submission Status Values:**
- `pending` - Awaiting evaluation
- `correct` - All test cases passed
- `incorrect` - All test cases failed
- `partial` - Some test cases passed
- `error` - Error during execution

**Status Codes:**
- 200 - Submission retrieved
- 404 - Submission not found

#### List User Submissions
**GET** `/submissions/`

Get all submissions by the current user with optional filtering.

**Query Parameters:**
- `page` (default: 1) - Page number
- `page_size` (default: 20) - Items per page
- `problem_id` (optional) - Filter by problem
- `status` (optional) - Filter by status (pending, correct, incorrect, partial, error)

**Response (200):**
```json
{
  "submissions": [
    {
      "id": 42,
      "problem_id": 1,
      "status": "correct",
      "score": 95.5,
      "submitted_at": "2024-02-16T10:30:00Z"
    }
  ],
  "total": 45,
  "page": 1,
  "page_size": 20
}
```

---

### Learning Sessions

Student learning sessions that track time spent and progress on problems.

#### Create Session
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

**Status Codes:**
- 201 - Session created
- 404 - Problem not found

#### Get Session
**GET** `/sessions/{session_id}`

Get details of a learning session.

#### Complete Session
**PUT** `/sessions/{session_id}/complete`

End an active study session.

**Required Permission:** Must be session creator or admin

**Request:**
```json
{}
```

**Response (200):**
```json
{
  "id": 1,
  "problem_id": 1,
  "user_id": 123,
  "started_at": "2024-02-16T10:00:00Z",
  "completed_at": "2024-02-16T10:35:00Z",
  "is_completed": true,
  "attempts_count": 2,
  "time_spent": 2100,
  "final_score": 95.5
}
```

**Status Codes:**
- 200 - Session ended
- 400 - Session already ended
- 403 - Not your session
- 404 - Session not found

#### List User Sessions
**GET** `/sessions/`

Get all study sessions for the current user.

**Query Parameters:**
- `limit` (default: 10) - Maximum number of sessions to return

**Response (200):**
```json
[
  {
    "id": 2,
    "problem_id": 1,
    "started_at": "2026-04-15T18:29:35.325722Z",
    "completed_at": null,
    "is_completed": false,
    "attempts_count": 0,
    "time_spent": null,
    "final_score": null
  },
  {
    "id": 1,
    "problem_id": 1,
    "started_at": "2026-04-15T18:23:20.041847Z",
    "completed_at": null,
    "is_completed": false,
    "attempts_count": 2,
    "time_spent": null,
    "final_score": null
  }
]
```

**Status Codes:**
- 200 - Sessions retrieved
- 401 - Not authenticated

---

### AI Assistance

AI-powered assistance including hints, explanations, and chat support for students.

#### Get Hint
**POST** `/ai/hint`

Get a progressive hint for a problem. Each problem has up to 3 levels of hints.

**Required Role:** Student (can be teacher too)

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
  "remaining_hints": 2,
  "next_level_available": true
}
```

**Status Codes:**
- 200 - Hint retrieved
- 400 - Invalid hint level (must be 1-3)
- 404 - Problem not found
- 429 - Hint limit exceeded for this session

#### Get Code Explanation
**POST** `/ai/explain`

Get detailed explanation of code snippet or error.

**Required Role:** Student (can be teacher too)

**Request:**
```json
{
  "code": "def two_sum(nums, target):\n    hash_map = {}\n    for num in nums:\n        complement = target - num\n        if complement in hash_map:\n            return True",
  "language": "python",
  "context": "solving two sum problem"
}
```

**Response (200):**
```json
{
  "explanation": "This code implements a hash map approach to solve the two sum problem...",
  "key_concepts": [
    "Hash map for O(1) lookups",
    "Single pass algorithm",
    "Time complexity O(n)"
  ],
  "potential_issues": [
    "Missing edge case for duplicate numbers"
  ]
}
```

**Status Codes:**
- 200 - Explanation generated
- 400 - Code too long (max 10,000 characters)
- 429 - Too many requests, rate limited

#### Chat with AI
**POST** `/ai/chat`

Have a conversation with the AI assistant about problems, concepts, or debugging.

**Required Role:** Student (can be teacher too)

**Request:**
```json
{
  "message": "I'm getting an IndexError. What does that mean?",
  "problem_id": 1,
  "context": {
    "current_code": "def two_sum(nums, target):\n    return [nums[10], nums[20]]",
    "error_message": "list index out of range"
  }
}
```

**Response (200):**
```json
{
  "response": "An IndexError with 'list index out of range' means you're trying to access an element at an index that doesn't exist in the list. In your code, you're trying to access index 10 and 20, but the list might be smaller. You should check the length of the list first using len().",
  "follow_up_suggestions": [
    "How can I check the length of a list?",
    "What debugging techniques can help?",
    "Can you show me a safe way to access list elements?"
  ],
  "conversation_id": "conv_123"
}
```

**Status Codes:**
- 200 - Response generated
- 400 - Message too long (max 5,000 characters)
- 429 - Too many requests, rate limited

---

### Progress

Track learning progress and performance across problems.

#### Get My Progress
**GET** `/progress/`

Get all progress records for the current user.

**Required Role:** Any authenticated user (Student or Teacher)

**Query Parameters:**
- `page` (default: 1) - Page number
- `page_size` (default: 20) - Items per page
- `difficulty` (optional) - Filter by difficulty (beginner, intermediate, advanced)
- `topic` (optional) - Filter by topic

**Response (200):**
```json
{
  "progress_records": [
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
  ],
  "total": 15,
  "page": 1
}
```

**Status Codes:**
- 200 - Progress retrieved
- 401 - Not authenticated

#### Get User Statistics
**GET** `/progress/statistics`

Get comprehensive statistics for the current user.

**Required Role:** Any authenticated user

**Response (200):**
```json
{
  "user_id": 123,
  "total_problems_attempted": 15,
  "total_problems_completed": 10,
  "completion_rate": 66.7,
  "average_score": 87.5,
  "total_time_spent_minutes": 300,
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
  "recent_activity": []
}
```

**Status Codes:**
- 200 - Statistics retrieved
- 401 - Not authenticated



#### Get Leaderboard
**GET** `/progress/leaderboard`

Get top users by problems completed and average scores.

**Query Parameters:**
- `sort_by` (default: problems_completed) - Sort by: problems_completed, average_score, streak_days
- `limit` (default: 10) - Number of top users to return
- `timeframe` (default: all_time) - Timeframe: all_time, month, week

**Response (200):**
```json
{
  "leaderboard": [
    {
      "rank": 1,
      "user_id": 456,
      "username": "coding_master",
      "problems_completed": 150,
      "average_score": 92.3,
      "streak_days": 45
    },
    {
      "rank": 2,
      "user_id": 789,
      "username": "student123",
      "problems_completed": 120,
      "average_score": 88.7,
      "streak_days": 23
    }
  ],
  "generated_at": "2024-02-16T12:00:00Z"
}
```

**Status Codes:**
- 200 - Leaderboard retrieved
- 400 - Invalid sort_by or timeframe parameter

---


---

## Error Responses

All endpoints may return error responses in this format. Common error codes include:

**400 Bad Request:**
```json
{
  "detail": "Invalid input data",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```
Returned when request data fails validation.

**401 Unauthorized:**
```json
{
  "detail": "Could not validate credentials"
}
```
Returned when authentication token is missing, invalid, or expired. Clients should re-authenticate.

**403 Forbidden:**
```json
{
  "detail": "Insufficient permissions",
  "required_role": "teacher",
  "user_role": "student"
}
```
Returned when user lacks required role or permission. Teachers can only perform certain operations, and only creators/admins can modify resources.

**404 Not Found:**
```json
{
  "detail": "Resource not found",
  "resource_type": "problem",
  "resource_id": 999
}
```
Returned when requested resource doesn't exist or has been deleted.

**409 Conflict:**
```json
{
  "detail": "Resource already exists",
  "field": "username"
}
```
Returned when trying to create a resource that violates unique constraints.

**413 Payload Too Large:**
```json
{
  "detail": "Request body too large",
  "max_size": 50000,
  "provided_size": 75000
}
```
Returned when code submission exceeds maximum allowed size.

**429 Too Many Requests:**
```json
{
  "detail": "Rate limit exceeded",
  "retry_after": 60
}
```
Returned when too many requests are made in a short time period. AI assistance endpoints have rate limits to prevent abuse.

**500 Internal Server Error:**
```json
{
  "detail": "Internal server error",
  "error_id": "err_abc123def"
}
```
Returned when an unexpected error occurs on the server. Include error_id when reporting issues.

---

## Rate Limiting

The following endpoints have rate limits to ensure fair usage:

- **AI Assistance Endpoints** (`/ai/*`): 30 requests per hour per user
- **Code Submission Endpoint** (`/submissions/`): 100 submissions per hour per user
- **Chat Endpoint** (`/ai/chat`): 50 messages per hour per user

Rate limit information is included in response headers:
- `X-RateLimit-Limit`: Total requests allowed in window
- `X-RateLimit-Remaining`: Requests remaining in window
- `X-RateLimit-Reset`: Unix timestamp when window resets

---

## Webhooks

(Planned feature for real-time notifications on problem completion and milestone achievements)
