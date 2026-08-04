# ADR-001: Modular Monolith Architecture

## Status
Accepted

## Context
The system must support multi-tenant SaaS growth while keeping code ownership clear, testable, and easy to split later if needed.

## Decision
Use a Modular Monolith with explicit domain modules under `app/Modules` and shared infrastructure under `app/Support`.

## Why Modular Monolith
- Keeps deployment simple in early stages
- Reduces distributed-system complexity
- Preserves bounded contexts and clear domain ownership
- Allows later extraction into services if scale demands it

## Why Service Layer
- Keeps controllers thin
- Centralizes business rules
- Improves reuse across HTTP, jobs, and CLI contexts

## Why Repository Pattern
- Decouples domain logic from persistence
- Makes swapping/query optimization easier
- Simplifies testing by allowing mockable contracts

## Why DTO
- Prevents controllers from passing loose arrays everywhere
- Defines explicit input/output contracts
- Reduces accidental coupling to Eloquent models

## Why Event Listener
- Separates side effects from core use cases
- Supports async-ready architecture
- Makes audit logging, notifications, and projections easier to extend

## Consequences
- Slightly more upfront structure
- Better maintainability and clearer ownership
- Modules can evolve independently without turning the app into a distributed system too early
