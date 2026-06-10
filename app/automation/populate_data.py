import requests
import json
import os

# Configuration
BASE_URL = "http://localhost:8000/api/v1" 
DATASET_FILE = "ai_mentor_benchmark_dataset_revised.json"

def setup_session():
    """Initializes a requests session and handles authentication."""
    session = requests.Session()
    
    # 1. Register Teacher
    teacher_cred = {
        "email": "teacher_evaluator@example.com",
        "username": "teacher_eval",
        "password": "securepassword123",
        "full_name": "Eval Teacher",
        "role": "teacher"
    }
    
    # Attempting registration; handling gracefully if the user already exists (400/409)
    reg_res = session.post(f"{BASE_URL}/auth/register", json=teacher_cred)
    if reg_res.status_code not in [201, 400, 409]:
        print(f"Warning during registration: Status {reg_res.status_code}")
    
    # 2. Login Teacher
    login_cred = {
        "email": teacher_cred["email"],
        "password": teacher_cred["password"]
    }
    login_res = session.post(f"{BASE_URL}/auth/login", json=login_cred)
    
    if login_res.status_code == 200:
        token = login_res.json().get("access_token")
        session.headers.update({"Authorization": f"Bearer {token}"})
        print("Successfully authenticated session.")
    else:
        raise Exception(f"Login failed with status {login_res.status_code}. Response: {login_res.text}")
        
    return session

def populate_data():
    """Main execution loop for populating data into the AI Mentor platform."""
    
    # Load dataset
    if not os.path.exists(DATASET_FILE):
        print(f"Error: {DATASET_FILE} not found.")
        return
        
    with open(DATASET_FILE, "r", encoding="utf-8") as f:
        dataset = json.load(f)

    session = setup_session()
    
    # 3. Create Class (Static naming without structural dynamic timestamps)
    class_payload = {
        "name": "Demo Class",
        "description": "Demo class for demonstration purposes."
    }
    
    class_res = session.post(f"{BASE_URL}/classes/", json=class_payload)
    
    if class_res.status_code != 201:
        raise Exception(f"Failed to create class. Status: {class_res.status_code}. Response: {class_res.text}")
    
    class_id = class_res.json().get("id")
    print(f"Successfully created class with ID: {class_id}")
    
    # 4. Process Problems
    for problem_data in dataset.get("problems", []):
        print(f"Populating Problem: {problem_data['title']}...")
        
        # Explicitly capturing updated format parameters (constraints, starter_code_java)
        prob_payload = {
            "title": problem_data.get("title"),
            "description": problem_data.get("description"),
            "difficulty": problem_data.get("difficulty"),
            "topic": problem_data.get("topic"),
            "class_id": class_id,
            "examples": problem_data.get("examples"),
            "test_cases": problem_data.get("test_cases"),
            # "constraints": problem_data.get("constraints", []),
            "evaluation_criteria": problem_data.get("evaluation_criteria"),
            "starter_code": problem_data.get("starter_code"),
            "starter_code_java": problem_data.get("starter_code_java"),
            "hints": problem_data.get("hints"),
            "learning_objectives": problem_data.get("learning_objectives"),
            "related_concepts": problem_data.get("related_concepts")
        }
        
        prob_res = session.post(f"{BASE_URL}/problems/", json=prob_payload)
        
        if prob_res.status_code == 201:
            problem_id = prob_res.json().get("id")
            print(f"  -> Successfully created problem with ID: {problem_id}")
        else:
            print(f"  -> Error creating problem: Status {prob_res.status_code}. Response: {prob_res.text}")

    print(f"\nData population complete. The Class ID {class_id} and all related problems have been processed.")

if __name__ == "__main__":
    print("Starting data population utility...")
    try:
        populate_data()
        print("\nAll tasks completed successfully.")
    except Exception as e:
        print(f"\nPopulation sequence aborted: {e}")