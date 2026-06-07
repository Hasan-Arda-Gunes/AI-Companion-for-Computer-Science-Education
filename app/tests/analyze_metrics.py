import json
import os
from collections import Counter

def analyze_metric(filename, score_key, metric_name):
    if not os.path.exists(filename):
        print(f"⚠️ Warning: '{filename}' not found. Skipping {metric_name}.\n")
        return

    try:
        with open(filename, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except json.JSONDecodeError as e:
        print(f"❌ Error reading {filename}: Invalid JSON format ({e})")
        return

    print(f"\n{'='*60}")
    print(f"📊 METRIC ANALYSIS: {metric_name.upper()}")
    print(f"{'='*60}")

    overall_scores = []

    # 1. Calculate and display stats for each individual LLM
    for llm_name, results in data.items():
        print(f"\n🤖 Judge: {llm_name}")
        
        # Extract all scores for this specific LLM
        llm_scores = [res[score_key] for res in results if score_key in res]
        
        if not llm_scores:
            print("   No valid scores found for this metric.")
            continue
            
        total = len(llm_scores)
        avg = sum(llm_scores) / total
        counts = Counter(llm_scores)
        
        overall_scores.extend(llm_scores)
        
        print(f"   Total Evaluations : {total}")
        print(f"   Average Score     : {avg:.2f}")
        print("   Score Distribution:")
        
        # Sort the scores (e.g., 1, 2, 3, 4, 5) to display them in order
        for score in sorted(counts.keys()):
            occurrences = counts[score]
            percentage = (occurrences / total) * 100
            print(f"      [{score}] -> {occurrences:2} times ({percentage:5.1f}%)")

    # 2. Calculate and display the combined "Ensemble" stats
    if overall_scores:
        print(f"\n🌍 OVERALL ENSEMBLE CONSENSUS (All Judges Combined)")
        print("-" * 50)
        total_overall = len(overall_scores)
        avg_overall = sum(overall_scores) / total_overall
        counts_overall = Counter(overall_scores)
        
        print(f"   Total Data Points : {total_overall}")
        print(f"   Ensemble Average  : {avg_overall:.2f}")
        
        # Special context note for Solution Leakage (which is binary 0 or 1)
        if score_key == "leakage_score":
            leak_rate = (counts_overall.get(0, 0) / total_overall) * 100
            print(f"   Final Leakage Rate: {leak_rate:.1f}% (Scores of 0)")
            
        print("   Final Score Distribution:")
        for score in sorted(counts_overall.keys()):
            occurrences = counts_overall[score]
            percentage = (occurrences / total_overall) * 100
            
            # Simple ASCII bar chart for quick visual analysis
            bar = "█" * int(percentage / 2) 
            print(f"      [{score}] | {bar:<50} | {occurrences:2} times ({percentage:5.1f}%)")
    print("\n")

if __name__ == "__main__":
    # Ensure these filenames match the actual files in your folder!
    # Format: analyze_metric("filename.json", "JSON_key_to_search", "Display Name")
   
    """
    analyze_metric(
        filename="leakage.json", 
        score_key="leakage_score", 
        metric_name="Solution Leakage Rate"
    )
    """
    
    
    
    analyze_metric(
        filename="llm_judge_response_hints.json", 
        score_key="hint_specificity", 
        metric_name="Hint Specificity Score"
    )
    
    analyze_metric(
        filename="llm_judge_response_opt.json", 
        score_key="optimization_validity", 
        metric_name="Optimization Validity"
    )