---
inclusion: always
---

# Python Learning Project - Development Guidelines

## Project Overview
This is a Python learning repository focused on LeetCode problem solving and algorithm practice. The codebase contains solutions to algorithmic problems organized by topic.

## Code Style & Conventions

### LeetCode Solution Files
- **Naming**: Files follow the pattern `Leetcode_<problem_number>.py` (e.g., `Leetcode_1.py`)
- **Structure**: Each solution file contains a `Solution` class with the required method(s)
- **Method Naming**: Use camelCase method names to match LeetCode's interface (e.g., `twoSum`, `threeSum`)
- **Type Hints**: Include Python type hints for function parameters and return values
- **Imports**: Use `from typing import List, Dict, Set, Tuple, Optional` as needed

### Python Standards
- **Line Length**: Maximum 127 characters per line (configured in `.pylintrc`)
- **Indentation**: 4 spaces (no tabs)
- **String Quotes**: Use double quotes for docstrings, single quotes for regular strings
- **Imports**: Group imports in this order:
  1. Standard library imports
  2. Third-party imports
  3. Local application imports

### Pylint Configuration
- The `.pylintrc` file disables many stylistic warnings specific to LeetCode solutions
- Focus on correctness checks over style compliance for algorithm practice files
- For non-LeetCode files, follow standard Python style guidelines

## Architecture Patterns

### LeetCode Solutions
1. Each solution should be self-contained in its file
2. Use the standard `Solution` class pattern required by LeetCode
3. Include test cases at the bottom of the file when appropriate
4. Focus on algorithm correctness and performance optimization

### Testing Strategy
- Test files are located in the `Tests/` directory
- Use pytest for running tests
- Follow naming convention: `test_leetcode_<problem_number>.py`
- Include edge cases and typical inputs in test suites

### Project Structure
- **Leetcode-sln/**: Primary solution files organized by topic (array, string, tree, etc.)
- **Leetcode/**: Additional solution files or experimental code
- **Tests/**: Test files for verifying solutions
- **docs/**: Documentation and study materials
- **flask-tutorial/**: Web development learning materials

## Development Workflow

### Running Tests
```bash
pytest
```

### Linting
```bash
# Basic syntax checking
flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics

# Style warnings (non-blocking)
flake8 . --count --exit-zero --max-complexity=10 --max-line-length=127 --statistics
```

### CI/CD
- GitHub Actions workflow runs tests and linting on push/pull request
- Supports Python 3.9, 3.10, and 3.11
- Automatic dependency installation if `requirements.txt` exists

## Best Practices

### For AI Assistants
1. **When adding new LeetCode solutions**:
   - Follow existing naming and structure patterns
   - Include type hints for clarity
   - Add a simple test case at the bottom when appropriate

2. **When modifying existing code**:
   - Maintain backward compatibility with LeetCode's interface
   - Don't break existing test cases
   - Update tests if algorithm behavior changes

3. **When creating non-LeetCode Python code**:
   - Follow standard Python best practices
   - Include docstrings for functions and classes
   - Add appropriate error handling

### Performance Considerations
- LeetCode solutions should optimize for time and space complexity
- Use appropriate data structures (hash maps, heaps, trees, etc.)
- Consider edge cases (empty inputs, large inputs, etc.)

## Common Pitfalls to Avoid
- Don't over-engineer simple LeetCode solutions
- Avoid modifying the `Solution` class interface
- Don't commit large data files or temporary files
- Keep test data minimal and focused
