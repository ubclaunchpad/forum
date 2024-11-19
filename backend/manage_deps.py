"""Script to manage project dependencies and virtual environment."""

import argparse
import subprocess
import sys
from pathlib import Path


def run_command(command, check=True):
    """Run a command and print its output."""
    print(f"Running: {' '.join(command)}")
    result = subprocess.run(command, check=check, text=True, capture_output=True)
    if result.stdout:
        print(result.stdout)
    if result.stderr:
        print(result.stderr, file=sys.stderr)
    return result


def add_package(package_name: str, dev: bool = False):
    """Add a new package to requirements."""
    # Install the package
    run_command([sys.executable, "-m", "pip", "install", package_name])

    # Determine target file
    req_file = "dev-requirements.in" if dev else "requirements.in"

    # Add to requirements.in
    with open(req_file, "a") as f:
        f.write(f"\n{package_name}\n")

    # Recompile requirements files
    if dev:
        run_command(
            [sys.executable, "-m", "piptools", "compile", "dev-requirements.in"]
        )
    run_command([sys.executable, "-m", "piptools", "compile", "requirements.in"])

    print(f"Added {package_name} to {req_file} and recompiled requirements")


def sync_requirements():
    """Synchronize installed packages with requirements files."""
    # Install/upgrade pip-tools
    run_command([sys.executable, "-m", "pip", "install", "--upgrade", "pip-tools"])

    # Sync both requirements
    run_command([sys.executable, "-m", "piptools", "sync", "requirements.txt"])
    if Path("dev-requirements.txt").exists():
        run_command([sys.executable, "-m", "piptools", "sync", "dev-requirements.txt"])


def main():
    parser = argparse.ArgumentParser(description="Manage project dependencies")
    subparsers = parser.add_subparsers(dest="command", help="Commands")

    # Add package command
    add_parser = subparsers.add_parser("add", help="Add a new package")
    add_parser.add_argument("package", help="Package name to add")
    add_parser.add_argument(
        "--dev", action="store_true", help="Add as development dependency"
    )

    # Sync command
    subparsers.add_parser(
        "sync", help="Synchronize installed packages with requirements"
    )

    args = parser.parse_args()

    if args.command == "add":
        add_package(args.package, args.dev)
    elif args.command == "sync":
        sync_requirements()
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
