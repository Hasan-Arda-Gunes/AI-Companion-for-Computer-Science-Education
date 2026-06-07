import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np

# Set professional styling for academic posters
sns.set_theme(style="whitegrid", context="paper", font_scale=1.5)

def plot_hint_specificity():
    # Data converted to raw counts
    categories = ['1\n(Generic)', '2\n(Vague)', '3\n(Optimal\nSocratic)', '4\n(Heavy\nHanded)', '5\n(Direct\nAnswer)']
    counts = [6, 9, 23, 7, 0]
    
    plt.figure(figsize=(8, 6))
    
    # Custom color palette: highlight the optimal score in blue
    colors = ['#ced4da', '#adb5bd', '#4361ee', '#adb5bd', '#ced4da']
    
    bars = plt.bar(categories, counts, color=colors, edgecolor='black', linewidth=1.2)
    
    # Add raw count labels on top of the bars
    for bar in bars:
        height = bar.get_height()
        # Even if the count is 0, we can leave it blank or explicitly write 0
        if height >= 0:
            plt.text(bar.get_x() + bar.get_width()/2., height + 0.5,
                     f'{int(height)}', ha='center', va='bottom', fontweight='bold', fontsize=16)

    plt.title('Hint Specificity Distribution', pad=20, fontweight='bold', fontsize=18)
    plt.ylabel('Number of AI Responses', fontweight='bold')
    plt.ylim(0, 28) # Leave room for top labels based on the max count (23)
    plt.tight_layout()
    
    # Save as both PNG and PDF
    plt.savefig('hint_specificity_counts.png', dpi=300, bbox_inches='tight')
    plt.savefig('hint_specificity_counts.pdf', bbox_inches='tight')
    plt.close()
    print("Saved 'hint_specificity_counts.png' and '.pdf'")

def plot_optimization_validity():
    # Data for the Donut Chart (excluding the 0-count 'Partial' score for a cleaner pie)
    labels = ['1 (Invalid / Missed)', '3 (Valid & Precise)']
    counts = [27, 108]
    
    # Custom color palette: Red for invalid, Green for valid
    colors = ['#ef233c', '#2a9d8f']
    
    fig, ax = plt.subplots(figsize=(7, 6))
    
    # Create the pie chart with a hole in the middle (wedgeprops width creates the donut)
    wedges, texts, autotexts = ax.pie(
        counts, 
        labels=labels, 
        autopct='%1.1f%%', 
        startangle=140, 
        colors=colors,
        wedgeprops=dict(width=0.4, edgecolor='white', linewidth=3),
        textprops={'fontsize': 14, 'fontweight': 'bold'}
    )
    
    # CHANGED: Made the percentage text inside the slices black for visibility
    plt.setp(autotexts, size=15, weight="bold", color="black")
    
    # Add the total N count in the center of the donut
    total_evals = sum(counts)
    ax.text(0, 0, f'n={total_evals}\nEvaluations', ha='center', va='center', fontsize=16, fontweight='bold', color='#333333')

    plt.title('Optimization Validity', pad=20, fontweight='bold', fontsize=18)
    plt.tight_layout()
    
    # Save as both PNG and PDF
    plt.savefig('optimization_validity_donut.png', dpi=300, bbox_inches='tight')
    plt.savefig('optimization_validity_donut.pdf', bbox_inches='tight')
    plt.close()
    print("Saved 'optimization_validity_donut.png' and '.pdf'")

if __name__ == "__main__":
    print("Generating updated high-resolution plots...")
    plot_hint_specificity()
    plot_optimization_validity()
    print("Done!")