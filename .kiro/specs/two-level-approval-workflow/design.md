# Design Document: Two-Level Approval Workflow

## Overview

The two-level approval workflow system manages a sequential approval process for Builder Visit Form submissions. The system enforces that Level 1 approval must occur before Level 2 can approve, handles rejection scenarios with proper state resets, and maintains an audit trail of all approval actions.

The design addresses a critical bug where Level 2 rejection did not reset Level 1 status, and adds mandatory rejection remarks functionality.

## Architecture

The system follows a client-server architecture with:

- **Frontend (React)**: Manages UI state, user interactions, and displays approval status
- **Backend API**: Handles approval logic, state transitions, and data persistence
- **Database**: Stores builder visit cards with embedded approval metadata

### Key Design Decisions

1. **Embedded Approval Data**: Approval status is stored as a nested object within each builder visit document rather than separate collections, simplifying queries and ensuring atomic updates
2. **Password-Based Authorization**: Simple password verification for approval actions (Level 1 and Level 2 have separate passwords)
3. **State Machine Approach**: Approval transitions follow a strict state machine to prevent invalid state combinations
4. **Optimistic UI Updates**: Frontend immediately reflects approval actions, with rollback on server errors

## Components and Interfaces

### Frontend Components

#### BuilderVisitForm Component (Enhanced)

Existing component with the following enhancements:

**State Management:**
```javascript
// Existing state remains unchanged
const [formData, setFormData] = useState(initialForm);
const [visits, setVisits] = useState([]);
const [editingId, setEditingId] = useState(null);

// New state for rejection remarks modal
const [rejectionModal, setRejectionModal] = useState({
  isOpen: false,
  visitId: null,
  level: null,
  remarks: ""
});
```

**New Functions:**
- `handleRejectWithRemarks(id, level)`: Opens modal for rejection remarks input
- `confirmRejection()`: Validates remarks and submits rejection
- `cancelRejection()`: Closes modal and clears remarks

**Modified Functions:**
- `handleReject(id, level, remarks)`: Now requires remarks parameter
- `handleSubmit(e)`: Already resets approval status on edit (no changes needed)

#### RejectionModal Component (New)

A modal dialog for capturing rejection remarks:

**Props:**
- `isOpen`: Boolean to control visibility
- `onConfirm`: Callback with remarks text
- `onCancel`: Callback to close modal
- `level`: Number (1 or 2) indicating which level is rejecting

**Validation:**
- Remarks must not be empty or whitespace-only
- Minimum length of 10 characters recommended

### Backend API Endpoints

#### PATCH /api/builder-visits/:id/approve

**Request Body:**
```javascript
{
  password: String,  // Level-specific password
  level: Number      // 1 or 2
}
```

**Response:**
```javascript
{
  success: Boolean,
  message: String,
  data: {
    approval: {
      level1: { status, by, at },
      level2: { status, by, at }
    }
  }
}
```

**Logic:**
1. Verify password for specified level
2. Check current approval state
3. If level === 2 and level1.status !== "Approved", reject request
4. Update approval status with timestamp and user identifier
5. Return updated approval data

#### PATCH /api/builder-visits/:id/reject

**Request Body:**
```javascript
{
  password: String,   // Level-specific password
  level: Number,      // 1 or 2
  remarks: String     // Rejection reason (required)
}
```

**Response:**
```javascript
{
  success: Boolean,
  message: String,
  data: {
    approval: {
      level1: { status, by, at, remarks },
      level2: { status, by, at, remarks }
    }
  }
}
```

**Logic:**
1. Verify password for specified level
2. Validate remarks (not empty, minimum length)
3. If level === 2 and level1.status === "Approved":
   - Set level1.status = "Pending"
   - Clear level1 approval metadata
   - Set level2.status = "Rejected"
   - Store level2 rejection metadata and remarks
4. If level === 1:
   - Set level1.status = "Rejected"
   - Store level1 rejection metadata and remarks
   - Level 2 remains "Pending"
5. Return updated approval data

#### PATCH /api/builder-visits/:id (Enhanced)

Existing endpoint with approval reset logic:

**Additional Logic on Update:**
```javascript
// Reset approval status on any edit
updateData.approval = {
  level1: { status: "Pending", by: "", at: "", remarks: "" },
  level2: { status: "Pending", by: "", at: "", remarks: "" }
};
```

## Data Models

### Builder Visit Document

```javascript
{
  _id: ObjectId,
  builderName: String,
  projectName: String,
  // ... other form fields ...
  
  approval: {
    level1: {
      status: String,      // "Pending" | "Approved" | "Rejected"
      by: String,          // User identifier or email
      at: Date,            // Timestamp of action
      remarks: String      // Rejection reason (only when status is "Rejected")
    },
    level2: {
      status: String,      // "Pending" | "Approved" | "Rejected"
      by: String,          // User identifier or email
      at: Date,            // Timestamp of action
      remarks: String      // Rejection reason (only when status is "Rejected")
    }
  },
  
  createdAt: Date,
  updatedAt: Date
}
```

### Approval State Machine

**Valid State Transitions:**

```
Initial State: { L1: Pending, L2: Pending }

From { L1: Pending, L2: Pending }:
  → L1 Approve → { L1: Approved, L2: Pending }
  → L1 Reject  → { L1: Rejected, L2: Pending }

From { L1: Approved, L2: Pending }:
  → L2 Approve → { L1: Approved, L2: Approved } [FINAL]
  → L2 Reject  → { L1: Pending, L2: Rejected }

From { L1: Rejected, L2: Pending }:
  → Edit/Resubmit → { L1: Pending, L2: Pending }

From { L1: Pending, L2: Rejected }:
  → L1 Approve → { L1: Approved, L2: Rejected }
  → L1 Reject  → { L1: Rejected, L2: Rejected }
  → Edit/Resubmit → { L1: Pending, L2: Pending }

From { L1: Approved, L2: Rejected }:
  → L2 Approve → { L1: Approved, L2: Approved } [FINAL]
  → L2 Reject  → { L1: Pending, L2: Rejected }
  → Edit/Resubmit → { L1: Pending, L2: Pending }

From { L1: Rejected, L2: Rejected }:
  → Edit/Resubmit → { L1: Pending, L2: Pending }

From { L1: Approved, L2: Approved }:
  → Edit/Resubmit → { L1: Pending, L2: Pending }
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Initial State Consistency

*For any* newly submitted Builder Visit Card, both Level 1 and Level 2 approval status should be "Pending" with empty metadata fields.

**Validates: Requirements 1.1**

### Property 2: Level 2 Approval Requires Level 1 Approval

*For any* Builder Visit Card where Level 1 status is not "Approved", attempting Level 2 approval should fail and Level 2 status should remain "Pending".

**Validates: Requirements 1.4**

### Property 3: Level 2 Rejection Resets Level 1

*For any* Builder Visit Card where Level 1 status is "Approved" and Level 2 rejects, Level 1 status should transition to "Pending" and Level 2 status should be "Rejected".

**Validates: Requirements 2.1, 2.2**

### Property 4: Level 1 Rejection Preserves Level 2 Pending

*For any* Builder Visit Card, when Level 1 rejects, Level 2 status should remain "Pending".

**Validates: Requirements 3.2**

### Property 5: Rejection Requires Non-Empty Remarks

*For any* rejection attempt (Level 1 or Level 2) with empty or whitespace-only remarks, the rejection should fail and the status should remain unchanged.

**Validates: Requirements 4.3**

### Property 6: Rejection Stores Remarks

*For any* successful rejection (Level 1 or Level 2) with valid remarks, the remarks should be stored in the corresponding approval level object and be retrievable.

**Validates: Requirements 4.4, 4.5**

### Property 7: Edit Resets All Approval States

*For any* Builder Visit Card that is edited and resubmitted, both Level 1 and Level 2 status should be "Pending" with all metadata fields cleared.

**Validates: Requirements 5.1, 5.2, 5.3, 5.4**

### Property 8: Approval Records Metadata

*For any* successful approval action (Level 1 or Level 2), the system should record the approver identifier and timestamp in the corresponding approval level object.

**Validates: Requirements 6.1, 6.2, 6.3, 6.4**

### Property 9: Rejection Records Metadata

*For any* successful rejection action (Level 1 or Level 2), the system should record the rejector identifier, timestamp, and remarks in the corresponding approval level object.

**Validates: Requirements 6.5, 6.6**

### Property 10: Password Authentication Required

*For any* approval or rejection attempt without a valid password, the action should fail with an authentication error and the approval status should remain unchanged.

**Validates: Requirements 7.5**

### Property 11: Approval Button Visibility

*For any* Builder Visit Card where Level 1 status is "Pending", the UI should display Level 1 approval and rejection buttons but not Level 2 buttons.

**Validates: Requirements 8.3**

### Property 12: Level 2 Button Visibility After Level 1 Approval

*For any* Builder Visit Card where Level 1 status is "Approved" and Level 2 status is "Pending", the UI should display Level 2 approval and rejection buttons but not Level 1 buttons.

**Validates: Requirements 8.4**

## Error Handling

### Frontend Error Handling

1. **Network Errors**: Display user-friendly error messages and maintain current state
2. **Validation Errors**: Show inline validation messages for rejection remarks
3. **Authentication Errors**: Display "Invalid password" message and allow retry
4. **State Conflicts**: Refresh card data if server returns unexpected state

### Backend Error Handling

1. **Invalid State Transitions**: Return 400 Bad Request with descriptive error message
2. **Authentication Failures**: Return 401 Unauthorized
3. **Missing Required Fields**: Return 400 Bad Request with field validation errors
4. **Database Errors**: Return 500 Internal Server Error and log error details
5. **Concurrent Updates**: Use optimistic locking or atomic updates to prevent race conditions

### Error Response Format

```javascript
{
  success: false,
  error: String,           // User-facing error message
  code: String,            // Error code for client handling
  details: Object          // Additional error context (optional)
}
```

## Testing Strategy

### Unit Testing

Unit tests should focus on:
- Specific state transition examples (e.g., L1 Pending → L1 Approved)
- Edge cases (empty remarks, whitespace-only remarks)
- Error conditions (invalid passwords, invalid state transitions)
- UI component rendering for different approval states

### Property-Based Testing

Property-based tests should verify universal properties across all inputs using a PBT library (fast-check for JavaScript/TypeScript). Each test should run a minimum of 100 iterations.

**Test Configuration:**
- Library: fast-check (npm package)
- Iterations per test: 100 minimum
- Tag format: `// Feature: two-level-approval-workflow, Property {N}: {property text}`

**Property Test Coverage:**
- Property 1-12 as defined in Correctness Properties section
- Each property should be implemented as a separate test
- Generate random approval states and verify invariants hold

**Example Property Test Structure:**
```javascript
// Feature: two-level-approval-workflow, Property 7: Edit Resets All Approval States
test('editing a card resets all approval states', () => {
  fc.assert(
    fc.property(
      fc.record({
        approval: fc.record({
          level1: approvalStateArbitrary,
          level2: approvalStateArbitrary
        })
      }),
      (card) => {
        const updated = handleEdit(card);
        return updated.approval.level1.status === "Pending" &&
               updated.approval.level2.status === "Pending" &&
               updated.approval.level1.by === "" &&
               updated.approval.level2.by === "";
      }
    ),
    { numRuns: 100 }
  );
});
```

### Integration Testing

Integration tests should verify:
- End-to-end approval workflows through API
- Database state consistency after operations
- Frontend-backend interaction for approval actions
- Modal interactions and form submissions

### Manual Testing Checklist

- Verify rejection modal appears and validates remarks
- Test all state transitions in the state machine
- Verify visual status indicators update correctly
- Test password authentication for both levels
- Verify edit functionality resets approval states
- Check that rejection remarks display on cards
