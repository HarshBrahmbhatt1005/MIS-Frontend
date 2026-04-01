# Requirements Document

## Introduction

This document specifies the requirements for a two-level approval workflow system for the Builder Visit Form (Project Login Form). The system manages a sequential approval process where Level 1 approval must occur before Level 2 can approve, with proper state management for rejections, edits, and re-submissions.

## Glossary

- **Approval_System**: The two-level approval workflow component that manages approval states and transitions
- **Builder_Visit_Card**: A submitted form entry containing project details that requires approval
- **Level_1_Approver**: A user authorized to perform first-level approval or rejection
- **Level_2_Approver**: A user authorized to perform second-level approval or rejection after Level 1 approval
- **Approval_Status**: The state of an approval level (Pending, Approved, or Rejected)
- **Rejection_Remarks**: Text explanation provided when rejecting a card
- **Status_Reset**: The action of returning approval statuses to Pending state

## Requirements

### Requirement 1: Sequential Two-Level Approval Flow

**User Story:** As a system administrator, I want a sequential two-level approval process, so that cards are reviewed by appropriate authority levels before final approval.

#### Acceptance Criteria

1. WHEN a Builder_Visit_Card is initially submitted, THE Approval_System SHALL set both Level 1 and Level 2 status to "Pending"
2. WHEN Level_1_Approver attempts to approve, THE Approval_System SHALL update Level 1 status to "Approved" and maintain Level 2 status as "Pending"
3. WHEN Level_2_Approver attempts to approve AND Level 1 status is "Approved", THE Approval_System SHALL update Level 2 status to "Approved"
4. WHEN Level_2_Approver attempts to approve AND Level 1 status is NOT "Approved", THE Approval_System SHALL reject the approval request and maintain Level 2 status as "Pending"(This is not possible as level 2 can only have the option to approve after level 1)
5. WHEN both Level 1 and Level 2 status are "Approved", THE Approval_System SHALL mark the Builder_Visit_Card as fully approved

### Requirement 2: Level 2 Rejection Triggers Level 1 Reset

**User Story:** As a Level 1 approver, I want Level 1 status to reset when Level 2 rejects a card, so that I can re-review the card after Level 2 concerns are addressed.

#### Acceptance Criteria

1. WHEN Level_2_Approver rejects a Builder_Visit_Card AND Level 1 status is "Approved", THE Approval_System SHALL set Level 1 status to "Pending"
2. WHEN Level_2_Approver rejects a Builder_Visit_Card, THE Approval_System SHALL set Level 2 status to "Rejected"
3. WHEN Level 1 status is reset to "Pending" due to Level 2 rejection, THE Approval_System SHALL preserve the Level 2 rejection status and remarks

### Requirement 3: Level 1 Rejection Handling

**User Story:** As a Level 1 approver, I want to reject cards that don't meet initial criteria, so that inappropriate submissions are stopped early in the workflow.

#### Acceptance Criteria

1. WHEN Level_1_Approver rejects a Builder_Visit_Card, THE Approval_System SHALL set Level 1 status to "Rejected"
2. WHEN Level 1 status is "Rejected", THE Approval_System SHALL maintain Level 2 status as "Pending"
3. WHEN Level 1 status is "Rejected", THE Approval_System SHALL prevent Level_2_Approver from approving or rejecting until Level 1 status changes

### Requirement 4: Mandatory Rejection Remarks

**User Story:** As a card submitter, I want to see why my card was rejected, so that I can address the issues and resubmit.

#### Acceptance Criteria

1. WHEN Level_1_Approver initiates rejection, THE Approval_System SHALL display a text input field for Rejection_Remarks
2. WHEN Level_2_Approver initiates rejection, THE Approval_System SHALL display a text input field for Rejection_Remarks
3. WHEN Rejection_Remarks are empty AND approver attempts to confirm rejection, THE Approval_System SHALL prevent the rejection and display an error message
4. WHEN Rejection_Remarks are provided AND rejection is confirmed, THE Approval_System SHALL store the remarks with the rejection status
5. WHEN a Builder_Visit_Card has rejection status, THE Approval_System SHALL display the Rejection_Remarks on the card

### Requirement 5: Edit and Resubmission Workflow

**User Story:** As a card submitter, I want to edit and resubmit rejected cards, so that I can correct issues and restart the approval process.

#### Acceptance Criteria

1. WHEN a Builder_Visit_Card is edited and resubmitted, THE Approval_System SHALL reset Level 1 status to "Pending"
2. WHEN a Builder_Visit_Card is edited and resubmitted, THE Approval_System SHALL reset Level 2 status to "Pending"
3. WHEN a Builder_Visit_Card is edited and resubmitted, THE Approval_System SHALL clear all previous Rejection_Remarks
4. WHEN a Builder_Visit_Card is edited and resubmitted, THE Approval_System SHALL clear approval timestamps and approver identifiers

### Requirement 6: Approval Status Tracking

**User Story:** As a system administrator, I want to track who approved or rejected cards and when, so that I can maintain an audit trail.

#### Acceptance Criteria

1. WHEN Level_1_Approver approves a card, THE Approval_System SHALL record the approver identifier in Level 1 approval data
2. WHEN Level_1_Approver approves a card, THE Approval_System SHALL record the approval timestamp in Level 1 approval data
3. WHEN Level_2_Approver approves a card, THE Approval_System SHALL record the approver identifier in Level 2 approval data
4. WHEN Level_2_Approver approves a card, THE Approval_System SHALL record the approval timestamp in Level 2 approval data
5. WHEN an approver rejects a card, THE Approval_System SHALL record the rejector identifier with the rejection status
6. WHEN an approver rejects a card, THE Approval_System SHALL record the rejection timestamp with the rejection status

### Requirement 7: Password-Based Authorization

**User Story:** As a system administrator, I want approval and rejection actions to require password authentication, so that only authorized users can perform these actions.

#### Acceptance Criteria

1. WHEN Level_1_Approver attempts to approve, THE Approval_System SHALL prompt for Level 1 approval password
2. WHEN Level_1_Approver attempts to reject, THE Approval_System SHALL prompt for Level 1 approval password
3. WHEN Level_2_Approver attempts to approve, THE Approval_System SHALL prompt for Level 2 approval password
4. WHEN Level_2_Approver attempts to reject, THE Approval_System SHALL prompt for Level 2 approval password
5. WHEN an incorrect password is provided, THE Approval_System SHALL reject the action and display an authentication error
6. WHEN a correct password is provided, THE Approval_System SHALL execute the requested approval or rejection action

### Requirement 8: Visual Status Indication

**User Story:** As a user viewing cards, I want to see approval status clearly indicated, so that I can quickly understand the current state of each card.

#### Acceptance Criteria

1. WHEN displaying a Builder_Visit_Card, THE Approval_System SHALL show Level 1 status with visual distinction for Pending, Approved, and Rejected states
2. WHEN displaying a Builder_Visit_Card, THE Approval_System SHALL show Level 2 status with visual distinction for Pending, Approved, and Rejected states
3. WHEN Level 1 status is "Pending", THE Approval_System SHALL display Level 1 and Level 2 approval buttons
4. WHEN Level 1 status is "Approved" AND Level 2 status is "Pending", THE Approval_System SHALL display Level 2 approval buttons
5. WHEN both levels are "Approved", THE Approval_System SHALL hide approval action buttons
