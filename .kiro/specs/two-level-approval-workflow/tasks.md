# Implementation Plan: Two-Level Approval Workflow

## Overview

This implementation plan converts the two-level approval workflow design into actionable coding tasks. The implementation will enhance the existing Builder Visit Form with proper state management for sequential approvals, mandatory rejection remarks, and automatic state resets when Level 2 rejects after Level 1 approval.

## Tasks

- [x] 1. Create RejectionModal component
  - Create new file `src/components/RejectionModal.jsx`
  - Implement modal UI with text area for remarks input
  - Add validation for non-empty remarks (minimum 10 characters)
  - Include confirm and cancel buttons
  - Add CSS styling in `src/css/RejectionModal.css`
  - _Requirements: 4.1, 4.2, 4.3_

- [ ]* 1.1 Write property test for rejection remarks validation
  - **Property 5: Rejection Requires Non-Empty Remarks**
  - **Validates: Requirements 4.3**

- [ ] 2. Update BuilderVisitForm component state management
  - [x] 2.1 Add rejectionModal state to BuilderVisitForm component
    - Add state for modal visibility, visitId, level, and remarks
    - _Requirements: 4.1_
  
  - [x] 2.2 Implement handleRejectWithRemarks function
    - Open modal with appropriate level information
    - Initialize modal state with visitId and level
    - _Requirements: 4.1, 4.2_
  
  - [x] 2.3 Implement confirmRejection function
    - Validate remarks are not empty or whitespace-only
    - Call API with password, level, and remarks
    - Close modal and refresh visits on success
    - Display error message on validation failure
    - _Requirements: 4.3, 4.4_
  
  - [x] 2.4 Implement cancelRejection function
    - Close modal and clear remarks state
    - _Requirements: 4.1_

- [ ]* 2.5 Write property test for modal state management
  - **Property 11: Approval Button Visibility**
  - **Validates: Requirements 8.3**

- [ ] 3. Update backend approval endpoint logic
  - [x] 3.1 Enhance PATCH /api/builder-visits/:id/approve endpoint
    - Add validation to check Level 1 status before allowing Level 2 approval
    - Return 400 error if Level 2 attempts approval when Level 1 is not "Approved"
    - Record approver identifier and timestamp
    - _Requirements: 1.3, 1.4, 6.1, 6.2, 6.3, 6.4_
  
  - [ ]* 3.2 Write property test for Level 2 approval prerequisite
    - **Property 2: Level 2 Approval Requires Level 1 Approval**
    - **Validates: Requirements 1.4**

- [ ] 4. Implement backend rejection endpoint with state reset logic
  - [x] 4.1 Enhance PATCH /api/builder-visits/:id/reject endpoint
    - Add remarks parameter validation (required, non-empty, minimum length)
    - Implement Level 2 rejection logic: reset Level 1 to "Pending" when Level 1 was "Approved"
    - Implement Level 1 rejection logic: set Level 1 to "Rejected", keep Level 2 "Pending"
    - Store rejection remarks, rejector identifier, and timestamp
    - Return updated approval object in response
    - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 4.3, 4.4, 6.5, 6.6_
  
  - [ ]* 4.2 Write property test for Level 2 rejection reset
    - **Property 3: Level 2 Rejection Resets Level 1**
    - **Validates: Requirements 2.1, 2.2**
  
  - [ ]* 4.3 Write property test for Level 1 rejection behavior
    - **Property 4: Level 1 Rejection Preserves Level 2 Pending**
    - **Validates: Requirements 3.2**
  
  - [ ]* 4.4 Write property test for rejection metadata storage
    - **Property 9: Rejection Records Metadata**
    - **Validates: Requirements 6.5, 6.6**

- [ ] 5. Update frontend rejection handling
  - [x] 5.1 Modify handleReject function to use modal
    - Replace direct API call with handleRejectWithRemarks call
    - Remove inline prompt for remarks
    - _Requirements: 4.1, 4.2_
  
  - [x] 5.2 Update rejection button click handlers
    - Wire rejection buttons to handleRejectWithRemarks
    - Pass correct level parameter (1 or 2)
    - _Requirements: 4.1_
  
  - [x] 5.3 Add RejectionModal component to JSX
    - Import and render RejectionModal with appropriate props
    - Pass modal state and callback functions
    - _Requirements: 4.1_

- [ ] 6. Display rejection remarks on cards
  - [x] 6.1 Update visit card rendering to show rejection remarks
    - Display Level 1 rejection remarks when Level 1 status is "Rejected"
    - Display Level 2 rejection remarks when Level 2 status is "Rejected"
    - Style remarks with appropriate visual distinction
    - _Requirements: 4.5_
  
  - [ ]* 6.2 Write unit test for remarks display
    - Test that remarks appear when status is "Rejected"
    - Test that remarks are hidden when status is not "Rejected"
    - _Requirements: 4.5_

- [ ] 7. Verify and enhance edit/resubmit approval reset
  - [ ] 7.1 Confirm handleSubmit resets approval status
    - Verify existing code sets both levels to "Pending" on edit
    - Ensure remarks are cleared in approval reset
    - Ensure approver identifiers and timestamps are cleared
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  
  - [ ]* 7.2 Write property test for edit reset behavior
    - **Property 7: Edit Resets All Approval States**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4**

- [ ] 8. Update approval button visibility logic
  - [ ] 8.1 Implement conditional rendering for Level 1 buttons
    - Show Level 1 approve/reject buttons only when Level 1 status is "Pending"
    - Hide Level 2 buttons when Level 1 is not "Approved"
    - _Requirements: 8.3_
  
  - [ ] 8.2 Implement conditional rendering for Level 2 buttons
    - Show Level 2 approve/reject buttons only when Level 1 is "Approved" and Level 2 is "Pending"
    - _Requirements: 8.4_
  
  - [ ] 8.3 Hide all approval buttons when fully approved
    - Hide buttons when both Level 1 and Level 2 status are "Approved"
    - Keep Edit button visible
    - _Requirements: 8.5_
  
  - [ ]* 8.4 Write property test for button visibility rules
    - **Property 12: Level 2 Button Visibility After Level 1 Approval**
    - **Validates: Requirements 8.4**

- [ ] 9. Enhance visual status indicators
  - [ ] 9.1 Update CSS for approval status badges
    - Ensure distinct styling for Pending, Approved, and Rejected states
    - Add visual hierarchy for status information
    - _Requirements: 8.1, 8.2_
  
  - [ ] 9.2 Add status transition animations (optional)
    - Add smooth transitions when status changes
    - _Requirements: 8.1, 8.2_

- [ ] 10. Checkpoint - Ensure all tests pass
  - Run all unit tests and property-based tests
  - Verify approval state transitions work correctly
  - Test rejection remarks validation
  - Ensure all tests pass, ask the user if questions arise

- [ ]* 11. Write integration tests for complete workflows
  - [ ]* 11.1 Test complete approval flow (L1 approve → L2 approve)
    - Verify card reaches fully approved state
    - _Requirements: 1.1, 1.2, 1.3, 1.5_
  
  - [ ]* 11.2 Test Level 2 rejection reset flow (L1 approve → L2 reject → L1 reset)
    - Verify Level 1 returns to "Pending" after Level 2 rejection
    - _Requirements: 2.1, 2.2, 2.3_
  
  - [ ]* 11.3 Test edit and resubmit flow
    - Verify all approval states reset to "Pending" after edit
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  
  - [ ]* 11.4 Test password authentication for all actions
    - Verify correct passwords allow actions
    - Verify incorrect passwords reject actions
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [ ] 12. Final checkpoint - Complete system verification
  - Test all approval state transitions manually
  - Verify rejection remarks appear correctly
  - Test password authentication
  - Verify button visibility logic
  - Ensure all tests pass, ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties using fast-check library
- Unit tests validate specific examples and edge cases
- The existing approval reset logic in handleSubmit already handles Requirement 5, but should be verified
- Backend changes assume Node.js/Express API structure (adjust if using different framework)
