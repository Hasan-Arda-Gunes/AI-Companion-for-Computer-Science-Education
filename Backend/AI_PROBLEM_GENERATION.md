# AI-Powered Problem Generation Guide

## 🤖 Overview

The AI Problem Generation feature allows users to create complete, well-structured programming problems using natural language descriptions. Claude AI handles all the complexity of creating test cases, hints, examples, and starter code.

## ✨ Features

1. **Generate Complete Problems** - From a simple description to a full problem with test cases
2. **Get Problem Suggestions** - AI suggests creative problem ideas
3. **Refine Existing Problems** - Improve problems with AI assistance
4. **Generate Test Cases** - Add more test cases to existing problems
5. **Preview Before Saving** - Review AI-generated problems before committing

## 🚀 API Endpoints

### 1. Generate a Problem

**POST** `/api/v1/problems/generate/`

Create a complete programming problem from a description.

**Request:**
```json
{
  "description": "Create a problem about finding the longest palindromic substring in a string",
  "difficulty": "intermediate",
  "topic": "strings",
  "additional_requirements": "Should use dynamic programming approach",
  "num_test_cases": 5,
  "num_examples": 2,
  "num_hints": 3
}
```

**Query Parameters:**
- `save=true` (default) - Save to database
- `save=false` - Preview only, don't save

**Response:**
```json
{
  "success": true,
  "message": "Problem generated and saved successfully!",
  "problem_id": 42,
  "problem": {
    "title": "Longest Palindromic Substring",
    "description": "Given a string s, return the longest palindromic substring...",
    "difficulty": "intermediate",
    "topic": "strings",
    "examples": [...],
    "test_cases": [...],
    "starter_code": "def longest_palindrome(s: str) -> str:\n    pass",
    "hints": [...],
    "learning_objectives": [...],
    "evaluation_criteria": {...}
  }
}
```

### 2. Get Problem Suggestions

**POST** `/api/v1/problems/generate/suggestions`

Get creative problem ideas for inspiration.

**Request:**
```json
{
  "topic": "trees",
  "difficulty": "intermediate",
  "num_suggestions": 5
}
```

**Response:**
```json
[
  {
    "title": "Path Sum with Constraints",
    "brief_description": "Find all paths in a binary tree where the sum equals a target, but no two consecutive nodes can both be odd",
    "key_concept": "Tree traversal with state tracking"
  },
  {
    "title": "Serialize and Deserialize BST",
    "brief_description": "Design an algorithm to serialize and deserialize a binary search tree",
    "key_concept": "Tree serialization and BST properties"
  },
  ...
]
```

### 3. Create from Suggestion

**POST** `/api/v1/problems/generate/from-suggestion`

Turn a problem suggestion into a complete problem.

**Request:**
```json
{
  "title": "Path Sum with Constraints",
  "brief_description": "Find all paths in a binary tree where the sum equals a target",
  "difficulty": "intermediate",
  "topic": "trees"
}
```

### 4. Refine Existing Problem

**POST** `/api/v1/problems/generate/refine`

Improve an existing problem with AI.

**Request:**
```json
{
  "problem_id": 42,
  "refinement_request": "Make the problem harder by adding more edge cases and requiring O(n) time complexity"
}
```

### 5. Generate Additional Test Cases

**POST** `/api/v1/problems/generate/test-cases/{problem_id}`

Add more test cases to an existing problem.

**Request:**
```json
{
  "problem_id": 42,
  "num_cases": 5
}
```

## 💡 Usage Examples

### Example 1: Quick Problem Creation

```bash
curl -X POST "http://localhost:8000/api/v1/problems/generate/" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Create a beginner problem about reversing an array in-place",
    "difficulty": "beginner",
    "topic": "arrays"
  }'
```

### Example 2: Get Inspiration First

```bash
# Step 1: Get suggestions
curl -X POST "http://localhost:8000/api/v1/problems/generate/suggestions" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "graphs",
    "difficulty": "advanced",
    "num_suggestions": 3
  }'

# Step 2: Pick one and create full problem
curl -X POST "http://localhost:8000/api/v1/problems/generate/from-suggestion" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Network Delay Time",
    "brief_description": "Calculate minimum time for signal to reach all nodes",
    "difficulty": "advanced",
    "topic": "graphs"
  }'
```

### Example 3: Preview Before Saving

```bash
curl -X POST "http://localhost:8000/api/v1/problems/generate/?save=false" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Binary search implementation",
    "difficulty": "beginner",
    "topic": "searching"
  }'
```

### Example 4: Refine a Problem

```bash
curl -X POST "http://localhost:8000/api/v1/problems/generate/refine" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "problem_id": 1,
    "refinement_request": "Add more examples and make the description clearer for beginners"
  }'
```

## 🎨 Frontend Integration Examples

### React Example - Problem Generator Form

```jsx
import { useState } from 'react';

function ProblemGenerator() {
  const [formData, setFormData] = useState({
    description: '',
    difficulty: 'beginner',
    topic: 'arrays'
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/v1/problems/generate/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Generate Programming Problem</h2>
      
      <textarea
        placeholder="Describe the problem you want..."
        value={formData.description}
        onChange={(e) => setFormData({...formData, description: e.target.value})}
      />
      
      <select 
        value={formData.difficulty}
        onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
      >
        <option value="beginner">Beginner</option>
        <option value="intermediate">Intermediate</option>
        <option value="advanced">Advanced</option>
      </select>
      
      <select
        value={formData.topic}
        onChange={(e) => setFormData({...formData, topic: e.target.value})}
      >
        <option value="arrays">Arrays</option>
        <option value="strings">Strings</option>
        <option value="trees">Trees</option>
        <option value="graphs">Graphs</option>
      </select>
      
      <button onClick={handleGenerate} disabled={loading}>
        {loading ? 'Generating...' : 'Generate Problem'}
      </button>
      
      {result && (
        <div>
          <h3>{result.problem.title}</h3>
          <p>{result.problem.description}</p>
          <a href={`/problems/${result.problem_id}`}>View Problem</a>
        </div>
      )}
    </div>
  );
}
```

### Vue Example - Problem Suggestions

```vue
<template>
  <div>
    <h2>Get Problem Ideas</h2>
    
    <select v-model="topic">
      <option value="arrays">Arrays</option>
      <option value="linked_lists">Linked Lists</option>
      <option value="trees">Trees</option>
    </select>
    
    <select v-model="difficulty">
      <option value="beginner">Beginner</option>
      <option value="intermediate">Intermediate</option>
      <option value="advanced">Advanced</option>
    </select>
    
    <button @click="getSuggestions">Get Ideas</button>
    
    <div v-if="suggestions.length > 0">
      <h3>Problem Ideas:</h3>
      <div v-for="idea in suggestions" :key="idea.title">
        <h4>{{ idea.title }}</h4>
        <p>{{ idea.brief_description }}</p>
        <button @click="createFromIdea(idea)">Create This Problem</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      topic: 'arrays',
      difficulty: 'beginner',
      suggestions: []
    };
  },
  methods: {
    async getSuggestions() {
      const response = await fetch('http://localhost:8000/api/v1/problems/generate/suggestions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          topic: this.topic,
          difficulty: this.difficulty,
          num_suggestions: 5
        })
      });
      
      this.suggestions = await response.json();
    },
    
    async createFromIdea(idea) {
      const response = await fetch('http://localhost:8000/api/v1/problems/generate/from-suggestion', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: idea.title,
          brief_description: idea.brief_description,
          difficulty: this.difficulty,
          topic: this.topic
        })
      });
      
      const result = await response.json();
      this.$router.push(`/problems/${result.problem_id}`);
    }
  }
};
</script>
```

## 🎯 Best Practices

### 1. Writing Good Descriptions

**Good:**
```
"Create a problem about finding the kth largest element in an unsorted array. 
Should teach students about heap data structures and have O(n log k) complexity."
```

**Bad:**
```
"Array problem"
```

### 2. Use Preview Mode First

Always preview generated problems before saving to ensure quality:
```javascript
const preview = await generateProblem({...data, save: false});
// Review the preview
if (userApprovesPreview) {
  await generateProblem({...data, save: true});
}
```

### 3. Refine Iteratively

Start simple, then refine:
```javascript
// Step 1: Generate basic problem
const problem = await generateProblem({
  description: "Simple array sorting problem",
  difficulty: "beginner",
  topic: "sorting"
});

// Step 2: Refine it
await refineProblem({
  problem_id: problem.problem_id,
  refinement_request: "Add more edge cases for empty arrays and single elements"
});
```

## ⚙️ Configuration

The AI problem generator can be configured in `.env`:

```bash
# AI Configuration
ANTHROPIC_API_KEY=your-api-key
LLM_MODEL=claude-sonnet-4-20250514
LLM_MAX_TOKENS=4000
LLM_TEMPERATURE=0.8  # Higher for more creative problems
```

## 🔒 Permissions

- **Generate Problems**: Any authenticated user
- **Refine Problems**: Only problem creator or admin
- **Generate Test Cases**: Only problem creator or admin

## 💰 Cost Considerations

Each problem generation uses approximately:
- **Tokens**: ~3000-4000 tokens
- **Cost**: ~$0.01-0.02 per problem (varies with model)

To optimize costs:
1. Use preview mode during development
2. Cache common problem patterns
3. Consider rate limiting for production

## 🐛 Error Handling

```javascript
try {
  const problem = await generateProblem(data);
} catch (error) {
  if (error.status === 400) {
    // Invalid input - check description format
  } else if (error.status === 500) {
    // AI generation failed - retry or use default template
  }
}
```

## 📊 Analytics

Track problem generation metrics:
- Number of problems generated per user
- Most popular topics
- Success rate of generated problems
- User refinement patterns

## 🚀 Future Enhancements

Planned features:
- [ ] Multi-language support (Java, C++, JavaScript)
- [ ] Problem difficulty auto-adjustment
- [ ] Collaborative problem editing
- [ ] Problem templates library
- [ ] Bulk problem generation
- [ ] AI-powered problem categorization
