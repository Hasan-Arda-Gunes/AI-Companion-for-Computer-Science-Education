"""
Example script: Using AI Problem Generation API

This script demonstrates how to use the AI-powered problem generation endpoints.
"""
import requests
import json
import os

# Configuration
BASE_URL = "http://localhost:8000/api/v1"
TOKEN = os.getenv("AUTH_TOKEN", "your-auth-token-here")  # Get from login

headers = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json"
}


def print_response(title, response):
    """Pretty print API response"""
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}")
    print(json.dumps(response, indent=2))


# Example 1: Generate a complete problem
def example_1_generate_problem():
    """Generate a programming problem from description"""
    
    print("\n🎯 Example 1: Generate a Problem")
    
    data = {
        "description": "Create a problem about finding the maximum sum of a contiguous subarray. This should teach Kadane's algorithm.",
        "difficulty": "intermediate",
        "topic": "arrays",
        "additional_requirements": "Include edge cases for all negative numbers",
        "num_test_cases": 6,
        "num_examples": 3,
        "num_hints": 3
    }
    
    response = requests.post(
        f"{BASE_URL}/problems/generate/",
        headers=headers,
        json=data
    )
    
    if response.status_code == 200:
        result = response.json()
        print_response("Problem Generated Successfully", {
            "problem_id": result["problem_id"],
            "title": result["problem"]["title"],
            "description": result["problem"]["description"][:200] + "...",
            "test_cases_count": len(result["problem"]["test_cases"]),
            "examples_count": len(result["problem"]["examples"])
        })
        return result["problem_id"]
    else:
        print(f"Error: {response.status_code}")
        print(response.text)
        return None


# Example 2: Get problem suggestions
def example_2_get_suggestions():
    """Get AI-generated problem ideas"""
    
    print("\n💡 Example 2: Get Problem Suggestions")
    
    data = {
        "topic": "trees",
        "difficulty": "intermediate",
        "num_suggestions": 5
    }
    
    response = requests.post(
        f"{BASE_URL}/problems/generate/suggestions",
        headers=headers,
        json=data
    )
    
    if response.status_code == 200:
        suggestions = response.json()
        print_response("Problem Suggestions", suggestions)
        return suggestions[0] if suggestions else None
    else:
        print(f"Error: {response.status_code}")
        return None


# Example 3: Create problem from suggestion
def example_3_create_from_suggestion(suggestion):
    """Turn a suggestion into a complete problem"""
    
    if not suggestion:
        print("\n⚠️  Skipping Example 3: No suggestion available")
        return
    
    print("\n🚀 Example 3: Create Problem from Suggestion")
    
    params = {
        "title": suggestion["title"],
        "brief_description": suggestion["brief_description"],
        "difficulty": "intermediate",
        "topic": "trees"
    }
    
    response = requests.post(
        f"{BASE_URL}/problems/generate/from-suggestion",
        headers=headers,
        json=params
    )
    
    if response.status_code == 200:
        result = response.json()
        print_response("Problem Created from Suggestion", {
            "problem_id": result["problem_id"],
            "title": result["problem"]["title"]
        })
        return result["problem_id"]
    else:
        print(f"Error: {response.status_code}")
        return None


# Example 4: Preview before saving
def example_4_preview_mode():
    """Preview a problem without saving to database"""
    
    print("\n👀 Example 4: Preview Mode")
    
    data = {
        "description": "Simple binary search implementation for sorted arrays",
        "difficulty": "beginner",
        "topic": "searching"
    }
    
    # Add save=false to preview only
    response = requests.post(
        f"{BASE_URL}/problems/generate/?save=false",
        headers=headers,
        json=data
    )
    
    if response.status_code == 200:
        result = response.json()
        print_response("Preview (Not Saved)", {
            "preview": result["preview"],
            "would_save": False
        })
    else:
        print(f"Error: {response.status_code}")


# Example 5: Refine an existing problem
def example_5_refine_problem(problem_id):
    """Refine/improve an existing problem"""
    
    if not problem_id:
        print("\n⚠️  Skipping Example 5: No problem ID available")
        return
    
    print("\n✨ Example 5: Refine Problem")
    
    data = {
        "problem_id": problem_id,
        "refinement_request": "Add more detailed explanations and 2 additional edge case test cases"
    }
    
    response = requests.post(
        f"{BASE_URL}/problems/generate/refine",
        headers=headers,
        json=data
    )
    
    if response.status_code == 200:
        result = response.json()
        print_response("Problem Refined", {
            "problem_id": result["problem_id"],
            "message": result["message"]
        })
    else:
        print(f"Error: {response.status_code}")
        print(response.text)


# Example 6: Generate additional test cases
def example_6_generate_test_cases(problem_id):
    """Generate more test cases for existing problem"""
    
    if not problem_id:
        print("\n⚠️  Skipping Example 6: No problem ID available")
        return
    
    print("\n🧪 Example 6: Generate Additional Test Cases")
    
    data = {
        "problem_id": problem_id,
        "num_cases": 3
    }
    
    response = requests.post(
        f"{BASE_URL}/problems/generate/test-cases/{problem_id}",
        headers=headers,
        json=data
    )
    
    if response.status_code == 200:
        result = response.json()
        print_response("Test Cases Generated", {
            "new_cases_count": len(result["new_test_cases"]),
            "total_cases": result["total_test_cases"]
        })
    else:
        print(f"Error: {response.status_code}")


def main():
    """Run all examples"""
    
    print("\n" + "="*60)
    print("  AI PROBLEM GENERATION - EXAMPLES")
    print("="*60)
    print("\nMake sure you:")
    print("1. Have the backend running (python main.py)")
    print("2. Are logged in and have a valid token")
    print("3. Set AUTH_TOKEN environment variable or update TOKEN in this script")
    print("\nStarting examples...\n")
    
    # Run examples
    problem_id = example_1_generate_problem()
    
    suggestion = example_2_get_suggestions()
    suggestion_problem_id = example_3_create_from_suggestion(suggestion)
    
    example_4_preview_mode()
    
    example_5_refine_problem(problem_id)
    
    example_6_generate_test_cases(problem_id)
    
    print("\n" + "="*60)
    print("  ✅ All examples completed!")
    print("="*60)
    print("\nCheck your database or API to see the generated problems.")


if __name__ == "__main__":
    # First, you need to get a token by logging in
    print("\n🔐 Note: You need to login first to get an authentication token.")
    print("Example login:")
    print("""
    response = requests.post(
        f"{BASE_URL}/auth/login",
        json={"email": "your@email.com", "password": "yourpassword"}
    )
    token = response.json()["access_token"]
    """)
    
    # Uncomment to run examples (after setting token)
    # main()
    
    print("\nTo run the examples:")
    print("1. Login and get your token")
    print("2. Set TOKEN variable in this script")
    print("3. Uncomment the main() call")
    print("4. Run: python examples/problem_generation_examples.py")
