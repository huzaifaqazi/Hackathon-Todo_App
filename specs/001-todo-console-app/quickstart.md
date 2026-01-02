# Quickstart Guide: Todo In-Memory Python Console App

## Prerequisites

- Python 3.13 or higher
- UV package manager (for fast dependency management)

## Installation

1. **Clone or create the project directory**
   ```bash
   mkdir todo-app && cd todo-app
   ```

2. **Install UV package manager** (if not already installed)
   ```bash
   pip install uv
   # Or install via other methods: https://github.com/astral-sh/uv
   ```

3. **Create the project structure**
   ```bash
   # Create the basic project structure
   mkdir -p src/todo_app/{models,services,cli,utils} tests/{unit,integration}
   touch src/todo_app/__init__.py
   touch src/todo_app/models/__init__.py
   touch src/todo_app/services/__init__.py
   touch src/todo_app/cli/__init__.py
   touch src/todo_app/utils/__init__.py
   touch tests/conftest.py
   ```

4. **Create pyproject.toml**
   ```toml
   [project]
   name = "todo-app"
   version = "0.1.0"
   description = "A console-based todo application with in-memory storage"
   authors = [{name = "Developer", email = "dev@example.com"}]
   requires-python = ">=3.13"
   dependencies = []

   [project.scripts]
   todo = "main:main"

   [tool.uv]
   dev-dependencies = [
       "pytest>=8.0.0",
       "pytest-cov>=4.0.0"
   ]
   ```

## Setting up the Environment

1. **Initialize the project with UV**
   ```bash
   uv init
   ```

2. **Install dependencies**
   ```bash
   uv sync --dev
   # Or install only production dependencies
   uv pip install -e .
   ```

3. **Activate the virtual environment**
   ```bash
   source .venv/bin/activate  # On Linux/macOS
   # or
   .venv\Scripts\activate     # On Windows
   ```

## Running the Application

1. **Direct execution**
   ```bash
   python src/main.py
   ```

2. **Using the installed command**
   ```bash
   todo
   ```

3. **With command-line arguments**
   ```bash
   python src/main.py add --title "My Task" --description "Task description"
   python src/main.py list
   python src/main.py complete --id 1
   python src/main.py update --id 1 --title "Updated Task"
   python src/main.py delete --id 1
   ```

## Available Commands

### Add a Task
```bash
python src/main.py add --title "Task Title" --description "Task Description"
```

### List All Tasks
```bash
python src/main.py list
```

### Update a Task
```bash
python src/main.py update --id 1 --title "New Title" --description "New Description"
```

### Mark Task as Complete
```bash
python src/main.py complete --id 1
```

### Mark Task as Incomplete
```bash
python src/main.py incomplete --id 1
```

### Delete a Task
```bash
python src/main.py delete --id 1
```

## Running Tests

1. **Run all tests**
   ```bash
   uv run pytest
   ```

2. **Run specific test file**
   ```bash
   uv run pytest tests/unit/test_task.py
   ```

3. **Run with coverage**
   ```bash
   uv run pytest --cov=src/todo_app
   ```

## Development Workflow

1. **Make changes to source files**
2. **Run tests to verify functionality**
   ```bash
   uv run pytest
   ```
3. **Run the application to test manually**
   ```bash
   python src/main.py [command]
   ```

## Project Structure

```
todo-app/
├── src/
│   └── todo_app/
│       ├── __init__.py
│       ├── models/
│       │   ├── __init__.py
│       │   └── task.py
│       ├── services/
│       │   ├── __init__.py
│       │   └── todo_service.py
│       ├── cli/
│       │   ├── __init__.py
│       │   └── cli.py
│       └── utils/
│           ├── __init__.py
│           └── validators.py
├── tests/
│   ├── unit/
│   ├── integration/
│   └── conftest.py
├── main.py
├── pyproject.toml
└── README.md
```

## Environment Variables (if any)

No environment variables required for this application.

## Troubleshooting

- **Command not found**: Ensure you've installed the package with `uv pip install -e .`
- **Python version error**: Ensure you're using Python 3.13 or higher
- **Dependency issues**: Try running `uv sync --refresh` to refresh dependencies