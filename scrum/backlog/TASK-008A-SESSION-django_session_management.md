# Task TASK-008A-SESSION: Django Session Management

## State: Sprint

## Story Points: 2

## Priority: High

## Stack: Backend

## Dependencies: None

**As a** Django application
**I want** robust session management for guest users
**So that** guest user features like shopping cart work reliably

## Acceptance Criteria

-   [ ] Django session middleware properly configured
-   [ ] Database-backed session storage (django_session table)
-   [ ] Session expiration set to 2 weeks for guest users
-   [ ] Session cleanup management command
-   [ ] Session utilities for cart and other features
-   [ ] CORS configuration updated for session cookies
-   [ ] Session security settings configured

## Technical Requirements

### Django Settings Configuration

-   `SESSION_ENGINE` = 'django.contrib.sessions.backends.db'
-   `SESSION_COOKIE_AGE` = 2 weeks
-   `SESSION_COOKIE_HTTPONLY` = True
-   `SESSION_COOKIE_SECURE` = True (production)
-   `SESSION_COOKIE_SAMESITE` = 'Lax'
-   `SESSION_SAVE_EVERY_REQUEST` = False

### Middleware Setup

-   Ensure `SessionMiddleware` is properly positioned
-   Configure with CORS for frontend requests

### Database Migration

-   Create django_session table via migration
-   Ensure proper indexes for performance

### Management Commands

-   Configure or create session cleanup command
-   Document session maintenance procedures

## Definition of Done

-   [ ] Sessions working for anonymous users
-   [ ] Session cookies properly set and retrieved
-   [ ] Session expiration working correctly
-   [ ] Database storage functional
-   [ ] CORS configured for session cookies
-   [ ] Session cleanup strategy implemented
-   [ ] Configuration documented
