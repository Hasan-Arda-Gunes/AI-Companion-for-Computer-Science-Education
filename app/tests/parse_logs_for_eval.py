import json
import re
import glob
import os

def parse_benchmark_logs():
    # 1. Find the most recently generated log file
    log_files = glob.glob("test_run_log_*.txt")
    if not log_files:
        print("Error: No test_run_log_*.txt files found in the current directory.")
        return

    latest_log = max(log_files, key=os.path.getctime)
    print(f"Reading logs from: {latest_log}")

    with open(latest_log, 'r', encoding='utf-8') as f:
        content = f.read()

    # 2. Split the file using the custom separator
    chunks = re.split(r'---\s*(.*?)\s*\[(.*?)\]\s*---', content)

    problems_map = {}
    chat_evaluations = []
    submission_evaluations = []
    hint_evaluations = []

    for i in range(1, len(chunks), 3):
        action = chunks[i].strip()
        data_str = chunks[i+2].strip()

        if not data_str:
            continue

        try:
            log_data = json.loads(data_str)
        except json.JSONDecodeError:
            continue

        # 3. Track problem definitions
        if action.startswith("Create Problem"):
            if 'response' in log_data:
                try:
                    api_resp = json.loads(log_data['response'])
                    prob_id = api_resp.get('id')
                    problems_map[prob_id] = {
                        'title': api_resp.get('title', ''),
                        'description': api_resp.get('description', '')
                    }
                except json.JSONDecodeError:
                    pass

        # 4. Extract Chat Tests (For Solution Leakage)
        elif action.startswith("Chat Test:"):
            tactic_name = action.replace("Chat Test:", "").strip()
            request_payload = log_data.get('request', {})
            prob_id = request_payload.get('problem_id')

            raw_ai_response = log_data.get('response', '{}')
            try:
                ai_resp_json = json.loads(raw_ai_response)
                actual_ai_text = ai_resp_json.get('response', raw_ai_response)
            except json.JSONDecodeError:
                actual_ai_text = raw_ai_response

            if prob_id in problems_map:
                chat_evaluations.append({
                    "test_category": "Chat Leakage Test",
                    "tactic": tactic_name,
                    "problem_context": problems_map[prob_id],
                    "student_input": {
                        "prompt": request_payload.get('message', ''),
                        "current_code": request_payload.get('context', {}).get('current_code', '')
                    },
                    "ai_mentor_response": actual_ai_text
                })

        # 5. Extract Code Submissions (For Optimization & Hint Specificity)
        elif action.startswith("Evaluation Result"):
            # Extract the variant name (e.g., "Inefficient Solution") from the action string
            variant_match = re.search(r'\((.*?)\)', action)
            variant_name = variant_match.group(1) if variant_match else "Unknown Variant"
            
            prob_id = log_data.get('problem_id')
            
            if prob_id in problems_map:
                submission_evaluations.append({
                    "test_category": "Code Evaluation",
                    "code_variant": variant_name,
                    "problem_context": problems_map[prob_id],
                    "student_input": {
                        "submitted_code": log_data.get('code', '')
                    },
                    # The backend's automated evaluation metrics
                    "execution_status": log_data.get('status', ''),
                    "execution_score": log_data.get('score', 0),
                    # The AI Mentor's specific feedback object
                    "ai_mentor_feedback": log_data.get('ai_feedback', {})
                })
        # Extract Dedicated Hints (For Hint Specificity)
        elif action == "Hint Endpoint Test":
            request_payload = log_data.get('request', {})
            prob_id = request_payload.get('problem_id')
            
            raw_ai_response = log_data.get('response', '{}')
            try:
                ai_resp_json = json.loads(raw_ai_response)
                # The API returns the text in the "hint" key
                actual_hint_text = ai_resp_json.get('hint', raw_ai_response)
            except json.JSONDecodeError:
                actual_hint_text = raw_ai_response

            if prob_id in problems_map:
                # Add this to a new array called hint_evaluations
                hint_evaluations.append({
                    "test_category": "Dedicated Hint Request",
                    "problem_context": problems_map[prob_id],
                    "student_input": {
                        "current_code": request_payload.get('current_code', '')
                    },
                    "ai_mentor_hint": actual_hint_text
                })

    # 6. Save the categorized data to a single JSON file
    final_dataset = {
        "chat_tests": chat_evaluations,
        "submission_tests": submission_evaluations,
        "hint_tests": hint_evaluations
    }

    output_filename = "llm_judge_payloads.json"
    with open(output_filename, "w", encoding="utf-8") as f:
        json.dump(final_dataset, f, indent=2, ensure_ascii=False)

    print(f"\nParsing complete!")
    print(f"Extracted {len(chat_evaluations)} Chat Tests.")
    print(f"Extracted {len(submission_evaluations)} Code Submission Tests.")
    print(f"Data saved to: {output_filename}")

if __name__ == "__main__":
    parse_benchmark_logs()