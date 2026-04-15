# Backend Class Diagrams
## AI Companion for Computer Science Education

---

## 1. Database Models (SQLAlchemy ORM)

### Core Data Entities

```mermaid
classDiagram
    direction TB
    
    class DifficultyLevel {
        <<enumeration>>
        BEGINNER
        INTERMEDIATE
        ADVANCED
    }

    class SubmissionStatus {
        <<enumeration>>
        PENDING
        CORRECT
        INCORRECT
        PARTIAL
        ERROR
    }

    class User {
        +id: Integer PK
        +email: String UK
        +username: String UK
        +hashed_password: String
        +full_name: String
        +is_active: Boolean
        +is_superuser: Boolean
        +created_at: DateTime
        +updated_at: DateTime
    }

    class Problem {
        +id: Integer PK
        +title: String
        +description: Text
        +difficulty: DifficultyLevel FK
        +topic: String
        +constraints: JSON
        +examples: JSON
        +test_cases: JSON
        +starter_code: Text
        +solution_template: Text
        +evaluation_criteria: JSON
        +time_limit: Integer
        +memory_limit: Integer
        +hints: JSON
        +learning_objectives: JSON
        +related_concepts: JSON
        +created_by: Integer FK
        +created_at: DateTime
        +updated_at: DateTime
        +is_active: Boolean
    }

    class Submission {
        +id: Integer PK
        +user_id: Integer FK
        +problem_id: Integer FK
        +session_id: Integer FK
        +code: Text
        +language: String
        +status: SubmissionStatus
        +score: Float
        +test_results: JSON
        +execution_time: Float
        +memory_used: Float
        +ai_feedback: JSON
        +correctness_analysis: Text
        +quality_analysis: Text
        +suggestions: JSON
        +identified_issues: JSON
        +submitted_at: DateTime
        +evaluated_at: DateTime
    }

    class LearningSession {
        +id: Integer PK
        +user_id: Integer FK
        +problem_id: Integer FK
        +started_at: DateTime
        +completed_at: DateTime
        +is_completed: Boolean
        +hints_used: JSON
        +ai_interactions: JSON
        +attempts_count: Integer
        +time_spent: Integer
        +final_score: Float
    }

    class UserProgress {
        +id: Integer PK
        +user_id: Integer FK
        +problem_id: Integer FK
        +is_completed: Boolean
        +best_score: Float
        +attempts: Integer
        +first_attempt_at: DateTime
        +completed_at: DateTime
        +total_time_spent: Integer
        +hints_used_count: Integer
    }

    class AIInteraction {
        +id: Integer PK
        +user_id: Integer FK
        +session_id: Integer FK
        +interaction_type: String
        +user_message: Text
        +ai_response: Text
        +context: JSON
        +created_at: DateTime
        +tokens_used: Integer
        +response_time: Float
    }

    User "1" --> "*" Submission : submits
    User "1" --> "*" LearningSession : initiates
    User "1" --> "*" UserProgress : tracks
    User "1" --> "*" AIInteraction : generates
    
    Problem "1" --> "*" Submission : receives
    Problem "1" --> "*" LearningSession : teaches
    Problem "1" --> "*" UserProgress : monitored_by
    
    LearningSession "1" --> "*" Submission : contains
    LearningSession "1" --> "*" AIInteraction : logs
```

**Legend for DB Diagrams:**
- `PK` = Primary Key
- `FK` = Foreign Key  
- `UK` = Unique Key
- `*` = One-to-Many relationship

---

## 1.5 Entity-Relationship (ER) Diagram

### Complete Database Schema

```mermaid
erDiagram
    USER ||--o{ SUBMISSION : submits
    USER ||--o{ LEARNING_SESSION : initiates
    USER ||--o{ USER_PROGRESS : tracks
    USER ||--o{ AI_INTERACTION : generates
    
    PROBLEM ||--o{ SUBMISSION : receives
    PROBLEM ||--o{ LEARNING_SESSION : teaches
    PROBLEM ||--o{ USER_PROGRESS : monitored_by
    
    LEARNING_SESSION ||--o{ SUBMISSION : contains
    LEARNING_SESSION ||--o{ AI_INTERACTION : logs

    USER {
        int id PK
        string email UK
        string username UK
        string hashed_password
        string full_name
        boolean is_active
        boolean is_superuser
        timestamp created_at
        timestamp updated_at
    }

    PROBLEM {
        int id PK
        string title
        text description
        enum difficulty
        string topic
        json constraints
        json examples
        json test_cases
        text starter_code
        text solution_template
        json evaluation_criteria
        int time_limit
        int memory_limit
        json hints
        json learning_objectives
        json related_concepts
        int created_by FK
        timestamp created_at
        timestamp updated_at
        boolean is_active
    }

    SUBMISSION {
        int id PK
        int user_id FK
        int problem_id FK
        int session_id FK
        text code
        string language
        enum status
        float score
        json test_results
        float execution_time
        float memory_used
        json ai_feedback
        text correctness_analysis
        text quality_analysis
        json suggestions
        json identified_issues
        timestamp submitted_at
        timestamp evaluated_at
    }

    LEARNING_SESSION {
        int id PK
        int user_id FK
        int problem_id FK
        timestamp started_at
        timestamp completed_at
        boolean is_completed
        json hints_used
        json ai_interactions
        int attempts_count
        int time_spent
        float final_score
    }

    USER_PROGRESS {
        int id PK
        int user_id FK
        int problem_id FK
        boolean is_completed
        float best_score
        int attempts
        timestamp first_attempt_at
        timestamp completed_at
        int total_time_spent
        int hints_used_count
    }

    AI_INTERACTION {
        int id PK
        int user_id FK
        int session_id FK
        string interaction_type
        text user_message
        text ai_response
        json context
        timestamp created_at
        int tokens_used
        float response_time
    }
```

### ER Diagram Explanation

**Entities & Attributes:**
- **USER**: Stores student and instructor account information
- **PROBLEM**: Contains programming problem definitions and specifications
- **SUBMISSION**: Tracks code submissions with evaluation results
- **LEARNING_SESSION**: Represents a user's problem-solving session
- **USER_PROGRESS**: Aggregates performance metrics per user-problem pair
- **AI_INTERACTION**: Logs all AI assistance interactions

**Relationships:**
| Relationship | Cardinality | Description |
|--------------|-------------|-------------|
| USER → SUBMISSION | 1:N | One user can submit multiple solutions |
| USER → LEARNING_SESSION | 1:N | One user can have multiple sessions |
| USER → USER_PROGRESS | 1:N | One user tracks progress on multiple problems |
| USER → AI_INTERACTION | 1:N | One user generates multiple AI interactions |
| PROBLEM → SUBMISSION | 1:N | One problem receives multiple submissions |
| PROBLEM → LEARNING_SESSION | 1:N | One problem can be solved in multiple sessions |
| PROBLEM → USER_PROGRESS | 1:N | One problem tracked across multiple users |
| LEARNING_SESSION → SUBMISSION | 1:N | One session contains multiple submissions |
| LEARNING_SESSION → AI_INTERACTION | 1:N | One session logs multiple AI interactions |

---

## 2. API Request/Response Schemas (Pydantic)

### User Management Schemas

```mermaid
classDiagram
    direction TB
    
    class UserBase {
        +email: EmailStr
        +username: str
        +full_name: str | None
    }

    class UserCreate {
        +password: str
        --
        +validate_password()* str
    }

    class UserLogin {
        +email: EmailStr
        +username: str
    }

    class UserResponse {
        +id: int
        +is_active: bool
        +created_at: datetime
        +Config
        +from_attributes: bool
    }

    class Token {
        +access_token: str
        +token_type: str
    }

    UserCreate --|> UserBase
    UserResponse --|> UserBase
```

### Problem Management Schemas

```mermaid
classDiagram
    direction TB
    
    class DifficultyLevel {
        <<enumeration>>
        BEGINNER
        INTERMEDIATE
        ADVANCED
    }

    class ProblemBase {
        +title: str
        +description: str
        +difficulty: DifficultyLevel
        +topic: str
    }

    class ProblemCreate {
        +constraints: Dict | None
        +examples: List[Dict]
        +test_cases: List[Dict]
        +starter_code: str | None
        +solution_template: str | None
        +evaluation_criteria: Dict
        +time_limit: int
        +memory_limit: int
        +hints: List[str] | None
        +learning_objectives: List[str] | None
        +related_concepts: List[str] | None
    }

    class ProblemUpdate {
        +title: str | None
        +description: str | None
        +difficulty: DifficultyLevel | None
        +topic: str | None
        +constraints: Dict | None
        +examples: List[Dict] | None
        +test_cases: List[Dict] | None
        +starter_code: str | None
        +is_active: bool | None
    }

    class ProblemResponse {
        +id: int
        +constraints: Dict | None
        +examples: List[Dict]
        +starter_code: str | None
        +hints: List[str] | None
        +learning_objectives: List[str] | None
        +related_concepts: List[str] | None
        +created_at: datetime
        +Config
        +from_attributes: bool
    }

    class ProblemListResponse {
        +problems: List[ProblemResponse]
        +total: int
        +page: int
        +page_size: int
    }

    ProblemCreate --|> ProblemBase
    ProblemResponse --|> ProblemBase
    ProblemListResponse --> ProblemResponse : contains
```

### Submission & Evaluation Schemas

```mermaid
classDiagram
    direction TB
    
    class SubmissionStatus {
        <<enumeration>>
        PENDING
        CORRECT
        INCORRECT
        PARTIAL
        ERROR
    }

    class SubmissionCreate {
        +problem_id: int
        +code: str
        +language: str
        +session_id: int | None
    }

    class TestCaseResult {
        +test_id: str
        +passed: bool
        +expected: Any
        +actual: Any | None
        +error: str | None
    }

    class AIFeedback {
        +overall_assessment: str
        +correctness_score: float
        +quality_score: float
        +efficiency_score: float
        +strengths: List[str]
        +issues: List[Dict[str, str]]
        +suggestions: List[str]
        +next_steps: List[str]
    }

    class SubmissionResponse {
        +id: int
        +problem_id: int
        +code: str
        +language: str
        +status: SubmissionStatus
        +score: float | None
        +test_results: List[TestCaseResult] | None
        +execution_time: float | None
        +memory_used: float | None
        +ai_feedback: AIFeedback | None
        +submitted_at: datetime
        +evaluated_at: datetime | None
        +Config
        +from_attributes: bool
    }

    SubmissionResponse --> TestCaseResult : contains
    SubmissionResponse --> AIFeedback : includes
    SubmissionResponse --> SubmissionStatus : has_status
```

### Session & Progress Schemas

```mermaid
classDiagram
    direction TB
    
    class SessionCreate {
        +problem_id: int
    }

    class SessionResponse {
        +id: int
        +problem_id: int
        +started_at: datetime
        +completed_at: datetime | None
        +is_completed: bool
        +attempts_count: int
        +time_spent: int | None
        +final_score: float | None
        +Config
        +from_attributes: bool
    }

    class UserProgressResponse {
        +problem_id: int
        +problem_title: str
        +difficulty: str
        +is_completed: bool
        +best_score: float | None
        +attempts: int
        +total_time_spent: int | None
        +completed_at: datetime | None
        +Config
        +from_attributes: bool
    }

    class UserStatistics {
        +total_problems_attempted: int
        +total_problems_completed: int
        +average_score: float
        +total_time_spent: int
        +problems_by_difficulty: Dict[str, int]
        +problems_by_topic: Dict[str, int]
        +recent_activity: List[Dict[str, Any]]
    }
```

### AI Interaction Schemas

```mermaid
classDiagram
    direction TB
    
    class ChatMessage {
        +message: str
        +context: Dict[str, Any] | None
    }

    class ChatResponse {
        +response: str
        +suggestions: List[str] | None
        +related_concepts: List[str] | None
    }

    class HintRequest {
        +problem_id: int
        +session_id: int
        +current_code: str | None
        +hint_level: int
    }

    class HintResponse {
        +hint: str
        +hint_level: int
        +remaining_hints: int
    }

    class CodeExecutionRequest {
        +code: str
        +language: str
        +test_input: str | None
        +timeout: int
    }

    class CodeExecutionResult {
        +success: bool
        +output: str | None
        +error: str | None
        +execution_time: float | None
        +memory_used: float | None
    }

    ChatResponse --> ChatMessage : responds_to
    HintResponse --> HintRequest : answers
    CodeExecutionResult --> CodeExecutionRequest : executes
```

### Problem Generation Schemas

```mermaid
classDiagram
    direction TB
    
    class ProblemGenerationRequest {
        +description: str
        +difficulty: str
        +topic: str
        +additional_requirements: str | None
        +num_test_cases: int
        +num_examples: int
        +num_hints: int
    }

    class ProblemRefinementRequest {
        +problem_id: int
        +refinement_request: str
    }

    class ProblemGenerationResponse {
        +success: bool
        +message: str
        +problem_id: int | None
        +problem: Dict[str, Any] | None
        +preview: Dict[str, Any] | None
    }

    class GeneratedProblemPreview {
        +title: str
        +description: str
        +difficulty: str
        +topic: str
        +num_test_cases: int
        +num_examples: int
        +num_hints: int
        +starter_code: str
    }

    ProblemGenerationResponse --> GeneratedProblemPreview : contains
```

---

## 3. Service Layer Classes

### AI Service

```mermaid
classDiagram
    direction TB
    
    class AIService {
        -model: str
        -api_key: str
        __init__()
        --
        -_extract_json(text: str) Dict*
        -_generate_text(prompt: str, system_prompt: str | None, max_tokens: int | None, temperature: float | None) str*
        -_safe_error_message(err: Exception) str
        --
        +evaluate_code(code: str, problem_description: str, test_results: List, evaluation_criteria: Dict, language: str) AIFeedback*
        +provide_hint(problem_description: str, current_code: str | None, hint_level: int, previous_hints: List[str]) str*
        +answer_question(question: str, context: Dict, conversation_history: List) Dict*
    }

    class AIFeedback {
        +overall_assessment: str
        +correctness_score: float
        +quality_score: float
        +efficiency_score: float
        +strengths: List[str]
        +issues: List[Dict]
        +suggestions: List[str]
        +next_steps: List[str]
    }

    AIService --> AIFeedback : produces
```

### Code Executor Service

```mermaid
classDiagram
    direction TB
    
    class CodeExecutor {
        -timeout: int
        -max_memory: int
        __init__()
        --
        -_get_python_command() List[str]
        -_prepare_test_code(code: str, test_input: Any, test_case: Dict) str
        -_compare_outputs(actual: str, expected: str) bool
        --
        +execute_python(code: str, test_input: str | None, timeout: int | None) CodeExecutionResult
        +run_test_cases(code: str, test_cases: List[Dict], language: str) Tuple[List[TestCaseResult], float, bool]
    }

    class TestCaseResult {
        +test_id: str
        +passed: bool
        +expected: Any
        +actual: Any | None
        +error: str | None
    }

    class CodeExecutionResult {
        +success: bool
        +output: str | None
        +error: str | None
        +execution_time: float | None
        +memory_used: float | None
    }

    CodeExecutor --> TestCaseResult : returns
    CodeExecutor --> CodeExecutionResult : produces
```

### Problem Generator Service

```mermaid
classDiagram
    direction TB
    
    class ProblemGeneratorService {
        -model: str
        -api_key: str
        __init__()
        --
        -_generate_text(prompt: str, max_tokens: int, temperature: float) str*
        --
        +generate_problem(description: str, difficulty: str, topic: str, additional_requirements: str | None, num_test_cases: int, num_examples: int, num_hints: int) Dict*
        +refine_problem(existing_problem: Dict, refinement_request: str) Dict*
        +generate_test_cases(problem_description: str, function_signature: str, num_cases: int) List[Dict]*
        +suggest_problem_ideas(topic: str, difficulty: str, num_suggestions: int) List[Dict]*
    }
```

### Configuration Service

```mermaid
classDiagram
    direction TB
    
    class Settings {
        +PROJECT_NAME: str
        +VERSION: str
        +API_V1_PREFIX: str
        +SECRET_KEY: str
        +ALGORITHM: str
        +ACCESS_TOKEN_EXPIRE_MINUTES: int
        +ALLOWED_ORIGINS: str
        --
        +DATABASE_URL: str
        +GEMINI_API_KEY: str
        +LLM_MODEL: str
        +LLM_MAX_TOKENS: int
        +LLM_TEMPERATURE: float
        --
        +CODE_EXECUTION_TIMEOUT: int
        +MAX_CODE_LENGTH: int
        +DIFFICULTY_LEVELS: List[str]
        +TOPICS: List[str]
        --
        +allow_origins_list: List[str]
        +ensure_async_database_url(value: str) str*
    }
```

---

## 4. Complete System Architecture Diagram

```mermaid
graph TB
    subgraph API["API Layer"]
        UA[User Auth Endpoints]
        PA[Problem Endpoints]
        SA[Submission Endpoints]
        AA[AI Assistance Endpoints]
    end
    
    subgraph Services["Service Layer"]
        AIS[AIService]
        CES[CodeExecutor]
        PGS[ProblemGeneratorService]
    end
    
    subgraph Models["Data Layer"]
        DB[(PostgreSQL)]
        Cache[(Redis)]
    end
    
    subgraph External["External Services"]
        GEMINI["Google Gemini API"]
    end
    
    UA --> DB
    PA --> DB
    SA --> Services
    AA --> Services
    
    AIS --> GEMINI
    PGS --> GEMINI
    CES --> Cache
    
    Services --> DB
    
    style API fill:#e1f5ff
    style Services fill:#f3e5f5
    style Models fill:#e8f5e9
    style External fill:#fff3e0
```

---

## Symbol Legend

### Visibility Modifiers
| Symbol | Meaning |
|--------|---------|
| `+` | Public (accessible from outside) |
| `-` | Private (internal only) |
| `#` | Protected (accessible by inheritance) |

### Method Notation
| Symbol | Meaning |
|--------|---------|
| `*` (asterisk) | Async method (coroutine) |
| `()` | Method signature with parameters and return type |
| `--` | Separator between attributes and methods |

### Type Notation
| Pattern | Meaning |
|---------|---------|
| `Type | None` | Optional type (nullable) |
| `List[T]` | List of elements of type T |
| `Dict[K, V]` | Dictionary with key type K, value type V |
| `Tuple[T1, T2]` | Tuple with specific element types |
| `Any` | Any type (flexible) |

### Relationship Types
| Arrow | Meaning |
|-------|---------|
| `-->` | Dependency/Uses (one-way) |
| `--|>` | Inheritance/Extends |
| `"1"` | One-to-one relationship |
| `"*"` | One-to-many relationship |

---

## Key Design Patterns

### MVC-like Architecture
- **Models**: SQLAlchemy ORM classes define database schema
- **Schemas**: Pydantic models handle validation and serialization
- **Services**: Business logic and external integrations

### API Request/Response Flow
1. Client sends request with Pydantic schema
2. FastAPI validates and deserializes
3. Service processes business logic
4. Response serialized back through Pydantic schema
5. Returned as JSON to client

### Database Relationships
- **User** is the central entity
- **Problem** contains educational content
- **Submission** links User to Problem with evaluation results
- **LearningSession** tracks user's problem-solving journey
- **UserProgress** aggregates performance metrics
- **AIInteraction** logs AI assistance usage

---

## Source Files Reference

| Component | File |
|-----------|------|
| Database Models | `Backend/app/models/models.py` |
| User Schemas | `Backend/app/schemas/schemas.py` |
| Problem Schemas | `Backend/app/schemas/schemas.py` |
| Problem Generation | `Backend/app/schemas/problem_generation.py` |
| AI Service | `Backend/app/services/ai_service.py` |
| Code Executor | `Backend/app/services/code_executor.py` |
| Problem Generator | `Backend/app/services/problem_generator.py` |
| Configuration | `Backend/app/core/config.py` |
