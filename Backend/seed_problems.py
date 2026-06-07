"""
Seed database with example programming problems
Run this script to populate the database with sample problems
"""
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.models.models import Problem, DifficultyLevel
from app.db.database import Base


# Example problems
EXAMPLE_PROBLEMS = [
    {
        "title": "Two Sum",
        "description": """Given an array of integers `nums` and an integer `target`, return the indices of the two numbers that add up to `target`.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

**Example:**
- Input: nums = [2,7,11,15], target = 9
- Output: [0,1]
- Explanation: nums[0] + nums[1] = 2 + 7 = 9""",
        "difficulty": DifficultyLevel.BEGINNER,
        "topic": "arrays",
        "constraints": {
            "array_length": {"min": 2, "max": 10000},
            "element_range": {"min": -1000000, "max": 1000000}
        },
        "examples": [
            {"input": [[2, 7, 11, 15], 9], "expected_output": [0, 1]},
            {"input": [[3, 2, 4], 6], "expected_output": [1, 2]}
        ],
        "test_cases": [
            {
                "id": "test_1",
                "input": [[2, 7, 11, 15], 9],
                "expected_output": [0, 1],
                "function_name": "two_sum"
            },
            {
                "id": "test_2",
                "input": [[3, 2, 4], 6],
                "expected_output": [1, 2],
                "function_name": "two_sum"
            },
            {
                "id": "test_3",
                "input": [[3, 3], 6],
                "expected_output": [0, 1],
                "function_name": "two_sum"
            }
        ],
        "starter_code": """def two_sum(nums, target):
    \"\"\"
    Find two numbers that add up to target
    
    Args:
        nums: List of integers
        target: Target sum
    
    Returns:
        List of two indices
    \"\"\"
    # Your code here
    pass
""",
        "evaluation_criteria": {
            "check_correctness": True,
            "check_efficiency": True,
            "check_style": True,
            "expected_time_complexity": "O(n)",
            "expected_space_complexity": "O(n)"
        },
        "hints": [
            "Think about what information you need to store as you iterate through the array.",
            "A hash map (dictionary) can help you check if the complement of the current number exists.",
            "For each number, calculate what other number would sum with it to reach the target."
        ],
        "learning_objectives": [
            "Understand hash map data structure",
            "Learn about the two-pointer technique",
            "Practice array manipulation"
        ],
        "related_concepts": ["hash_maps", "arrays", "time_complexity"]
    },
    {
        "title": "Reverse a Linked List",
        "description": """Given the head of a singly linked list, reverse the list and return the reversed list.

A linked list is represented by a `ListNode` class with attributes `val` (value) and `next` (pointer to next node).

**Example:**
- Input: 1 -> 2 -> 3 -> 4 -> 5
- Output: 5 -> 4 -> 3 -> 2 -> 1""",
        "difficulty": DifficultyLevel.INTERMEDIATE,
        "topic": "linked_lists",
        "constraints": {
            "list_length": {"min": 0, "max": 5000},
            "node_value_range": {"min": -5000, "max": 5000}
        },
        "examples": [
            {"input": [1, 2, 3, 4, 5], "expected_output": [5, 4, 3, 2, 1]},
            {"input": [1, 2], "expected_output": [2, 1]},
            {"input": [], "expected_output": []}
        ],
        "test_cases": [
            {
                "id": "test_1",
                "input": [[1, 2, 3, 4, 5]],
                "expected_output": [5, 4, 3, 2, 1],
                "function_name": "reverse_list"
            },
            {
                "id": "test_2",
                "input": [[1, 2]],
                "expected_output": [2, 1],
                "function_name": "reverse_list"
            },
            {
                "id": "test_3",
                "input": [[]],
                "expected_output": [],
                "function_name": "reverse_list"
            }
        ],
        "starter_code": """class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def reverse_list(head):
    \"\"\"
    Reverse a singly linked list
    
    Args:
        head: Head of the linked list
    
    Returns:
        New head of reversed list
    \"\"\"
    # Your code here
    pass
""",
        "evaluation_criteria": {
            "check_correctness": True,
            "check_efficiency": True,
            "check_style": True,
            "expected_time_complexity": "O(n)",
            "expected_space_complexity": "O(1)"
        },
        "hints": [
            "You need to change the direction of the 'next' pointers.",
            "Keep track of the previous node as you iterate.",
            "Consider what happens to the current node's next pointer - where should it point after reversal?"
        ],
        "learning_objectives": [
            "Understand linked list structure",
            "Master pointer manipulation",
            "Learn iterative list traversal"
        ],
        "related_concepts": ["linked_lists", "pointers", "iteration"]
    },
    {
        "title": "Valid Parentheses",
        "description": """Given a string containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.

**Examples:**
- Input: "()" → Output: true
- Input: "()[]{}" → Output: true
- Input: "(]" → Output: false""",
        "difficulty": DifficultyLevel.BEGINNER,
        "topic": "stacks_and_queues",
        "constraints": {
            "string_length": {"min": 0, "max": 10000}
        },
        "examples": [
            {"input": "()", "expected_output": True},
            {"input": "()[]{}", "expected_output": True},
            {"input": "(]", "expected_output": False}
        ],
        "test_cases": [
            {
                "id": "test_1",
                "input": ["()"],
                "expected_output": True,
                "function_name": "is_valid"
            },
            {
                "id": "test_2",
                "input": ["()[]{}"],
                "expected_output": True,
                "function_name": "is_valid"
            },
            {
                "id": "test_3",
                "input": ["(]"],
                "expected_output": False,
                "function_name": "is_valid"
            },
            {
                "id": "test_4",
                "input": ["{[]}"],
                "expected_output": True,
                "function_name": "is_valid"
            }
        ],
        "starter_code": """def is_valid(s):
    \"\"\"
    Check if parentheses are valid
    
    Args:
        s: String containing parentheses
    
    Returns:
        Boolean indicating if valid
    \"\"\"
    # Your code here
    pass
""",
        "evaluation_criteria": {
            "check_correctness": True,
            "check_efficiency": True,
            "check_style": True,
            "expected_time_complexity": "O(n)",
            "expected_space_complexity": "O(n)"
        },
        "hints": [
            "Think about what data structure naturally handles Last-In-First-Out (LIFO) behavior.",
            "When you see an opening bracket, what should you remember about it?",
            "When you see a closing bracket, it should match the most recent unmatched opening bracket."
        ],
        "learning_objectives": [
            "Understand stack data structure",
            "Learn when to use LIFO behavior",
            "Practice string processing"
        ],
        "related_concepts": ["stacks", "string_processing", "matching_patterns"]
    }
]


async def seed_problems():
    """Seed database with example problems"""
    
    # Create engine and session
    engine = create_async_engine(settings.DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    # Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Add problems
    async with async_session() as session:
        for problem_data in EXAMPLE_PROBLEMS:
            problem = Problem(**problem_data)
            session.add(problem)
        
        await session.commit()
        print(f"✅ Successfully seeded {len(EXAMPLE_PROBLEMS)} problems!")


if __name__ == "__main__":
    asyncio.run(seed_problems())
