<!-- SYNC IMPACT REPORT
Version change: 1.0.0 → 1.1.0
Modified principles: [PRINCIPLE_1_NAME] → "Strict Spec-Driven Development", [PRINCIPLE_2_NAME] → "Incremental Evolution Across 5 Phases", [PRINCIPLE_3_NAME] → "AI-First and Cloud-Native Architecture", [PRINCIPLE_4_NAME] → "Natural Language Interaction for Task Management", [PRINCIPLE_5_NAME] → "Production-Grade Engineering Practices"
Added sections: Core Principles 6 (Manual Code Prohibition), Additional Constraints, Development Workflow
Removed sections: None
Templates requiring updates:
- .specify/templates/plan-template.md ✅ updated
- .specify/templates/spec-template.md ✅ updated
- .specify/templates/tasks-template.md ✅ updated
- .specify/templates/commands/*.md ⚠ pending
Follow-up TODOs: None
-->

# Hackathon II – The Evolution of Todo: Mastering Spec-Driven Development & Cloud Native AI Constitution

## Core Principles

### Strict Spec-Driven Development (NON-NEGOTIABLE)
All features must be implemented via Claude Code CLI only; No feature implementation without an approved Spec; Specs must be refined iteratively until Claude Code generates correct output; Every phase must have its own Markdown Constitution and detailed Spec

### Incremental Evolution Across 5 Phases
Incremental evolution across all 5 phases; Phases III, IV, and V must include an AI chatbot using OpenAI ChatKit, OpenAI Agents SDK, and Official MCP SDK; Phases IV and V must be deployed on Local Kubernetes (Minikube) and Cloud Kubernetes (DigitalOcean DOKS)

### AI-First and Cloud-Native Architecture
AI-first and cloud-native architecture; Kubernetes manifests must follow cloud-native best practices; Use only free-tier or hackathon-acceptable tooling

### Natural Language Interaction for Task Management
Natural language interaction for task management; Conversational AI must correctly interpret and execute user intent; AI chatbot can manage Todo items via natural language commands (e.g., rescheduling, updating, deleting tasks)

### Production-Grade Engineering Practices Suitable for Hackathon Demo
Production-grade engineering practices suitable for a hackathon demo; Focus on correctness, clarity, and demonstrability over extra features; Project is ready for hackathon evaluation and live demo

### Manual Code Writing Prohibition
Manual code writing is strictly prohibited; Only Claude Code-generated implementations are allowed; All 5 phases must be completed end-to-end

## Additional Constraints
- All features must be implemented via Claude Code CLI only
- Specs must be refined iteratively until Claude Code generates correct output
- No feature implementation without an approved Spec
- Phases III, IV, and V must include an AI chatbot using OpenAI ChatKit, OpenAI Agents SDK, and Official MCP SDK
- Phases IV and V must be deployed on Local Kubernetes (Minikube) and Cloud Kubernetes (DigitalOcean DOKS)
- Use only free-tier or hackathon-acceptable tooling
- Focus on correctness, clarity, and demonstrability over extra features

## Development Workflow
- Every phase must have its own Markdown Constitution and detailed Spec
- All features must be implemented via Claude Code CLI only
- Specs must be refined iteratively until Claude Code generates correct output
- No feature implementation without an approved Spec
- Conversational AI must correctly interpret and execute user intent
- Kubernetes manifests must follow cloud-native best practices

## Governance
All implementations must follow Spec-Driven Development practices; Amendments to this constitution require documentation of changes and justification; All development must adhere to Claude Code CLI usage and avoid manual coding; Success is measured by completing all 5 phases with working implementations and successful deployment.

All PRs/reviews must verify compliance with Spec-Driven Development; Complexity must be justified with clear requirements; Use this Constitution for guidance on development practices and project constraints.

**Version**: 1.1.0 | **Ratified**: 2025-12-30 | **Last Amended**: 2025-12-30