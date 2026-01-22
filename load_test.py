"""
Load testing script for the Todo application
Tests the performance and scalability of the API under concurrent load
"""

import asyncio
import aiohttp
import time
import json
from typing import List, Tuple


class LoadTester:
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.session = None

    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()

    async def register_user(self, email: str, password: str) -> dict:
        """Register a new user"""
        url = f"{self.base_url}/api/v1/auth/register"
        data = {
            "email": email,
            "password": password,
            "first_name": "Load",
            "last_name": "Test"
        }

        async with self.session.post(url, json=data) as response:
            return await response.json()

    async def login_user(self, email: str, password: str) -> dict:
        """Login a user and return the token"""
        url = f"{self.base_url}/api/v1/auth/login"
        data = {
            "email": email,
            "password": password
        }

        async with self.session.post(url, json=data) as response:
            return await response.json()

    async def create_task(self, token: str, title: str, description: str = "") -> dict:
        """Create a task with authentication"""
        url = f"{self.base_url}/api/v1/tasks"
        headers = {"Authorization": f"Bearer {token}"}
        data = {
            "title": title,
            "description": description,
            "status": "pending",
            "priority": "medium"
        }

        async with self.session.post(url, json=data, headers=headers) as response:
            return await response.json()

    async def get_tasks(self, token: str) -> dict:
        """Get all tasks for the authenticated user"""
        url = f"{self.base_url}/api/v1/tasks"
        headers = {"Authorization": f"Bearer {token}"}

        async with self.session.get(url, headers=headers) as response:
            return await response.json()

    async def run_concurrent_requests(self, num_requests: int, coro_func, *args) -> List[Tuple[float, dict]]:
        """Run multiple concurrent requests and measure response times"""
        start_time = time.time()
        tasks = [coro_func(*args) for _ in range(num_requests)]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        end_time = time.time()

        total_time = end_time - start_time
        return [(total_time, result) for result in results]

    async def run_load_test(self, num_users: int = 10, tasks_per_user: int = 5):
        """Run a comprehensive load test"""
        print(f"Starting load test with {num_users} users, {tasks_per_user} tasks per user")

        # Create users concurrently
        print("Creating users...")
        users_data = []
        for i in range(num_users):
            email = f"loadtest_user_{i}@example.com"
            password = "SecurePassword123!"
            users_data.append((email, password))

        # Register all users concurrently
        registration_start = time.time()
        registration_results = await asyncio.gather(
            *[self.register_user(email, password) for email, password in users_data]
        )
        registration_end = time.time()

        print(f"Registration completed in {registration_end - registration_start:.2f}s")

        # Login all users and get tokens
        print("Logging in users...")
        login_start = time.time()
        login_results = await asyncio.gather(
            *[self.login_user(email, password) for email, password in users_data]
        )
        login_end = time.time()

        # Extract tokens
        tokens = [result.get("data", {}).get("token") for result in login_results if isinstance(result, dict)]

        print(f"Login completed in {login_end - login_start:.2f}s")

        # Create tasks concurrently for each user
        print("Creating tasks...")
        create_tasks_start = time.time()

        create_task_coroutines = []
        for i, token in enumerate(tokens):
            if token:  # Only proceed if login was successful
                for j in range(tasks_per_user):
                    title = f"Load Test Task {i}-{j}"
                    description = f"Task {j} for user {i} in load test"
                    create_task_coroutines.append(self.create_task(token, title, description))

        create_task_results = await asyncio.gather(*create_task_coroutines, return_exceptions=True)
        create_tasks_end = time.time()

        successful_creations = sum(1 for result in create_task_results
                                  if isinstance(result, dict) and result.get("success"))

        print(f"Task creation completed in {create_tasks_end - create_tasks_start:.2f}s")
        print(f"Successfully created {successful_creations}/{len(create_task_coroutines)} tasks")

        # Get tasks for each user
        print("Retrieving tasks...")
        get_tasks_start = time.time()

        get_task_coroutines = []
        for token in tokens:
            if token:
                get_task_coroutines.append(self.get_tasks(token))

        get_task_results = await asyncio.gather(*get_task_coroutines, return_exceptions=True)
        get_tasks_end = time.time()

        successful_retrievals = sum(1 for result in get_task_results
                                   if isinstance(result, dict) and result.get("success"))

        print(f"Task retrieval completed in {get_tasks_end - get_tasks_start:.2f}s")
        print(f"Successfully retrieved {successful_retrievals}/{len(get_task_coroutines)} task lists")

        # Calculate and print statistics
        total_requests = len(registration_results) + len(login_results) + len(create_task_coroutines) + len(get_task_coroutines)
        total_time = (registration_end - registration_start +
                     login_end - login_start +
                     create_tasks_end - create_tasks_start +
                     get_tasks_end - get_tasks_start)

        print(f"\nLoad Test Results:")
        print(f"- Total requests: {total_requests}")
        print(f"- Total time: {total_time:.2f}s")
        print(f"- Requests per second: {total_requests / total_time:.2f}")
        print(f"- Successful task creations: {successful_creations}/{len(create_task_coroutines)}")
        print(f"- Successful task retrievals: {successful_retrievals}/{len(get_task_coroutines)}")


async def main():
    # Configuration
    BASE_URL = "http://localhost:8002"  # Adjust this to your API URL

    async with LoadTester(BASE_URL) as tester:
        await tester.run_load_test(num_users=5, tasks_per_user=3)


if __name__ == "__main__":
    asyncio.run(main())