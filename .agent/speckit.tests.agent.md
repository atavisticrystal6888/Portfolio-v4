---
description: Generate comprehensive manual test case files from spec.md user stories and acceptance criteria. Creates organized test files in manual-tests/ directory.
handoffs: 
  - label: Execute Manual Tests
    agent: Auriga.Manual Tester
    prompt: "Test cases generated. Execute manual testing for spec: [SPEC_PATH]"
    send: true
  - label: Create Automated Tests
    agent: Auriga.Quality Guardian
    prompt: "Manual test cases available. Create automated test coverage for: [SPEC_PATH]"
    send: true
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Purpose

Generate **manual test case files** from spec.md, separating detailed QA execution guides from requirements documentation. This keeps spec.md focused on WHAT to build while manual-tests/ contains HOW to verify it.

**Why This Exists**:
- `spec.md` defines requirements and acceptance criteria (WHAT)
- `manual-tests/*.md` contains step-by-step execution guides (HOW TO VERIFY)
- Separation prevents spec bloat while maintaining traceability

---

## 🔵 Skill Usage Visibility

**Always announce skill usage at the start of the task:**

```markdown
**For this task, I'll be using:**
- 📚 `manual-test-case-writer` - Test case structure and MCP verification patterns
- 📚 `story-to-test-cases` - Converting acceptance scenarios to test cases
```

**When handing off:**
```markdown
🤝 Handing off to: `@auriga.manual-tester` - Execute the generated test cases
```

---

## Outline

1. **Setup**: Run `.specify/scripts/bash/check-prerequisites.sh --json` from repo root and parse FEATURE_DIR and AVAILABLE_DOCS list.
   - All paths must be absolute
   - For single quotes in args, use escape syntax

2. **Load Spec Context**:
   - **REQUIRED**: Read `FEATURE_DIR/spec.md` to extract:
     - All User Stories (US1, US2, etc.) with acceptance scenarios
     - Edge Cases & Boundary Testing section
     - Test Data Specification section
     - Key Entities
   - **IF EXISTS**: Read `FEATURE_DIR/quickstart.md` for integration scenarios
   - **IF EXISTS**: Read `FEATURE_DIR/sub-specs/*.md` for additional scenarios

3. **Create Manual Tests Directory**:
   - Create `FEATURE_DIR/manual-tests/` if it doesn't exist
   - Generate `README.md` with test suite overview

4. **Generate Test Case Files**:

   For each User Story in spec.md, create a test case file:

   **File Naming Convention**:
   ```
   TC-001-happy-path.md      # Happy path tests from US1-US6
   TC-002-validation.md      # Input validation and error handling
   TC-003-edge-cases.md      # Boundary conditions from Edge Cases section
   TC-004-[domain].md        # Domain-specific tests (e.g., tarmac, diversion)
   TC-005-performance.md     # Performance verification (if K6 targets in spec)
   TC-006-security.md        # Permission/tenant isolation tests
   ```

   **Test Case File Structure** (following manual-test-case-writer skill):

   ```markdown
   # TC-XXX: [Category Name]

   **Feature**: [Feature Name from spec]
   **Spec Reference**: ../spec.md
   **Priority**: P1 (Critical) | P2 (High) | P3 (Medium)
   **Type**: Happy Path | Validation | Edge Case | Performance | Security
   **Estimated Time**: XX minutes

   ---

   ## Prerequisites

   - [ ] User logged in with role: `[role]`
   - [ ] Permission required: `[permissions]`
   - [ ] Test data setup: [description]
   - [ ] Browser DevTools open (Console + Network tabs)

   ---

   ## Test Cases

   ### TC-XXX-001: [Test Case Name from Acceptance Scenario]

   **Objective**: [What this test verifies]
   **Acceptance Scenario**: US1-AC1 (from spec.md)

   **Preconditions**:
   - [specific state required]

   **Test Steps**:

   | Step | Action | Expected Result | Verification |
   |------|--------|-----------------|--------------|
   | 1 | [action] | [expected] | [how to verify] |
   | 2 | [action] | [expected] | [how to verify] |

   **MCP Verification**:
   ```elixir
   # Backend verification command
   mcp_tidewave_mcp_execute_sql_query(...)
   # Expected: [result]

   # Log verification
   mcp_tidewave_mcp_get_logs(tail: 20, grep: "[pattern]")
   # Expected: [result]
   ```

   **Result**: ⬜ PASS | ⬜ FAIL | ⬜ BLOCKED

   ---

   [Additional test cases...]

   ## Summary

   | Test Case | Status | Issues |
   |-----------|--------|--------|
   | TC-XXX-001 | ⬜ | |
   | TC-XXX-002 | ⬜ | |

   **Overall Status**: ⬜ PASS | ⬜ FAIL
   **Tested By**: 
   **Date Tested**: 
   ```

5. **Generate README.md**:

   Create `FEATURE_DIR/manual-tests/README.md`:

   ```markdown
   # Manual Test Suite: [Feature Name]

   **Spec Reference**: ../spec.md
   **Generated**: [DATE]
   **Total Test Cases**: [count]
   **Estimated Total Time**: [X hours]

   ---

   ## Test Case Index

   | File | Category | Priority | Test Count | Est. Time |
   |------|----------|----------|------------|-----------|
   | TC-001-happy-path.md | Happy Path | P1 | X | Xm |
   | TC-002-validation.md | Validation | P2 | X | Xm |
   | ... | ... | ... | ... | ... |

   ---

   ## Prerequisites

   ### Environment
   - [ ] Dev server running (`mix phx.server`)
   - [ ] Test tenant configured
   - [ ] Test user accounts created

   ### Test Data
   - [ ] [Data requirement 1]
   - [ ] [Data requirement 2]

   ### Tools
   - [ ] Browser DevTools (Console + Network)
   - [ ] Tidewave MCP (for backend verification)

   ---

   ## Execution Order

   1. **P1 (Critical)**: TC-001 (Happy Path)
   2. **P2 (High)**: TC-002 (Validation), TC-003 (Edge Cases)
   3. **P3 (Medium)**: TC-004+

   ---

   ## Traceability Matrix

   | User Story | Test File | Test Cases |
   |------------|-----------|------------|
   | US1 | TC-001-happy-path.md | TC-001-001, TC-001-002 |
   | US2 | TC-001-happy-path.md | TC-001-003 |
   | ... | ... | ... |

   ---

   ## Notes

   - Test cases derived from spec.md acceptance scenarios
   - MCP verification commands embedded for backend validation
   - Update spec.md if test execution reveals requirement gaps
   ```

6. **Map Spec to Tests** - Traceability:

   | Spec Section | Test File Target |
   |--------------|------------------|
   | User Story Acceptance Scenarios | TC-001-happy-path.md |
   | Edge Cases - Boundary | TC-003-edge-cases.md |
   | Edge Cases - Error | TC-002-validation.md |
   | Edge Cases - Exceptional | TC-003-edge-cases.md |
   | Performance Test Data | TC-005-performance.md |
   | Security scenarios (if any) | TC-006-security.md |

7. **Report**: Output:
   - Full path to manual-tests/ directory
   - List of generated test case files with test counts
   - Total estimated execution time
   - Traceability summary (which spec sections mapped to which files)
   - Next steps: suggest `/speckit.tests execute` or handoff to manual-tester agent

## Integration with Speckit Workflow

```
/speckit.specify  → Creates spec.md with acceptance scenarios & test data
        ↓
/speckit.plan     → Creates plan.md with technical approach
        ↓
/speckit.tasks    → Creates tasks.md with implementation checklist
        ↓
/speckit.checklist → Creates checklists/ for requirements validation
        ↓
/speckit.tests    → NEW: Creates manual-tests/ from spec (this agent)
        ↓
/speckit.implement → Implements tasks
        ↓
@manual-tester    → Executes manual-tests/ files
```

## User Arguments

- **No arguments**: Generate all test files from spec
- **`--priority P1`**: Generate only P1 (critical) test cases
- **`--story US1`**: Generate tests for specific user story only
- **`--update`**: Update existing test files with new spec changes
- **`--dry-run`**: Show what would be generated without creating files

## Example Usage

```
/speckit.tests
```
Generates full test suite from spec.md

```
/speckit.tests --priority P1
```
Generates only critical path tests

```
/speckit.tests --story US2
```
Generates tests for User Story 2 only

---

## Skills Used

- **manual-test-case-writer**: Test case format and MCP verification patterns
- **story-to-test-cases**: Acceptance scenario to test case conversion

## Handoffs

- **auriga.manual-tester**: Execute the generated test cases
- **auriga.quality-guardian**: Create automated test coverage