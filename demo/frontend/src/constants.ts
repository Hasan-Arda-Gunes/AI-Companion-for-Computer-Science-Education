import type { Question } from './types';

// Hardcoded questions for the demo
export const QUESTIONS: Question[] = [
  {
    id: 'easy-array-1',
    title: 'Two Sum',
    description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

Example:
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].`,
    difficulty: 'easy',
    subject: 'array',
    starterCode: `def two_sum(nums, target):
    # Write your solution here
    pass
`,
    testCases: [
      {
        input: '[2,7,11,15], 9',
        expectedOutput: '[0,1]',
        description: 'Basic case'
      },
      {
        input: '[3,2,4], 6',
        expectedOutput: '[1,2]',
        description: 'Numbers not in order'
      }
    ]
  },
  {
    id: 'easy-string-1',
    title: 'Valid Palindrome',
    description: `A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.

Given a string s, return true if it is a palindrome, or false otherwise.

Example:
Input: s = "A man, a plan, a canal: Panama"
Output: true
Explanation: "amanaplanacanalpanama" is a palindrome.`,
    difficulty: 'easy',
    subject: 'string',
    starterCode: `def is_palindrome(s):
    # Write your solution here
    pass
`,
    testCases: [
      {
        input: '"A man, a plan, a canal: Panama"',
        expectedOutput: 'true'
      },
      {
        input: '"race a car"',
        expectedOutput: 'false'
      }
    ]
  },
  {
    id: 'medium-sorting-1',
    title: 'Sort Colors',
    description: `Given an array nums with n objects colored red, white, or blue, sort them in-place so that objects of the same color are adjacent, with the colors in the order red, white, and blue.

We will use the integers 0, 1, and 2 to represent the color red, white, and blue, respectively.

You must solve this problem without using the library's sort function.

Example:
Input: nums = [2,0,2,1,1,0]
Output: [0,0,1,1,2,2]`,
    difficulty: 'medium',
    subject: 'sorting',
    starterCode: `def sort_colors(nums):
    # Write your solution here
    # Hint: Use the Dutch National Flag algorithm
    pass
`,
    testCases: [
      {
        input: '[2,0,2,1,1,0]',
        expectedOutput: '[0,0,1,1,2,2]'
      },
      {
        input: '[2,0,1]',
        expectedOutput: '[0,1,2]'
      }
    ]
  },
  {
    id: 'medium-hash-1',
    title: 'Group Anagrams',
    description: `Given an array of strings strs, group the anagrams together. You can return the answer in any order.

An Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.

Example:
Input: strs = ["eat","tea","tan","ate","nat","bat"]
Output: [["bat"],["nat","tan"],["ate","eat","tea"]]`,
    difficulty: 'medium',
    subject: 'hash',
    starterCode: `def group_anagrams(strs):
    # Write your solution here
    # Hint: Use a dictionary to group anagrams
    pass
`,
    testCases: [
      {
        input: '["eat","tea","tan","ate","nat","bat"]',
        expectedOutput: '[["bat"],["nat","tan"],["ate","eat","tea"]]'
      }
    ]
  },
  {
    id: 'hard-graph-1',
    title: 'Course Schedule II',
    description: `There are a total of numCourses courses you have to take, labeled from 0 to numCourses - 1. You are given an array prerequisites where prerequisites[i] = [ai, bi] indicates that you must take course bi first if you want to take course ai.

Return the ordering of courses you should take to finish all courses. If there are many valid answers, return any of them. If it is impossible to finish all courses, return an empty array.

Example:
Input: numCourses = 4, prerequisites = [[1,0],[2,0],[3,1],[3,2]]
Output: [0,2,1,3] or [0,1,2,3]`,
    difficulty: 'hard',
    subject: 'graph',
    starterCode: `def find_order(num_courses, prerequisites):
    # Write your solution here
    # Hint: Use topological sort (Kahn's algorithm or DFS)
    pass
`,
    testCases: [
      {
        input: '4, [[1,0],[2,0],[3,1],[3,2]]',
        expectedOutput: '[0,2,1,3]',
        description: 'Valid ordering exists'
      },
      {
        input: '2, [[1,0],[0,1]]',
        expectedOutput: '[]',
        description: 'Circular dependency'
      }
    ]
  },
  {
    id: 'easy-sorting-1',
    title: 'Merge Sorted Array',
    description: `You are given two integer arrays nums1 and nums2, sorted in non-decreasing order, and two integers m and n, representing the number of elements in nums1 and nums2 respectively.

Merge nums1 and nums2 into a single array sorted in non-decreasing order.

The final sorted array should be stored inside the array nums1. To accommodate this, nums1 has a length of m + n.

Example:
Input: nums1 = [1,2,3,0,0,0], m = 3, nums2 = [2,5,6], n = 3
Output: [1,2,2,3,5,6]`,
    difficulty: 'easy',
    subject: 'sorting',
    starterCode: `def merge(nums1, m, nums2, n):
    # Write your solution here
    pass
`,
    testCases: [
      {
        input: '[1,2,3,0,0,0], 3, [2,5,6], 3',
        expectedOutput: '[1,2,2,3,5,6]'
      }
    ]
  },
  {
    id: 'easy-hash-1',
    title: 'Contains Duplicate',
    description: `Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.

Example:
Input: nums = [1,2,3,1]
Output: true

Example 2:
Input: nums = [1,2,3,4]
Output: false`,
    difficulty: 'easy',
    subject: 'hash',
    starterCode: `def contains_duplicate(nums):
    # Write your solution here
    # Hint: Use a set or dictionary
    pass
`,
    testCases: [
      {
        input: '[1,2,3,1]',
        expectedOutput: 'true',
        description: 'Has duplicate'
      },
      {
        input: '[1,2,3,4]',
        expectedOutput: 'false',
        description: 'No duplicates'
      }
    ]
  },
  {
    id: 'easy-graph-1',
    title: 'Find Center of Star Graph',
    description: `There is an undirected star graph consisting of n nodes labeled from 1 to n. A star graph is a graph where there is one center node and exactly n - 1 edges that connect the center node with every other node.

You are given a 2D integer array edges where each edges[i] = [ui, vi] indicates that there is an edge between the nodes ui and vi. Return the center of the given star graph.

Example:
Input: edges = [[1,2],[2,3],[4,2]]
Output: 2
Explanation: Node 2 is connected to every other node.`,
    difficulty: 'easy',
    subject: 'graph',
    starterCode: `def find_center(edges):
    # Write your solution here
    # Hint: The center appears in all edges
    pass
`,
    testCases: [
      {
        input: '[[1,2],[2,3],[4,2]]',
        expectedOutput: '2'
      },
      {
        input: '[[1,2],[5,1],[1,3],[1,4]]',
        expectedOutput: '1'
      }
    ]
  },
  {
    id: 'medium-array-1',
    title: 'Product of Array Except Self',
    description: `Given an integer array nums, return an array answer such that answer[i] is equal to the product of all the elements of nums except nums[i].

You must write an algorithm that runs in O(n) time and without using the division operation.

Example:
Input: nums = [1,2,3,4]
Output: [24,12,8,6]

Example 2:
Input: nums = [-1,1,0,-3,3]
Output: [0,0,9,0,0]`,
    difficulty: 'medium',
    subject: 'array',
    starterCode: `def product_except_self(nums):
    # Write your solution here
    # Hint: Use prefix and suffix products
    pass
`,
    testCases: [
      {
        input: '[1,2,3,4]',
        expectedOutput: '[24,12,8,6]'
      },
      {
        input: '[-1,1,0,-3,3]',
        expectedOutput: '[0,0,9,0,0]'
      }
    ]
  },
  {
    id: 'medium-string-1',
    title: 'Longest Substring Without Repeating Characters',
    description: `Given a string s, find the length of the longest substring without repeating characters.

Example:
Input: s = "abcabcbb"
Output: 3
Explanation: The answer is "abc", with the length of 3.

Example 2:
Input: s = "bbbbb"
Output: 1
Explanation: The answer is "b", with the length of 1.`,
    difficulty: 'medium',
    subject: 'string',
    starterCode: `def length_of_longest_substring(s):
    # Write your solution here
    # Hint: Use sliding window technique
    pass
`,
    testCases: [
      {
        input: '"abcabcbb"',
        expectedOutput: '3',
        description: 'Multiple repeating patterns'
      },
      {
        input: '"bbbbb"',
        expectedOutput: '1',
        description: 'All same characters'
      }
    ]
  },
  {
    id: 'medium-graph-1',
    title: 'Number of Islands',
    description: `Given an m x n 2D binary grid which represents a map of '1's (land) and '0's (water), return the number of islands.

An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. You may assume all four edges of the grid are all surrounded by water.

Example:
Input: grid = [
  ["1","1","0","0","0"],
  ["1","1","0","0","0"],
  ["0","0","1","0","0"],
  ["0","0","0","1","1"]
]
Output: 3`,
    difficulty: 'medium',
    subject: 'graph',
    starterCode: `def num_islands(grid):
    # Write your solution here
    # Hint: Use DFS or BFS to explore each island
    pass
`,
    testCases: [
      {
        input: '[["1","1","0"],["1","1","0"],["0","0","1"]]',
        expectedOutput: '2'
      }
    ]
  },
  {
    id: 'hard-array-1',
    title: 'Trapping Rain Water',
    description: `Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.

Example:
Input: height = [0,1,0,2,1,0,1,3,2,1,2,1]
Output: 6
Explanation: The above elevation map (black bars) represents [0,1,0,2,1,0,1,3,2,1,2,1]. In this case, 6 units of rain water (blue section) are being trapped.`,
    difficulty: 'hard',
    subject: 'array',
    starterCode: `def trap(height):
    # Write your solution here
    # Hint: Use two pointers or stack
    pass
`,
    testCases: [
      {
        input: '[0,1,0,2,1,0,1,3,2,1,2,1]',
        expectedOutput: '6'
      },
      {
        input: '[4,2,0,3,2,5]',
        expectedOutput: '9'
      }
    ]
  },
  {
    id: 'hard-string-1',
    title: 'Minimum Window Substring',
    description: `Given two strings s and t, return the minimum window substring of s such that every character in t (including duplicates) is included in the window. If there is no such substring, return the empty string "".

Example:
Input: s = "ADOBECODEBANC", t = "ABC"
Output: "BANC"
Explanation: The minimum window substring "BANC" includes 'A', 'B', and 'C' from string t.`,
    difficulty: 'hard',
    subject: 'string',
    starterCode: `def min_window(s, t):
    # Write your solution here
    # Hint: Use sliding window with hash map
    pass
`,
    testCases: [
      {
        input: '"ADOBECODEBANC", "ABC"',
        expectedOutput: '"BANC"'
      },
      {
        input: '"a", "a"',
        expectedOutput: '"a"'
      }
    ]
  },
  {
    id: 'hard-sorting-1',
    title: 'Merge K Sorted Lists',
    description: `You are given an array of k linked-lists lists, each linked-list is sorted in ascending order.

Merge all the linked-lists into one sorted linked-list and return it.

Example:
Input: lists = [[1,4,5],[1,3,4],[2,6]]
Output: [1,1,2,3,4,4,5,6]
Explanation: The linked-lists are:
[
  1->4->5,
  1->3->4,
  2->6
]
merging them into one sorted list:
1->1->2->3->4->4->5->6`,
    difficulty: 'hard',
    subject: 'sorting',
    starterCode: `def merge_k_lists(lists):
    # Write your solution here
    # Hint: Use heap or divide and conquer
    pass
`,
    testCases: [
      {
        input: '[[1,4,5],[1,3,4],[2,6]]',
        expectedOutput: '[1,1,2,3,4,4,5,6]'
      }
    ]
  },
  {
    id: 'hard-hash-1',
    title: 'Longest Consecutive Sequence',
    description: `Given an unsorted array of integers nums, return the length of the longest consecutive elements sequence.

You must write an algorithm that runs in O(n) time.

Example:
Input: nums = [100,4,200,1,3,2]
Output: 4
Explanation: The longest consecutive elements sequence is [1, 2, 3, 4]. Therefore its length is 4.`,
    difficulty: 'hard',
    subject: 'hash',
    starterCode: `def longest_consecutive(nums):
    # Write your solution here
    # Hint: Use a set for O(1) lookups
    pass
`,
    testCases: [
      {
        input: '[100,4,200,1,3,2]',
        expectedOutput: '4',
        description: 'Sequence: [1,2,3,4]'
      },
      {
        input: '[0,3,7,2,5,8,4,6,0,1]',
        expectedOutput: '9',
        description: 'Sequence: [0,1,2,3,4,5,6,7,8]'
      }
    ]
  }
];

export function getQuestionByFilters(difficulty?: string, subject?: string): Question | null {
  const filtered = QUESTIONS.filter(q => 
    (!difficulty || q.difficulty === difficulty) &&
    (!subject || q.subject === subject)
  );
  
  if (filtered.length === 0) {
    return QUESTIONS[0]; // Return default question
  }
  
  // Return random question from filtered list
  return filtered[Math.floor(Math.random() * filtered.length)];
}
